import * as THREE from 'three';

/**
 * Procedural stand-in MPV (NOT the real DARION): side silhouette extruded across
 * the width, plus wheels and lamps. Used by the /lab prototypes only.
 */
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

export interface ProceduralCar {
  group: THREE.Group;
  paint: THREE.MeshPhysicalMaterial;
  /** Emissive lamp materials, so scenes can dim / light them. */
  place: (pos: THREE.Vector3, rotY: number) => void;
  setColor: (color: string) => void;
  setHeadlight: (intensity: number) => void;
  dispose: () => void;
}

export function buildProceduralCar(color: string, castShadow = false): ProceduralCar {
  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(d: T) => (disposables.push(d), d);
  const group = new THREE.Group();

  const paint = track(new THREE.MeshPhysicalMaterial({ color, metalness: 0.55, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08 }));
  const body = new THREE.Mesh(
    track(new THREE.ExtrudeGeometry(bodyShape(), { depth: 1.7, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 6, curveSegments: 24 })),
    paint,
  );
  body.position.z = -0.85;
  body.castShadow = castShadow;
  const glass = new THREE.Mesh(
    track(new THREE.ExtrudeGeometry(glassShape(), { depth: 1.9, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.05, bevelSegments: 3 })),
    track(new THREE.MeshPhysicalMaterial({ color: 0x0b0f18, metalness: 0.1, roughness: 0.05, clearcoat: 1 })),
  );
  glass.position.z = -0.95;
  group.add(body, glass);

  const tire = track(new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.85 }));
  const rim = track(new THREE.MeshStandardMaterial({ color: 0xcfd3d8, metalness: 1, roughness: 0.25 }));
  const tireGeo = track(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 32));
  const rimGeo = track(new THREE.CylinderGeometry(0.28, 0.28, 0.32, 24));
  for (const x of [-1.55, 1.55]) {
    for (const z of [-0.88, 0.88]) {
      const w = new THREE.Group();
      w.add(new THREE.Mesh(tireGeo, tire), new THREE.Mesh(rimGeo, rim));
      w.rotation.x = Math.PI / 2;
      w.position.set(x, 0.42, z);
      group.add(w);
    }
  }

  const headlights = track(new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.6 }));
  const taillights = track(new THREE.MeshStandardMaterial({ color: 0xff2a2a, emissive: 0xff2a2a, emissiveIntensity: 1.6 }));
  const lampGeo = track(new THREE.BoxGeometry(0.06, 0.1, 0.45));
  for (const z of [-0.55, 0.55]) {
    const m = new THREE.Mesh(lampGeo, headlights);
    m.position.set(2.62, 0.95, z);
    group.add(m);
  }
  const tail = new THREE.Mesh(track(new THREE.BoxGeometry(0.06, 0.1, 1.3)), taillights);
  tail.position.set(-2.55, 1.0, 0);
  group.add(tail);

  return {
    group,
    paint,
    place: (pos, rotY) => {
      group.position.copy(pos);
      group.rotation.y = rotY;
    },
    setColor: (c) => paint.color.set(c),
    setHeadlight: (v) => {
      headlights.emissiveIntensity = v;
    },
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}
