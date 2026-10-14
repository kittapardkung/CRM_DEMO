let webglOk: boolean | null = null;

/** Client-only: should this device get the WebGL experience? `?mode=static|3d` overrides (for testing). */
export function detect3D(): 'static' | '3d' {
  const q = new URLSearchParams(location.search).get('mode');
  if (q === 'static' || q === '3d') return q;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'static';
  const nav = navigator as Navigator & { deviceMemory?: number };
  if ((nav.deviceMemory ?? 8) <= 2 || (nav.hardwareConcurrency ?? 8) <= 2) return 'static';
  if (webglOk === null) {
    try {
      const c = document.createElement('canvas');
      webglOk = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      webglOk = false;
    }
  }
  return webglOk ? '3d' : 'static';
}
