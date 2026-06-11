import * as THREE from 'three';
import { COLORS } from '../config';
import { CollisionSystem } from '../core/CollisionSystem';

export class EnclosureDoor {
  group: THREE.Group;

  constructor(collision: CollisionSystem) {
    this.group = new THREE.Group();
    this.group.name = 'EnclosureDoor';
    this.group.position.set(0, 0, 8);
    this.build(collision);
  }

  private build(collision: CollisionSystem): void {
    const frameMat = new THREE.MeshStandardMaterial({
      color: COLORS.DOOR_FRAME,
      roughness: 0.65,
      metalness: 0.1
    });
    const doorMat = new THREE.MeshStandardMaterial({
      color: COLORS.DOOR_PANEL,
      roughness: 0.7,
      metalness: 0.05
    });
    const metalMat = new THREE.MeshStandardMaterial({
      color: COLORS.METAL,
      roughness: 0.3,
      metalness: 0.85
    });

    const w = 1.4, h = 2.8, t = 0.18, ft = 0.15;

    const frameL = new THREE.Mesh(
      new THREE.BoxGeometry(ft, h + ft, t),
      frameMat
    );
    frameL.position.set(-w / 2 - ft / 2, (h + ft) / 2, 0);
    frameL.castShadow = true;
    frameL.receiveShadow = true;
    this.group.add(frameL);
    collision.addMeshCollider(frameL, 'door-frame');

    const frameR = frameL.clone();
    frameR.position.x = w / 2 + ft / 2;
    this.group.add(frameR);
    collision.addMeshCollider(frameR, 'door-frame');

    const frameTop = new THREE.Mesh(
      new THREE.BoxGeometry(w + ft * 2, ft, t),
      frameMat
    );
    frameTop.position.set(0, h + ft / 2, 0);
    frameTop.castShadow = true;
    this.group.add(frameTop);

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 0.08),
      doorMat
    );
    door.position.set(0, h / 2, 0);
    door.castShadow = true;
    door.receiveShadow = true;
    this.group.add(door);

    const panelGeo = new THREE.BoxGeometry(w * 0.6, h * 0.35, 0.02);
    const panel1 = new THREE.Mesh(panelGeo, doorMat);
    panel1.position.set(0, h * 0.28, 0.05);
    this.group.add(panel1);
    const panel2 = panel1.clone();
    panel2.position.y = h * 0.72;
    this.group.add(panel2);

    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.25, 12),
      metalMat
    );
    handle.position.set(w / 2 - 0.15, h / 2, 0.08);
    handle.rotation.z = Math.PI / 2;
    handle.castShadow = true;
    this.group.add(handle);

    const knob = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 16),
      metalMat
    );
    knob.position.set(w / 2 - 0.15, h / 2, 0.22);
    this.group.add(knob);

    const glassMat = new THREE.MeshStandardMaterial({
      color: COLORS.WINDOW_GLASS,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
      metalness: 0.2
    });
    const window = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.5, h * 0.2, 0.03),
      glassMat
    );
    window.position.set(0, h * 0.5, 0.05);
    this.group.add(window);
  }
}
