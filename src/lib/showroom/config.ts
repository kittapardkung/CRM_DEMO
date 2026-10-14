/**
 * Showroom configuration: asset manifest, scene keyframes and chapter copy.
 * Pure data + math (no React / three imports) so it can be used on the server
 * and unit-tested.
 */

export type Vec3 = [number, number, number];
export type VehicleSlug = 'porta' | 'darion' | 'binguo' | 'ekxion';
export const VEHICLE_ORDER: VehicleSlug[] = ['porta', 'darion', 'binguo', 'ekxion'];

/** Card height in scene units (photo stand-ins only). */
export const CARD_H = 2;

/**
 * Per-model 3D asset manifest. `glb: null` means NO authentic model exists yet
 * and the showroom shows the verified product photo on a flat card instead —
 * it is NOT a 3D reconstruction. Fill in `glb` (and the fields below) to switch
 * a model to real 3D with no code change.
 */
export interface VehicleManifest {
  /** Public path of a verified, compressed .glb (Draco / Meshopt). */
  glb: string | null;
  /** Real overall length in metres from the verified spec sheet, for accurate scale. */
  lengthM: number | null;
  /** Anchor points in the normalised model space, used when the .glb has no `anchor_logo` / `anchor_wheel` nodes. */
  anchors?: { logo: Vec3; wheel: Vec3 };
  /** Name of the body-paint material to recolour. */
  paintMaterial?: string;
  /** Framing of the stand-in photo (width / height). */
  photoAspect: number;
  /** Logo / wheel positions on the stand-in photo, as [u, v] from the top-left. */
  photoAnchors: { logo: [number, number]; wheel: [number, number] };
}

export const MANIFEST: Record<VehicleSlug, VehicleManifest> = {
  porta: { glb: null, lengthM: null, photoAspect: 1600 / 1087, photoAnchors: { logo: [0.3, 0.5], wheel: [0.3, 0.8] } },
  darion: { glb: null, lengthM: null, photoAspect: 1600 / 903, photoAnchors: { logo: [0.168, 0.457], wheel: [0.525, 0.72] } },
  binguo: { glb: null, lengthM: null, photoAspect: 1600 / 1087, photoAnchors: { logo: [0.3, 0.5], wheel: [0.3, 0.8] } },
  ekxion: { glb: null, lengthM: null, photoAspect: 1600 / 1087, photoAnchors: { logo: [0.3, 0.5], wheel: [0.3, 0.8] } },
};

export const hasAuthentic3D = (slug: VehicleSlug) => MANIFEST[slug].glb !== null;
export const allAuthentic3D = () => VEHICLE_ORDER.every(hasAuthentic3D);

/* ------------------------------ vehicle states ----------------------------- */

export interface VState {
  pos: Vec3;
  rotY: number;
  opacity: number;
  scale: number;
}
export type VStates = Record<VehicleSlug, VState>;

const SLOT_X: Record<VehicleSlug, number> = { porta: -6, darion: -2, binguo: 2, ekxion: 6 };

const lineup = (): VStates =>
  Object.fromEntries(
    VEHICLE_ORDER.map((s) => [s, { pos: [SLOT_X[s], 0, 0], rotY: -SLOT_X[s] * 0.03, opacity: 1, scale: 1 }]),
  ) as VStates;

const back = (s: VehicleSlug): VState => ({ pos: [SLOT_X[s] * 1.15, 0, -6], rotY: -SLOT_X[s] * 0.03, opacity: 0.1, scale: 1 });

const leaseStates = (): VStates => ({
  ...lineup(),
  porta: { pos: [-2.1, 0, 1.6], rotY: 0.14, opacity: 1, scale: 1.1 },
  darion: { pos: [2.2, 0, 1.6], rotY: -0.14, opacity: 1, scale: 1.1 },
  binguo: back('binguo'),
  ekxion: back('ekxion'),
});

const closeUpStates = (): VStates => ({
  porta: back('porta'),
  darion: { pos: [0, 0, 1.5], rotY: 0, opacity: 1, scale: 1.35 },
  binguo: back('binguo'),
  ekxion: back('ekxion'),
});

/* --------------------------------- camera ---------------------------------- */

interface CamSpec {
  pos?: Vec3;
  target?: Vec3;
  /** Aim at a model anchor (resolved from the vehicle state at this keyframe). */
  focus?: { slug: VehicleSlug; anchor: 'logo' | 'wheel'; offset: Vec3 };
  fov: number;
}

interface Preset {
  cam: CamSpec;
  vehicles: VStates;
}

const PRESETS: Record<string, Preset> = {
  lineupWide: { cam: { pos: [0, 2.0, 15], target: [0, 1, 0], fov: 36 }, vehicles: lineup() },
  lineupNear: { cam: { pos: [0, 1.7, 10.4], target: [0, 1, 0], fov: 36 }, vehicles: lineup() },
  lease: { cam: { pos: [0, 1.7, 9.6], target: [0, 1.05, 1.6], fov: 34 }, vehicles: leaseStates() },
  logo: { cam: { focus: { slug: 'darion', anchor: 'logo', offset: [0.7, 0.1, 3.5] }, fov: 30 }, vehicles: closeUpStates() },
  wheel: { cam: { focus: { slug: 'darion', anchor: 'wheel', offset: [-0.8, 0.2, 3.5] }, fov: 30 }, vehicles: closeUpStates() },
  finalWide: { cam: { pos: [0, 2.2, 16], target: [0, 1.3, 0], fov: 36 }, vehicles: lineup() },
};

/** Scroll progress (0–1) → preset. Repeated presets create holds. */
export const KEYFRAMES: { p: number; preset: keyof typeof PRESETS }[] = [
  { p: 0.0, preset: 'lineupWide' },
  { p: 0.15, preset: 'lineupNear' },
  { p: 0.34, preset: 'lineupNear' },
  { p: 0.47, preset: 'lease' },
  { p: 0.52, preset: 'lease' },
  { p: 0.64, preset: 'logo' },
  { p: 0.69, preset: 'logo' },
  { p: 0.8, preset: 'wheel' },
  { p: 0.85, preset: 'wheel' },
  { p: 0.97, preset: 'finalWide' },
  { p: 1.0, preset: 'finalWide' },
];

/** First scroll-progress value of each of the six chapters. */
export const SCENE_STARTS = [0, 0.17, 0.37, 0.55, 0.72, 0.88];
export const sceneAt = (p: number) => {
  let i = 0;
  SCENE_STARTS.forEach((s, k) => {
    if (p >= s) i = k;
  });
  return i;
};

/** World position of a model anchor given its (interpolated) state. */
export function anchorWorld(slug: VehicleSlug, anchor: 'logo' | 'wheel', st: VState): Vec3 {
  const m = MANIFEST[slug];
  const [u, v] = m.photoAnchors[anchor];
  const w = CARD_H * m.photoAspect;
  return [st.pos[0] + (u - 0.5) * w * st.scale, st.pos[1] + (1 - v) * CARD_H * st.scale, st.pos[2] + 0.02];
}

export interface Sample {
  cam: { pos: Vec3; target: Vec3; fov: number };
  vehicles: VStates;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const ease = (t: number) => t * t * (3 - 2 * t);
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

function resolveCam(p: Preset) {
  const c = p.cam;
  if (c.focus) {
    const target = anchorWorld(c.focus.slug, c.focus.anchor, p.vehicles[c.focus.slug]);
    return { pos: add(target, c.focus.offset), target, fov: c.fov };
  }
  return { pos: c.pos!, target: c.target!, fov: c.fov };
}

const RESOLVED = KEYFRAMES.map((k) => ({ p: k.p, cam: resolveCam(PRESETS[k.preset]), vehicles: PRESETS[k.preset].vehicles }));

/** Interpolated camera + vehicle state at scroll progress `p`. Fully reversible. */
export function sample(p: number): Sample {
  const x = Math.min(1, Math.max(0, p));
  let i = 0;
  while (i < RESOLVED.length - 2 && x > RESOLVED[i + 1].p) i++;
  const a = RESOLVED[i];
  const b = RESOLVED[i + 1];
  const t = b.p === a.p ? 0 : ease(Math.min(1, Math.max(0, (x - a.p) / (b.p - a.p))));
  const vehicles = {} as VStates;
  for (const s of VEHICLE_ORDER) {
    const va = a.vehicles[s];
    const vb = b.vehicles[s];
    vehicles[s] = { pos: lerp3(va.pos, vb.pos, t), rotY: lerp(va.rotY, vb.rotY, t), opacity: lerp(va.opacity, vb.opacity, t), scale: lerp(va.scale, vb.scale, t) };
  }
  return { cam: { pos: lerp3(a.cam.pos, b.cam.pos, t), target: lerp3(a.cam.target, b.cam.target, t), fov: lerp(a.cam.fov, b.cam.fov, t) }, vehicles };
}

/* --------------------------------- hotspots -------------------------------- */

/** Article hotspots around the DARION front end (positions on the stand-in photo, [u,v]). */
export const ARTICLE_HOTSPOTS: { uv: [number, number]; slug: string }[] = [
  { uv: [0.168, 0.457], slug: 'wuling-magic-battery' },
  { uv: [0.36, 0.4], slug: 'porta-ev-charging' },
  { uv: [0.16, 0.66], slug: 'porta-ev-running-cost' },
  { uv: [0.6, 0.27], slug: 'porta-ev-maintenance' },
];
export const VIDEO_IDS = ['commercial-ev-cargo-van-cost', 'porta-business-use', 'ev-cargo-benefits', 'porta-industrial-estate-delivery'];

/* --------------------------------- chapters -------------------------------- */

export const CHAPTERS = [
  { id: 'lineup', kicker: 'ตัวแทนจำหน่ายวู่หลิงอย่างเป็นทางการ · ชลบุรี ระยอง ฉะเชิงเทรา', title: 'Find Your WULING', sub: 'รถยนต์ไฟฟ้าที่ตอบโจทย์ทุกการเดินทาง และทุกธุรกิจ' },
  { id: 'explore', kicker: 'Explore', title: 'สำรวจ WULING ทุกรุ่น', sub: 'เลือกรุ่นเพื่อดูใกล้ ๆ' },
  { id: 'lease', kicker: 'Operating Lease', title: 'เช่าไหม?', sub: 'เปลี่ยนค่าใช้จ่ายในการซื้อรถ เป็นค่าเช่ารายเดือนสำหรับธุรกิจ' },
  { id: 'tech', kicker: 'Technology', title: 'รู้จักเทคโนโลยี WULING', sub: 'คลิกจุดบนตัวรถเพื่ออ่านบทความ' },
  { id: 'knowledge', kicker: 'EV KNOWLEDGE', title: 'เรื่องรถยนต์ไฟฟ้าที่คุณควรรู้', sub: 'คลิกจุดที่ล้อเพื่อดูวิดีโอ' },
  { id: 'contact', kicker: 'WULING CHONBURI', title: 'พบกับรถยนต์ไฟฟ้า WULING ที่ชลบุรี', sub: 'พร้อมให้คำปรึกษา ทดลองขับ และเสนอราคาที่เหมาะกับคุณ' },
] as const;
