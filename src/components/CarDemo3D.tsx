'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildProceduralCar } from '@/lib/proceduralCar';

export type CarColor = { name: string; code: string };

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

    const built = buildProceduralCar(colors[0].code, true);
    const car = built.group;
    bodyMat.current = built.paint;
    disposables.push({ dispose: built.dispose });
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
