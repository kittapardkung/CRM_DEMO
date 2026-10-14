"""Cut the studio background out of the stand-in car photos (GrabCut) for the 3D showroom.

Usage: python3 scripts/make-cutouts.py [--strip-white] <image> [<image> ...]
Writes public/images/cutout-<name>.webp (same pixel size, so hotspot anchors stay valid).
Only the backdrop is removed; the vehicle pixels are untouched apart from a 1px edge feather.
"""
import sys, os
import cv2
import numpy as np

def cutout(path, out, strip_white=False):
    img = cv2.imread(path)
    h, w = img.shape[:2]
    mask = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
    # outer frame is background; the central region is "probably foreground"
    m = int(0.02 * w)
    mask[:] = cv2.GC_BGD
    mask[int(0.04 * h):int(0.97 * h), m:w - m] = cv2.GC_PR_BGD
    mask[int(0.12 * h):int(0.88 * h), int(0.07 * w):int(0.93 * w)] = cv2.GC_PR_FGD
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    hh_, ss_, vv_ = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    lime = (hh_ >= 25) & (hh_ <= 55) & (ss_ > 70) & (vv_ > 110)  # studio wall colour
    pale = (hh_ >= 25) & (hh_ <= 55) & (ss_ > 22) & (vv_ > 150)  # pale lime floor / reflection
    mask[lime | pale] = cv2.GC_BGD
    core = np.zeros((h, w), bool)
    core[int(0.15 * h):int(0.9 * h), int(0.05 * w):int(0.95 * w)] = True
    mask[(vv_ < 70) & core] = cv2.GC_FGD  # tyres, glass, grille are always car
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(img, mask, None, bgd, fgd, 8, cv2.GC_INIT_WITH_MASK)
    fg = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    # keep the largest blob, fill holes, smooth the edge
    n, lab, stats, _ = cv2.connectedComponentsWithStats(fg)
    if n > 1:
        big = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        fg = np.where(lab == big, 255, 0).astype(np.uint8)
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    inv = 255 - fg
    n, lab, stats, _ = cv2.connectedComponentsWithStats(inv)
    for i in range(1, n):  # fill interior holes (windows etc.)
        x, y, ww, hh, a = stats[i]
        if x > 0 and y > 0 and x + ww < w and y + hh < h:
            fg[lab == i] = 255
    fg = cv2.erode(fg, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    edge = cv2.dilate(fg, np.ones((15, 15), np.uint8)) - cv2.erode(fg, np.ones((15, 15), np.uint8))
    fg[(edge > 0) & lime] = 0  # drop leftover lime fringe at the silhouette
    # Everything under the tyres is studio floor / reflection: the showroom draws its own.
    dark_rows = np.where(((vv_ < 60) & core).sum(axis=1) >= 12)[0]
    if len(dark_rows):
        fg[min(h, dark_rows.max() + 10):, :] = 0
    if strip_white:  # dark cars only: the white studio floor under them is never car
        floor = (vv_ > 200) & (ss_ < 40)
        fg[(np.arange(h)[:, None] > int(0.6 * h)) & floor] = 0
    alpha = cv2.GaussianBlur(fg, (0, 0), 1.2)
    rgba = np.dstack([img, alpha])
    cv2.imwrite(out, rgba, [cv2.IMWRITE_WEBP_QUALITY, 92])
    return out

if __name__ == '__main__':
    args = sys.argv[1:]
    strip = '--strip-white' in args
    for p in [a for a in args if not a.startswith('--')]:
        name = os.path.splitext(os.path.basename(p))[0]
        print(cutout(p, f'public/images/cutout-{name}.webp', strip))
