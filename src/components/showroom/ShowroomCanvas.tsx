'use client';

import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html, PerformanceMonitor, useGLTF, useProgress, useTexture } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  ARTICLE_HOTSPOTS, CARD_H, MANIFEST, VEHICLE_ORDER, sample,
  type Sample, type VState, type VehicleSlug,
} from '@/lib/showroom/config';
import type { ShowroomArticle, ShowroomVehicle } from '@/lib/showroom/data';

export interface Interaction {
  /** Smoothed-by-the-rig scroll progress input (0–1). */
  progress: number;
  /** Drag rotation (radians) requested by the user for the selected model. */
  yaw: number;
  zoom: number;
}

interface Props {
  vehicles: ShowroomVehicle[];
  articles: ShowroomArticle[];
  logo: string | null;
  scene: number;
  selected: VehicleSlug | null;
  colorIndex: number;
  paused: boolean;
  interaction: MutableRefObject<Interaction>;
  onSelect: (s: VehicleSlug) => void;
  onArticle: (slug: string) => void;
  onWheel: () => void;
  onLost: () => void;
}

/** Shared per-frame state, written by the camera rig and read by every vehicle. */
class Shared {
  sample: Sample = sample(0);
  selMix = 0;
  update(s: Sample, mix: number) {
    this.sample = s;
    this.selMix = mix;
  }
}

const DRACO = '/draco/';

/** Feathered alpha so photo cards blend into the showroom instead of showing hard edges. */
function useFeatherMap() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    g.fillStyle = '#fff';
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = '#000';
    g.lineWidth = 30;
    g.shadowColor = '#000';
    g.shadowBlur = 26;
    g.strokeRect(-6, -6, 268, 268);
    return new THREE.CanvasTexture(c);
  }, []);
}

function Rig({ shared, interaction, selected, scene }: { shared: Shared; interaction: MutableRefObject<Interaction>; selected: VehicleSlug | null; scene: number }) {
  const sp = useRef(0);
  const lastBg = useRef('');
  const selMix = useRef(0);
  const coarse = useMemo(() => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches, []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const { camera, size, pointer } = state;
    sp.current = THREE.MathUtils.damp(sp.current, interaction.current.progress, 5, dt);
    const s = sample(sp.current);
    selMix.current = THREE.MathUtils.damp(selMix.current, selected && scene === 1 ? 1 : 0, 5, dt);
    shared.update(s, selMix.current);

    // Room mood: gradient behind the (transparent) canvas + matching fog.
    const css = (c: [number, number, number]) => `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;
    const bg = `linear-gradient(to bottom, ${css(s.mood.top)} 0%, ${css(s.mood.bottom)} 58%, ${css(s.mood.floor)} 100%)`;
    if (bg !== lastBg.current) {
      lastBg.current = bg;
      state.gl.domElement.style.background = bg;
    }
    const fog = state.scene.fog as THREE.Fog | null;
    if (fog) fog.color.setRGB(s.mood.bottom[0], s.mood.bottom[1], s.mood.bottom[2], THREE.SRGBColorSpace);

    const { pos, target } = s.cam;
    let fov = s.cam.fov;
    let p = new THREE.Vector3(...pos);
    const t = new THREE.Vector3(...target);
    if (selMix.current > 0.001 && selected) {
      const v = s.vehicles[selected];
      const tt = new THREE.Vector3(v.pos[0], v.pos[1] + CARD_H * 0.42 * v.scale, v.pos[2]);
      const pp = tt.clone().add(tmp.set(0, 0.15, 8.2 / interaction.current.zoom));
      p.lerp(pp, selMix.current);
      t.lerp(tt, selMix.current);
      fov = THREE.MathUtils.lerp(fov, 30, selMix.current);
      // On wide screens park the model on the right so the copy stays clear.
      if (size.width / size.height > 1.2) {
        const side = tmp.set(1, 0, 0).multiplyScalar(-1.7 * selMix.current);
        p.add(side);
        t.add(side);
      }
    }
    // Narrow screens: back the camera off so the subject still fits.
    const aspect = size.width / size.height;
    const fit = THREE.MathUtils.clamp(1.35 / aspect, 1, 2.2);
    p = t.clone().add(p.sub(t).multiplyScalar(fit));
    if (!coarse) p.add(tmp.set(pointer.x * 0.35, pointer.y * 0.15, 0));
    camera.position.copy(p);
    camera.lookAt(t);
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = fov;
    cam.aspect = aspect;
    // Lift the subject into the upper part of the frame so copy fits underneath.
    cam.setViewOffset(size.width, size.height, 0, size.height * (aspect < 1 ? 0.2 : 0.13), size.width, size.height);
    cam.updateProjectionMatrix();
  });
  return null;
}

function Lighting() {
  const gl = useThree((s) => s.gl);
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    return tex;
  }, [gl]);
  useEffect(() => () => env.dispose(), [env]);
  return (
    <>
      <primitive object={env} attach="environment" />
      <directionalLight position={[4, 8, 6]} intensity={1.6} />
    </>
  );
}

function Floor({ shared }: { shared: Shared }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    const f = shared.sample.mood.floor;
    mat.current?.color.setRGB(f[0], f[1], f[2], THREE.SRGBColorSpace);
  });
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.001, 0]}>
      <planeGeometry args={[160, 160]} />
      <meshBasicMaterial ref={mat} color="#e8edf4" />
    </mesh>
  );
}

/** Architectural back wall: deep-blue plinth, lime accent line and vertical light slats. */
function BackWall({ shared }: { shared: Shared }) {
  const slat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    const f = shared.sample.mood.floor;
    slat.current?.color.setRGB(Math.min(1, f[0] * 1.04), Math.min(1, f[1] * 1.04), Math.min(1, f[2] * 1.04), THREE.SRGBColorSpace);
  });
  return (
    <group position={[0, 0, -17]}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[120, 1, 0.4]} />
        <meshBasicMaterial color="#102a43" />
      </mesh>
      <mesh position={[0, 1.04, 0.05]}>
        <boxGeometry args={[120, 0.07, 0.4]} />
        <meshBasicMaterial color="#b6e431" toneMapped={false} />
      </mesh>
      {Array.from({ length: 41 }, (_, i) => (
        <mesh key={i} position={[(i - 20) * 2.4, 6.4, 0]}>
          <boxGeometry args={[0.9, 10.8, 0.2]} />
          <meshBasicMaterial ref={i === 0 ? slat : undefined} color="#e8edf4" transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function WallLogo({ src, shared }: { src: string; shared: Shared }) {
  const tex = useTexture(src);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    // Quiet backdrop for most of the journey, full reveal in the final scene.
    const cam = shared.sample.cam.pos;
    const reveal = THREE.MathUtils.smoothstep(cam[2], 13.2, 14.8);
    if (mat.current) mat.current.opacity = 0.12 + 0.88 * reveal;
  });
  return (
    <mesh position={[0, 3.3, -16.6]}>
      <planeGeometry args={[3.2, 3.2]} />
      <meshBasicMaterial ref={mat} map={tex} transparent toneMapped={false} />
    </mesh>
  );
}

const MIRROR_VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
// Reflection that fades with distance from the floor (uv.y = 0 is the contact edge once mirrored).
const MIRROR_FRAG = `uniform sampler2D map; uniform float opacity; varying vec2 vUv;
void main(){ vec4 c = texture2D(map, vUv); float fade = pow(1.0 - vUv.y, 1.6); gl_FragColor = vec4(c.rgb, c.a * fade * opacity);
#include <colorspace_fragment>
}`;

function useShadowMap() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0,0,0,0.6)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0.25)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
}

/** Stand-in: the verified product photo on a flat card. NOT a 3D model. */
function PhotoFace({ url, aspect, base, cutout, feather, matRef, mirrorRef, shadowRef }: {
  url: string; aspect: number; base: number; cutout: boolean; feather: THREE.Texture;
  matRef: MutableRefObject<THREE.MeshBasicMaterial | null>; mirrorRef: MutableRefObject<THREE.ShaderMaterial | null>; shadowRef: MutableRefObject<THREE.MeshBasicMaterial | null>;
}) {
  const tex = useTexture(url);
  const shadow = useShadowMap();
  const w = CARD_H * aspect;
  const uniforms = useMemo(() => ({ map: { value: tex }, opacity: { value: 0.22 } }), [tex]);
  return (
    <>
      {/* soft contact shadow where the tyres meet the floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, 0.05]}>
        <planeGeometry args={[w * 0.85, 1.1]} />
        <meshBasicMaterial ref={shadowRef} map={shadow} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, (base - 0.5) * CARD_H, 0]}>
        <planeGeometry args={[w, CARD_H]} />
        <meshBasicMaterial ref={matRef} map={tex} alphaMap={cutout ? null : feather} transparent toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, (0.5 - base) * CARD_H, 0]} scale-y={-1}>
        <planeGeometry args={[w, CARD_H]} />
        <shaderMaterial ref={mirrorRef} uniforms={uniforms} vertexShader={MIRROR_VERT} fragmentShader={MIRROR_FRAG} transparent depthWrite={false} />
      </mesh>
    </>
  );
}

/** Authentic model path: loads a verified .glb, normalises scale and sits it on the floor. */
function GlbModel({ url, slug, color }: { url: string; slug: VehicleSlug; color?: string }) {
  const gltf = useGLTF(url, DRACO);
  const model = useMemo(() => {
    const root = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    // Verified length (metres) → scene units at 0.8 u/m; otherwise fit to the showcase width.
    const lengthM = MANIFEST[slug].lengthM;
    const k = lengthM ? (lengthM * 0.8) / size.x : (CARD_H * 1.8) / Math.max(size.x, size.z);
    root.scale.setScalar(k);
    const b2 = new THREE.Box3().setFromObject(root);
    const c = b2.getCenter(new THREE.Vector3());
    root.position.set(-c.x, -b2.min.y, -c.z);
    return root;
  }, [gltf, slug]);
  useEffect(() => {
    const name = MANIFEST[slug].paintMaterial;
    if (!name || !color) return;
    model.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (m?.name === name) m.color.set(color);
    });
  }, [model, color, slug]);
  return <primitive object={model} />;
}

function Hotspot({ position, label, onClick }: { position: [number, number, number]; label: string; onClick: () => void }) {
  return (
    <Html position={position} center zIndexRange={[20, 0]}>
      <button type="button" className="sr-hotspot" aria-label={label} onClick={onClick}>
        <span className="sr-hotspot-tip">{label}</span>
      </button>
    </Html>
  );
}

function Vehicle({ v, shared, interaction, selected, scene, colorIndex, feather, articles, onSelect, onArticle, onWheel }: {
  v: ShowroomVehicle; shared: Shared; interaction: MutableRefObject<Interaction>; selected: VehicleSlug | null; scene: number; colorIndex: number; feather: THREE.Texture;
  articles: ShowroomArticle[]; onSelect: (s: VehicleSlug) => void; onArticle: (slug: string) => void; onWheel: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshBasicMaterial | null>(null);
  const mirror = useRef<THREE.ShaderMaterial | null>(null);
  const shadowMat = useRef<THREE.MeshBasicMaterial | null>(null);
  const yaw = useRef(0);
  const m = MANIFEST[v.slug];
  const isSel = selected === v.slug;
  // A colour photo only applies while this model is selected, so close-up hotspots always sit on the reference framing.
  const photo = isSel && v.colors[colorIndex] ? v.colors[colorIndex].photo : v.photo;

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const st: VState = shared.sample.vehicles[v.slug];
    const mix = shared.selMix;
    g.position.set(...st.pos);
    g.scale.setScalar(st.scale);
    // Photo stand-ins can only tilt a little; a real GLB turns through a full 360°.
    const want = isSel ? (m.glb ? interaction.current.yaw : THREE.MathUtils.clamp(interaction.current.yaw, -0.5, 0.5)) : 0;
    yaw.current = THREE.MathUtils.damp(yaw.current, want, 8, dt);
    g.rotation.y = st.rotY + yaw.current;
    const dim = selected && !isSel ? 1 - 0.8 * mix : 1;
    const o = st.opacity * dim;
    if (mat.current) mat.current.opacity = o;
    if (mirror.current) mirror.current.uniforms.opacity.value = 0.24 * o;
    if (shadowMat.current) shadowMat.current.opacity = o;
    g.visible = o > 0.01;
  });

  const w = CARD_H * m.photoAspect;
  const at = (a: 'logo' | 'wheel'): [number, number, number] => {
    const [u, vv] = m.photoAnchors[a];
    return [(u - 0.5) * w, (m.photoBase - vv) * CARD_H, 0.03];
  };
  const showTech = v.slug === 'darion' && scene === 3;
  const showWheel = v.slug === 'darion' && scene === 4;

  return (
    <group ref={group} onClick={(e: ThreeEvent<MouseEvent>) => { if (scene === 1) { e.stopPropagation(); onSelect(v.slug); } }}>
      <Suspense fallback={null}>
        {m.glb ? <GlbModel url={m.glb} slug={v.slug} color={v.colors[colorIndex]?.code} /> : photo ? <PhotoFace url={photo} aspect={m.photoAspect} base={m.photoBase} cutout={v.cutout} feather={feather} matRef={mat} mirrorRef={mirror} shadowRef={shadowMat} /> : null}
      </Suspense>
      {showTech
        ? ARTICLE_HOTSPOTS.map((h) => {
            const a = articles.find((x) => x.slug === h.slug);
            return a ? <Hotspot key={h.slug} position={[(h.uv[0] - 0.5) * w, (m.photoBase - h.uv[1]) * CARD_H, 0.03]} label={a.title} onClick={() => onArticle(a.slug)} /> : null;
          })
        : null}
      {showWheel ? <Hotspot position={at('wheel')} label="ดูวิดีโอ EV Knowledge" onClick={onWheel} /> : null}
    </group>
  );
}

export default function ShowroomCanvas(props: Props) {
  const { logo, paused, interaction } = props;
  const shared = useMemo(() => new Shared(), []);
  const [dpr, setDpr] = useState<[number, number]>(() => [1, typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches ? 1.5 : 2]);

  return (
    <Canvas
      flat
      frameloop={paused ? 'never' : 'always'}
      dpr={dpr}
      camera={{ fov: 36, near: 0.1, far: 120, position: [0, 2.2, 17.5] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          props.onLost();
        });
      }}
    >
      <PerformanceMonitor onDecline={() => setDpr([1, 1])} />
      <fog attach="fog" args={['#f8fafd', 26, 70]} />
      <Lighting />
      <Floor shared={shared} />
      <BackWall shared={shared} />
      <Rig shared={shared} interaction={interaction} selected={props.selected} scene={props.scene} />
      <Suspense fallback={null}>{logo ? <WallLogo src={logo} shared={shared} /> : null}</Suspense>
      <Scene {...props} shared={shared} />
    </Canvas>
  );
}

function Scene({ vehicles, articles, shared, interaction, selected, scene, colorIndex, onSelect, onArticle, onWheel }: Props & { shared: Shared }) {
  const feather = useFeatherMap();
  return (
    <>
      {VEHICLE_ORDER.map((slug) => {
        const v = vehicles.find((x) => x.slug === slug);
        return v ? <Vehicle key={slug} v={v} shared={shared} interaction={interaction} selected={selected} scene={scene} colorIndex={colorIndex} feather={feather} articles={articles} onSelect={onSelect} onArticle={onArticle} onWheel={onWheel} /> : null;
      })}
    </>
  );
}

/** Asset loading progress (DOM), shown until models / textures have streamed in. */
export function LoadingBadge() {
  const { active, progress } = useProgress();
  if (!active && progress >= 100) return null;
  return (
    <div className="sr-loading" role="status">
      กำลังโหลดฉาก 3D {Math.round(progress)}%
    </div>
  );
}
