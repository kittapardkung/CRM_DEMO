'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type CarColor = { name: string; code: string };

/** Side silhouette of a stylised MPV (x = length, y = height), extruded across the width. */
function bodyShape() {
  const s = new THREE.Shape();
  s.moveTo(-2.4, 0.42);
  s.lineTo(-2.42, 1.2);
  s.quadraticCurveTo(-2.4, 1.62, -1.95, 1.78);
  s.lineTo(0.85, 1.8);
  s.quadraticCurveTo(1.25, 1.78, 1.6, 1.3);
  s.quadraticCurveTo(1.75, 1.12, 2.2, 1.04);
  s.quadraticCurveTo(2.46, 0.98, 2.48, 0.7);
  s.lineTo(2.46, 0.42);
  s.lineTo(-2.4, 0.42);
  return s;
}

function glassShape() {
  const s = new THREE.Shape();
  s.moveTo(-2.05, 1.22);
  s.lineTo(-1.82, 1.7);
  s.lineTo(0.8, 1.72);
  s.quadraticCurveTo(1.15, 1.7, 1.45, 1.27);
  s.lineTo(-2.05, 1.22);
  return s;
}

/**
 * Prototype only: a procedurally modelled MPV, NOT the real DARION. It shows
 * what a rotating / re-colourable 3D car feels like on the page; a real .glb
 * would replace `buildCar()`.
 */
export default function CarDemo3D({ colors }: { colors: CarColor[] }) {
  const mount = useRef<HTMLDivElement>(null);
  const bodyMat = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const [colorIdx, setColorIdx] = useState(0);

  useEffect(() => {
    bodyMat.current?.color.set(colors[colorIdx].code);
  }, [colorIdx, colors]);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab';

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);

    const disposables: { dispose(): void }[] = [];
    const mat = (m: THREE.Material) => (disposables.push(m), m);
    const geo = <T extends THREE.BufferGeometry>(g: T) => (disposables.push(g), g);

    const car = new THREE.Group();
    const paint = new THREE.MeshPhysicalMaterial({
      color: colors[0].code,
      metalness: 0.55,
      roughness: 0.28,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });
    bodyMat.current = paint;
    disposables.push(paint);

    const body = new THREE.Mesh(
      geo(new THREE.ExtrudeGeometry(bodyShape(), { depth: 1.7, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 6, curveSegments: 24 })),
      paint,
    );
    body.position.z = -0.85;
    body.castShadow = true;
    const glass = new THREE.Mesh(
      geo(new THREE.ExtrudeGeometry(glassShape(), { depth: 1.9, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.05, bevelSegments: 3 })),
      mat(new THREE.MeshPhysicalMaterial({ color: 0x0b0f18, metalness: 0.1, roughness: 0.05, clearcoat: 1 })),
    );
    glass.position.z = -0.95;
    car.add(body, glass);

    const tire = mat(new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.85 }));
    const rim = mat(new THREE.MeshStandardMaterial({ color: 0xcfd3d8, metalness: 1, roughness: 0.25 }));
    const tireGeo = geo(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 32));
    const rimGeo = geo(new THREE.CylinderGeometry(0.28, 0.28, 0.32, 24));
    for (const x of [-1.55, 1.55]) {
      for (const z of [-0.88, 0.88]) {
        const w = new THREE.Group();
        w.add(new THREE.Mesh(tireGeo, tire), new THREE.Mesh(rimGeo, rim));
        w.rotation.x = Math.PI / 2;
        w.position.set(x, 0.42, z);
        car.add(w);
      }
    }
    const lamp = (x: number, z: number, color: number, w: number) => {
      const m = new THREE.Mesh(
        geo(new THREE.BoxGeometry(0.06, 0.1, w)),
        mat(new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.6 })),
      );
      m.position.set(x, color === 0xffffff ? 0.95 : 1.0, z);
      car.add(m);
    };
    for (const z of [-0.55, 0.55]) lamp(2.62, z, 0xffffff, 0.45);
    lamp(-2.55, 0, 0xff2a2a, 1.3);
    scene.add(car);

    const floor = new THREE.Mesh(
      geo(new THREE.CircleGeometry(5, 64)),
      mat(new THREE.ShadowMaterial({ opacity: 0.35 })),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const dist = w / h < 1 ? 17 : 12;
      camera.position.set(dist * 0.7, dist * 0.32, dist * 0.7);
      camera.lookAt(0, 0.9, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    let yaw = -0.5;
    const vel = 0.004;
    let dragging = false;
    let lastX = 0;
    const down = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      renderer.domElement.setPointerCapture(e.pointerId);
      renderer.domElement.style.cursor = 'grabbing';
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      yaw += (e.clientX - lastX) * 0.012;
      lastX = e.clientX;
    };
    const up = () => {
      dragging = false;
      renderer.domElement.style.cursor = 'grab';
    };
    renderer.domElement.addEventListener('pointerdown', down);
    renderer.domElement.addEventListener('pointermove', move);
    renderer.domElement.addEventListener('pointerup', up);
    renderer.domElement.addEventListener('pointercancel', up);

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!dragging && !reduce) yaw += vel;
      car.rotation.y = yaw;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      disposables.forEach((d) => d.dispose());
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      bodyMat.current = null;
    };
  }, [colors]);

  return (
    <div style={{ background: 'radial-gradient(120% 100% at 50% 80%, #1b3f6d 0%, #123156 45%, #0b1a38 100%)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div ref={mount} aria-label="ต้นแบบรถ 3 มิติ ลากเพื่อหมุน" role="img" style={{ height: 'min(70vh, 560px)' }} />
      <div style={{ padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center', color: '#fff' }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>ลากเพื่อหมุน · เลือกสี:</span>
        {colors.map((c, i) => (
          <button
            key={c.name}
            type="button"
            onClick={() => setColorIdx(i)}
            aria-pressed={i === colorIdx}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 6px', borderRadius: 999, cursor: 'pointer',
              background: 'transparent', color: '#fff', font: 'inherit', fontSize: 14,
              border: `1px solid ${i === colorIdx ? 'var(--wl-lime)' : 'rgba(255,255,255,0.3)'}`,
            }}
          >
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: c.code, border: '1px solid rgba(255,255,255,0.5)' }} />
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
