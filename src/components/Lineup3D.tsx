'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';

export type Lineup3DItem = {
  slug: string;
  name: string;
  tagline: string;
  /** Pre-formatted price line, e.g. "เริ่มต้น ฿659,000". */
  price: string;
  /** Resolved public image path, or null while the photo is missing. */
  src: string | null;
};

const STEP = 0.62; // radians between neighbouring cards on the arc
const RADIUS = 6;
const CARD_W = 3.8;
const CARD_H = 2.85;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Scroll-driven 3D showroom: the lineup sits on a curved arc in a WebGL scene
 * and the page scroll rotates the arc and dollies the camera. The cards are
 * photos for now — swap the card mesh for a loaded .glb per model later.
 *
 * The visible text is real DOM (not canvas) so it stays crawlable and
 * accessible; the canvas itself is decorative.
 */
export default function Lineup3D({ items }: { items: Lineup3DItem[] }) {
  const track = useRef<HTMLElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const trackEl = track.current;
    const mountEl = mount.current;
    if (!trackEl || !mountEl) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      trackEl.style.display = 'none'; // no WebGL: the static lineup grid below still covers it
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountEl.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    const arc = new THREE.Group();
    scene.add(arc);

    const loader = new THREE.TextureLoader();
    const disposables: { dispose(): void }[] = [];
    const cards = items.map((item, i) => {
      const pivot = new THREE.Group();
      const a = i * STEP;
      pivot.position.set(Math.sin(a) * RADIUS, 0, Math.cos(a) * RADIUS);
      pivot.rotation.y = a;

      const geo = new THREE.PlaneGeometry(CARD_W, CARD_H);
      const mat = new THREE.MeshBasicMaterial({ color: 0x2a3b5c });
      const mirrorMat = new THREE.MeshBasicMaterial({ color: 0x2a3b5c, transparent: true, opacity: 0.1 });
      disposables.push(geo, mat, mirrorMat);
      if (item.src) {
        loader.load(item.src, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          disposables.push(tex);
          mat.map = tex;
          mirrorMat.map = tex;
          mat.color.set(0xffffff);
          mirrorMat.color.set(0xffffff);
          mat.needsUpdate = true;
          mirrorMat.needsUpdate = true;
        });
      }
      const face = new THREE.Mesh(geo, mat);
      face.position.y = CARD_H / 2;
      const mirror = new THREE.Mesh(geo, mirrorMat);
      mirror.scale.y = -1;
      mirror.position.y = -CARD_H / 2 - 0.04;
      pivot.add(face, mirror);
      arc.add(pivot);
      return { mat, mirrorMat, pivot };
    });

    // Soft lime glow on the floor under the front card.
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 256;
    const g = glowCanvas.getContext('2d')!;
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(198,242,77,0.55)');
    grad.addColorStop(1, 'rgba(198,242,77,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const glowTex = new THREE.CanvasTexture(glowCanvas);
    const glowGeo = new THREE.PlaneGeometry(9, 9);
    const glowMat = new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false });
    disposables.push(glowTex, glowGeo, glowMat);
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(0, 0.01, RADIUS);
    scene.add(glow);

    const resize = () => {
      const w = mountEl.clientWidth;
      const h = mountEl.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Narrow screens: pull the camera back so the front card still fits.
      camera.userData.fit = camera.aspect < 1 ? 1.9 : camera.aspect < 1.4 ? 1.35 : 1;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mountEl);
    resize();

    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointer);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(trackEl);

    let progress = 0; // eased scroll progress, in cards
    let reported = 0;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;

      const rect = trackEl.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const target = clamp01(-rect.top / scrollable) * (items.length - 1);
      progress += (target - progress) * 0.09;

      arc.rotation.y = -progress * STEP;
      const dolly = Math.sin(clamp01(progress / (items.length - 1)) * Math.PI); // closer mid-scroll
      const fit = camera.userData.fit as number;
      camera.position.set(pointer.x * 0.5, 1.5 - pointer.y * 0.2, (RADIUS + 10.5 - dolly * 1.6) * fit);
      camera.lookAt(0, CARD_H / 2 - 0.55, RADIUS - 0.5);

      cards.forEach((c, i) => {
        const d = Math.abs(i - progress);
        const shade = 1 - Math.min(d, 1.6) * 0.38;
        c.mat.color.setScalar(shade);
        c.mirrorMat.opacity = 0.1 * shade;
        c.pivot.scale.setScalar(1 + (1 - Math.min(d, 1)) * 0.08);
      });

      const idx = Math.round(progress);
      if (idx !== reported) {
        reported = idx;
        setActive(idx);
      }
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [items]);

  const current = items[active];

  return (
    <section
      ref={track}
      aria-label="รถยนต์ WULING แบบ 3 มิติ"
      style={{
        position: 'relative',
        height: `${items.length * 90}vh`,
        margin: 'var(--space-4) 0',
        borderRadius: 'var(--radius-lg)',
        background: 'radial-gradient(120% 90% at 50% 70%, #1b3f6d 0%, #123156 45%, #0b1a38 100%)',
        clipPath: 'inset(0 round var(--radius-lg))',
      }}
    >
      <div style={{ position: 'sticky', top: 0, height: '100svh', overflow: 'hidden' }}>
        <div ref={mount} aria-hidden style={{ position: 'absolute', inset: 0 }} />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: 'clamp(20px,4vw,48px)',
            background: 'linear-gradient(to top, rgba(8,18,40,0.85), transparent)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 'var(--space-4)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ color: '#fff', maxWidth: '44ch' }}>
            <p style={{ margin: '0 0 6px', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--wl-lime)' }}>
              Lineup · {active + 1} / {items.length}
            </p>
            <h2 style={{ margin: '0 0 6px', fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px,3.2vw,38px)', lineHeight: 1.15, color: '#fff' }}>{current.name}</h2>
            <p style={{ margin: '0 0 6px', color: 'rgba(255,255,255,0.78)' }}>{current.tagline}</p>
            <p style={{ margin: 0, color: 'var(--wl-lime)', fontWeight: 600 }}>{current.price}</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <Link href={`/models/${current.slug}`} className="btn btn-primary">ดูรายละเอียด</Link>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>เลื่อนเพื่อดูรุ่นถัดไป ↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
