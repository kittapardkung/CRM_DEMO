'use client';

import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildProceduralCar } from '@/lib/proceduralCar';

type V3 = [number, number, number];
const X_CITY = 0;
const X_SERVICE = 100;
const X_SHOWROOM = 160;

interface Env { skyTop: string; skyBottom: string; fog: string; ambient: number; sun: number; lamps: number; head: number }
interface KF { p: number; car: { pos: V3; ry: number }; cam: { pos: V3; target: V3; fov: number }; env: Env }

const DUSK: Env = { skyTop: '#27437a', skyBottom: '#f0a066', fog: '#9a6f7e', ambient: 0.9, sun: 1.6, lamps: 0.35, head: 0.4 };
const NIGHT: Env = { skyTop: '#040a1b', skyBottom: '#14305c', fog: '#0a1a38', ambient: 0.35, sun: 0.5, lamps: 1, head: 1.6 };
const SERVICE: Env = { skyTop: '#101c30', skyBottom: '#1a2c48', fog: '#1b2a40', ambient: 1.25, sun: 0.9, lamps: 0, head: 0.6 };
const SHOW: Env = { skyTop: '#050c1c', skyBottom: '#0d2347', fog: '#0a1a33', ambient: 0.8, sun: 0.9, lamps: 0, head: 1.2 };

/** Scroll progress → car, camera and mood. Car and camera travel together through one continuous world. */
const KEYS: KF[] = [
  { p: 0, car: { pos: [4, 0, 0], ry: 0.55 }, cam: { pos: [11, 2.4, 9], target: [4, 1, 0], fov: 34 }, env: DUSK },
  { p: 0.2, car: { pos: [4, 0, 0], ry: 0.2 }, cam: { pos: [8.5, 1.8, 7.2], target: [4, 1, 0], fov: 34 }, env: DUSK },
  { p: 0.3, car: { pos: [12, 0, 0], ry: 0 }, cam: { pos: [12, 1.5, 8.5], target: [12, 1, 0], fov: 34 }, env: NIGHT },
  { p: 0.48, car: { pos: [40, 0, 0], ry: 0 }, cam: { pos: [40, 1.5, 8.5], target: [40, 1, 0], fov: 34 }, env: NIGHT },
  { p: 0.56, car: { pos: [X_SERVICE, 0.45, 0], ry: 0.5 }, cam: { pos: [X_SERVICE + 6, 2.4, 9], target: [X_SERVICE, 1.1, 0], fov: 34 }, env: SERVICE },
  { p: 0.72, car: { pos: [X_SERVICE, 0.45, 0], ry: -0.5 }, cam: { pos: [X_SERVICE - 3, 2, 8.5], target: [X_SERVICE, 1.1, 0], fov: 34 }, env: SERVICE },
  { p: 0.82, car: { pos: [X_SHOWROOM, 0, 0], ry: 0.6 }, cam: { pos: [X_SHOWROOM + 6, 2.2, 9], target: [X_SHOWROOM, 1, 0], fov: 34 }, env: SHOW },
  { p: 1, car: { pos: [X_SHOWROOM, 0, 0], ry: 0.15 }, cam: { pos: [X_SHOWROOM + 2.5, 1.9, 8], target: [X_SHOWROOM, 1, 0], fov: 34 }, env: SHOW },
];
const ease = (t: number) => t * t * (3 - 2 * t);
const l = THREE.MathUtils.lerp;
const lv = (a: V3, b: V3, t: number) => new THREE.Vector3(l(a[0], b[0], t), l(a[1], b[1], t), l(a[2], b[2], t));

function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Shared mood values, written once per frame by the Journey and read by the environments. */
class Mood {
  lamps = 0;
  setLamps(v: number) {
    this.lamps = v;
  }
}

function canvasTex(draw: (g: CanvasRenderingContext2D) => void, w = 64, h = 128, repeat = true) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function City({ mood }: { mood: Mood }) {
  const { facade, lit, lampMat, buildings } = useMemo(() => {
    const rnd = seeded(7);
    const rects: [number, number, boolean, boolean][] = [];
    for (let y = 0; y < 16; y++) for (let x = 0; x < 6; x++) rects.push([x, y, rnd() > 0.55, rnd() > 0.5]);
    const facade = canvasTex((g) => {
      g.fillStyle = '#1a2238';
      g.fillRect(0, 0, 64, 128);
      rects.forEach(([x, y, on]) => {
        g.fillStyle = on ? '#2b3b5e' : '#121a2c';
        g.fillRect(x * 10 + 2, y * 8 + 2, 7, 5);
      });
    });
    const lit = canvasTex((g) => {
      g.fillStyle = '#000';
      g.fillRect(0, 0, 64, 128);
      rects.forEach(([x, y, on, warm]) => {
        if (!on) return;
        g.fillStyle = warm ? '#ffd9a0' : '#bfe0ff';
        g.fillRect(x * 10 + 2, y * 8 + 2, 7, 5);
      });
    });
    const r2 = seeded(21);
    const buildings: { pos: V3; size: V3; mat: THREE.MeshStandardMaterial }[] = [];
    for (const side of [-1, 1]) {
      for (let x = -24; x < 78; x += 6) {
        const w = 4 + r2() * 3;
        const d = 5 + r2() * 4;
        const h = 7 + r2() * 22;
        const f = facade.clone();
        f.repeat.set(w / 6, h / 14);
        f.needsUpdate = true;
        const e = lit.clone();
        e.repeat.copy(f.repeat);
        e.needsUpdate = true;
        buildings.push({
          pos: [x + r2() * 2, h / 2, side * (13 + r2() * 10)],
          size: [w, h, d],
          mat: new THREE.MeshStandardMaterial({ map: f, emissiveMap: e, emissive: '#ffffff', emissiveIntensity: 0.3, roughness: 0.7 }),
        });
      }
    }
    return { facade, lit, lampMat: new THREE.MeshBasicMaterial({ color: '#ffe3a8' }), buildings };
  }, []);

  useFrame(() => {
    buildings.forEach((b) => (b.mat.emissiveIntensity = 0.15 + mood.lamps * 1.6));
    lampMat.color.setScalar(0.4 + mood.lamps * 0.6);
  });
  useEffect(
    () => () => {
      facade.dispose();
      lit.dispose();
      lampMat.dispose();
      buildings.forEach((b) => b.mat.dispose());
    },
    [facade, lit, lampMat, buildings],
  );

  const lamps = useMemo(() => {
    const out: V3[] = [];
    for (let x = -20; x < 76; x += 10) out.push([x, 0, 5.2], [x + 5, 0, -5.2]);
    return out;
  }, []);

  return (
    <group position={[X_CITY, 0, 0]}>
      <mesh rotation-x={-Math.PI / 2} position={[30, -0.02, 0]}>
        <planeGeometry args={[220, 90]} />
        <meshStandardMaterial color="#10151f" roughness={0.9} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[30, 0.08, s * 7]}>
          <boxGeometry args={[220, 0.16, 3]} />
          <meshStandardMaterial color="#262e44" roughness={0.8} />
        </mesh>
      ))}
      {Array.from({ length: 56 }, (_, i) => (
        <mesh key={i} position={[-24 + i * 2.8, 0.005, 0]}>
          <boxGeometry args={[1.5, 0.01, 0.16]} />
          <meshBasicMaterial color="#e8e8e0" />
        </mesh>
      ))}
      {buildings.map((b, i) => (
        <mesh key={i} position={b.pos} material={b.mat}>
          <boxGeometry args={b.size} />
        </mesh>
      ))}
      {lamps.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 2.2, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 4.4, 8]} />
            <meshStandardMaterial color="#2a3042" />
          </mesh>
          <mesh position={[0, 4.5, 0]} material={lampMat}>
            <sphereGeometry args={[0.22, 12, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function LabelPlane({ text, sub, w, h, position }: { text: string; sub?: string; w: number; h: number; position: V3 }) {
  const tex = useMemo(
    () =>
      canvasTex(
        (g) => {
          g.fillStyle = '#102a43';
          g.fillRect(0, 0, 1024, 256);
          g.fillStyle = '#b6e431';
          g.fillRect(0, 236, 1024, 20);
          g.fillStyle = '#fff';
          g.textBaseline = 'middle';
          g.font = '700 110px sans-serif';
          g.fillText(text, 48, sub ? 90 : 118);
          if (sub) {
            g.font = '500 70px sans-serif';
            g.fillText(sub, 48, 188);
          }
        },
        1024,
        256,
        false,
      ),
    [text, sub],
  );
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh position={position}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

function ServiceCenter() {
  return (
    <group position={[X_SERVICE, 0, 0]}>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[44, 34]} />
        <meshStandardMaterial color="#9aa3b0" roughness={0.35} metalness={0.1} />
      </mesh>
      {/* walls + ceiling */}
      <mesh position={[0, 4.5, -12]}>
        <boxGeometry args={[44, 9, 0.3]} />
        <meshStandardMaterial color="#e6eaf0" roughness={0.8} />
      </mesh>
      {[-22, 22].map((x) => (
        <mesh key={x} position={[x, 4.5, 0]}>
          <boxGeometry args={[0.3, 9, 34]} />
          <meshStandardMaterial color="#dde2ea" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 9, 0]}>
        <boxGeometry args={[44, 0.3, 34]} />
        <meshStandardMaterial color="#cfd5de" />
      </mesh>
      <mesh position={[0, 0.7, -11.8]}>
        <boxGeometry args={[44, 1.4, 0.2]} />
        <meshStandardMaterial color="#102a43" />
      </mesh>
      <mesh position={[0, 1.5, -11.75]}>
        <boxGeometry args={[44, 0.12, 0.2]} />
        <meshBasicMaterial color="#b6e431" />
      </mesh>
      {/* garage shutters */}
      {[-12, 0, 12].map((x) => (
        <group key={x} position={[x, 0, -11.8]}>
          <mesh position={[0, 3.2, 0]}>
            <boxGeometry args={[8, 4.4, 0.15]} />
            <meshStandardMaterial color="#c3cbd6" metalness={0.4} roughness={0.5} />
          </mesh>
          {Array.from({ length: 9 }, (_, i) => (
            <mesh key={i} position={[0, 1.2 + i * 0.5, 0.1]}>
              <boxGeometry args={[8, 0.04, 0.05]} />
              <meshStandardMaterial color="#7d8794" />
            </mesh>
          ))}
        </group>
      ))}
      {/* ceiling light strips */}
      {[-14, -7, 0, 7, 14].map((x) => (
        <mesh key={x} position={[x, 8.8, 0]}>
          <boxGeometry args={[0.5, 0.08, 26]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* lift under the car */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[5.4, 0.4, 2.6]} />
        <meshStandardMaterial color="#2b3340" metalness={0.5} roughness={0.4} />
      </mesh>
      {[-2.2, 2.2].map((x) => (
        <mesh key={x} position={[x, 1.2, -1.6]}>
          <boxGeometry args={[0.35, 2.4, 0.35]} />
          <meshStandardMaterial color="#f2c230" />
        </mesh>
      ))}
      {/* safety lines */}
      {[-4, 4].map((z) => (
        <mesh key={z} position={[0, 0.01, z]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[16, 0.12]} />
          <meshBasicMaterial color="#f2c230" />
        </mesh>
      ))}
      {/* EV chargers */}
      {[8, 11].map((x) => (
        <group key={x} position={[x, 0, -8]}>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[0.6, 1.8, 0.35]} />
            <meshStandardMaterial color="#f4f6f8" roughness={0.4} />
          </mesh>
          <mesh position={[0, 1.2, 0.19]}>
            <boxGeometry args={[0.32, 0.9, 0.02]} />
            <meshBasicMaterial color="#b6e431" />
          </mesh>
        </group>
      ))}
      {/* tool cabinets */}
      {[-18, -16.4, -14.8].map((x) => (
        <mesh key={x} position={[x, 0.8, -9.5]}>
          <boxGeometry args={[1.4, 1.6, 0.9]} />
          <meshStandardMaterial color="#2878e3" roughness={0.5} />
        </mesh>
      ))}
      <LabelPlane text="SERVICE" sub="ศูนย์บริการ WULING CHONBURI" w={9} h={2.25} position={[0, 7.4, -11.6]} />
    </group>
  );
}

function Showroom({ logo }: { logo: string | null }) {
  return (
    <group position={[X_SHOWROOM, 0, 0]}>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[44, 34]} />
        <meshStandardMaterial color="#06142b" roughness={0.3} metalness={0.4} envMapIntensity={0.25} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <ringGeometry args={[3.6, 3.8, 64]} />
        <meshBasicMaterial color="#b6e431" />
      </mesh>
      <mesh position={[0, 5, -11]}>
        <boxGeometry args={[44, 10, 0.3]} />
        <meshStandardMaterial color="#0e2744" roughness={0.9} />
      </mesh>
      {[-14, 14].map((x) => (
        <mesh key={x} position={[x, 5, -10.8]}>
          <boxGeometry args={[0.3, 8, 0.2]} />
          <meshBasicMaterial color="#2878e3" />
        </mesh>
      ))}
      <Suspense fallback={null}>{logo ? <WallLogo src={logo} /> : null}</Suspense>
    </group>
  );
}

function WallLogo({ src }: { src: string }) {
  const tex = useTexture(src);
  return (
    <mesh position={[0, 4.2, -10.8]}>
      <planeGeometry args={[4, 4]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

function Sky({ matRef }: { matRef: MutableRefObject<THREE.ShaderMaterial | null> }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((s) => mesh.current?.position.copy(s.camera.position));
  const uniforms = useMemo(() => ({ top: { value: new THREE.Color() }, bottom: { value: new THREE.Color() } }), []);
  return (
    <mesh ref={mesh} renderOrder={-1}>
      <sphereGeometry args={[300, 24, 16]} />
      <shaderMaterial
        ref={matRef}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
        uniforms={uniforms}
        vertexShader="varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }"
        fragmentShader="uniform vec3 top; uniform vec3 bottom; varying float h; void main(){ gl_FragColor = vec4(mix(bottom, top, smoothstep(-0.05, 0.6, h)), 1.0); }"
      />
    </mesh>
  );
}

export interface Home3DProps {
  progress: MutableRefObject<number>;
  color: string;
  paused: boolean;
  logo: string | null;
  onLost: () => void;
}

function Journey({ progress, color, logo }: { progress: MutableRefObject<number>; color: string; logo: string | null }) {
  const mood = useMemo(() => new Mood(), []);
  const car = useMemo(() => buildProceduralCar(color, false), []); // eslint-disable-line react-hooks/exhaustive-deps
  const sky = useRef<THREE.ShaderMaterial | null>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const sp = useRef(0);
  const gl = useThree((s) => s.gl);
  const coarse = useMemo(() => matchMedia('(pointer: coarse)').matches, []);
  const city = useRef<THREE.Group>(null);
  const service = useRef<THREE.Group>(null);
  const show = useRef<THREE.Group>(null);

  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const t = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    return t;
  }, [gl]);
  useEffect(() => () => env.dispose(), [env]);
  useEffect(() => () => car.dispose(), [car]);
  useEffect(() => {
    car.setColor(color);
  }, [car, color]);

  const c1 = useMemo(() => new THREE.Color(), []);
  const c2 = useMemo(() => new THREE.Color(), []);

  useFrame((state, dt) => {
    sp.current = THREE.MathUtils.damp(sp.current, progress.current, 5, dt);
    const x = sp.current;
    let i = 0;
    while (i < KEYS.length - 2 && x > KEYS[i + 1].p) i++;
    const a = KEYS[i];
    const b = KEYS[i + 1];
    const t = ease(Math.min(1, Math.max(0, (x - a.p) / (b.p - a.p))));

    car.place(lv(a.car.pos, b.car.pos, t), l(a.car.ry, b.car.ry, t));
    const camPos = lv(a.cam.pos, b.cam.pos, t);
    if (!coarse) camPos.add(new THREE.Vector3(state.pointer.x * 0.4, state.pointer.y * 0.15, 0));
    const aspect = state.size.width / state.size.height;
    const target = lv(a.cam.target, b.cam.target, t);
    const fit = THREE.MathUtils.clamp(1.3 / aspect, 1, 2) * 1.5;
    camPos.sub(target).multiplyScalar(fit).add(target);
    state.camera.position.copy(camPos);
    state.camera.lookAt(target);
    const cam = state.camera as THREE.PerspectiveCamera;
    cam.fov = l(a.cam.fov, b.cam.fov, t);
    cam.aspect = aspect;
    cam.setViewOffset(state.size.width, state.size.height, 0, state.size.height * (aspect < 1 ? 0.18 : 0.1), state.size.width, state.size.height);
    cam.updateProjectionMatrix();

    const mix = (k: keyof Env) => l(a.env[k] as number, b.env[k] as number, t);
    c1.set(a.env.skyTop).lerp(c2.set(b.env.skyTop), t);
    sky.current?.uniforms.top.value.copy(c1);
    c1.set(a.env.skyBottom).lerp(c2.set(b.env.skyBottom), t);
    sky.current?.uniforms.bottom.value.copy(c1);
    c1.set(a.env.fog).lerp(c2.set(b.env.fog), t);
    if (state.scene.fog) (state.scene.fog as THREE.Fog).color.copy(c1);
    if (amb.current) amb.current.intensity = mix('ambient');
    if (sun.current) sun.current.intensity = mix('sun');
    mood.setLamps(mix('lamps'));
    car.setHeadlight(mix('head'));

    // Only draw the part of the world the camera is in.
    const cx = camPos.x;
    if (city.current) city.current.visible = cx < 85;
    if (service.current) service.current.visible = cx > 60 && cx < 140;
    if (show.current) show.current.visible = cx > 120;
  });

  return (
    <>
      <primitive object={env} attach="environment" />
      <fog attach="fog" args={['#0a1a38', 14, 70]} />
      <Sky matRef={sky} />
      <ambientLight ref={amb} intensity={0.9} />
      <directionalLight ref={sun} position={[30, 40, 30]} intensity={1.2} />
      <primitive object={car.group} />
      <group ref={city}><City mood={mood} /></group>
      <group ref={service}><ServiceCenter /></group>
      <group ref={show}><Showroom logo={logo} /></group>
    </>
  );
}

export default function Home3DCanvas({ progress, color, paused, logo, onLost }: Home3DProps) {
  const [dpr, setDpr] = useState<[number, number]>(() => [1, matchMedia('(pointer: coarse)').matches ? 1.5 : 2]);
  return (
    <Canvas
      frameloop={paused ? 'never' : 'always'}
      dpr={dpr}
      camera={{ fov: 34, near: 0.1, far: 400, position: [11, 2.4, 9] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          onLost();
        });
      }}
    >
      <PerformanceMonitor onDecline={() => setDpr([1, 1])} />
      <Journey progress={progress} color={color} logo={logo} />
    </Canvas>
  );
}
