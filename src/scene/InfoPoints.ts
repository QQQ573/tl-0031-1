import * as THREE from 'three';
import { COLORS, INFO_POINTS } from '../config';
import type { InfoPointData } from '../types';

export interface InfoPointHit {
  data: InfoPointData;
  distance: number;
}

export class InfoPoints {
  group: THREE.Group;
  private points: { mesh: THREE.Mesh; halo: THREE.Mesh; data: InfoPointData; baseY: number }[] = [];
  private raycaster: THREE.Raycaster;
  private clickables: THREE.Object3D[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'InfoPoints';
    this.raycaster = new THREE.Raycaster();
    this.build();
  }

  private build(): void {
    const geo = new THREE.SphereGeometry(0.22, 16, 16);
    const haloGeo = new THREE.RingGeometry(0.3, 0.42, 24);
    INFO_POINTS.forEach((data) => {
      const mat = new THREE.MeshStandardMaterial({
        color: COLORS.INFO_POINT,
        emissive: COLORS.INFO_POINT,
        emissiveIntensity: 0.8,
        roughness: 0.3,
        metalness: 0.5
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(data.position);
      mesh.userData = { infoPointId: data.id };
      this.group.add(mesh);
      this.clickables.push(mesh);

      const haloMat = new THREE.MeshBasicMaterial({
        color: COLORS.INFO_POINT,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.copy(data.position);
      halo.lookAt(new THREE.Vector3(0, data.position.y, -100));
      this.group.add(halo);

      this.points.push({ mesh, halo, data, baseY: data.position.y });
    });
  }

  update(time: number): void {
    this.points.forEach(({ mesh, halo, baseY }, i) => {
      mesh.position.y = baseY + Math.sin(time * 1.8 + i) * 0.12;
      mesh.rotation.y += 0.01;
      const s = 1 + Math.sin(time * 2.5 + i) * 0.12;
      halo.scale.setScalar(s);
      const haloMat = halo.material as THREE.MeshBasicMaterial;
      haloMat.opacity = 0.35 + Math.sin(time * 2 + i) * 0.25;
    });
  }

  pick(camera: THREE.PerspectiveCamera, nx: number, ny: number): InfoPointHit | null {
    this.raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
    const hits = this.raycaster.intersectObjects(this.clickables, false);
    if (hits.length === 0) return null;
    const hit = hits[0];
    const id = hit.object.userData.infoPointId;
    const data = INFO_POINTS.find((d) => d.id === id);
    if (!data) return null;
    return { data, distance: hit.distance };
  }

  getClosestToCenter(camera: THREE.PerspectiveCamera, maxDistance: number = 4): InfoPointData | null {
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const hits = this.raycaster.intersectObjects(this.clickables, false);
    if (hits.length === 0) return null;
    const hit = hits[0];
    if (hit.distance > maxDistance) return null;
    const id = hit.object.userData.infoPointId;
    return INFO_POINTS.find((d) => d.id === id) || null;
  }
}
