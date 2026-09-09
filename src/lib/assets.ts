import fs from 'node:fs';
import path from 'node:path';

/** Folders under public/ that real photography can live in. */
const ASSET_DIRS = ['images', 'assets'];
const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

/**
 * Resolves a requested asset filename to a real public path, or null when the
 * file hasn't been supplied yet.
 *
 * The design export, the dealer's photo pack and this codebase don't always
 * agree on the extension (`porta-front-34.webp` vs `porta-front-34.jpg`), so a
 * miss on the exact name falls back to the same basename with any known image
 * extension. Callers render a labelled placeholder when this returns null, so
 * dropping files into public/images/ lights them up with no code change.
 */
export function resolveAsset(filename?: string): string | null {
  if (!filename) return null;

  // Explicit public paths are already authoritative. This avoids stale
  // build-cache results when an image is added after an article was first
  // prerendered, while filename-only entries still retain placeholder checks.
  const directPublicPath = filename.trim();
  if (
    (directPublicPath.startsWith('/images/') || directPublicPath.startsWith('/assets/')) &&
    !directPublicPath.includes('..') &&
    directPublicPath.slice(1).split('/').length === 2
  ) {
    return directPublicPath;
  }

  // Captions sometimes carry a trailing note, e.g. "showroom.webp · แผนที่รอยืนยัน".
  const clean = filename.trim().split(/\s+/)[0];
  if (!clean || clean.includes('/') || clean.includes('..')) return null;

  for (const dir of ASSET_DIRS) {
    if (fs.existsSync(path.join(process.cwd(), 'public', dir, clean))) {
      return `/${dir}/${clean}`;
    }
  }

  const base = clean.replace(/\.[^.]+$/, '');
  for (const dir of ASSET_DIRS) {
    for (const ext of EXTENSIONS) {
      const candidate = `${base}.${ext}`;
      if (fs.existsSync(path.join(process.cwd(), 'public', dir, candidate))) {
        return `/${dir}/${candidate}`;
      }
    }
  }

  return null;
}

/** True when real photography exists for this filename. */
export function hasAsset(filename?: string): boolean {
  return resolveAsset(filename) !== null;
}
