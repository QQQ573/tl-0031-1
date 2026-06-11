import * as THREE from 'three';
import { COLORS } from '../config';
import { CollisionSystem } from '../core/CollisionSystem';

export class ClimbingFrame {
  group: THREE.Group;

  constructor(collision: CollisionSystem) {
    this.group = new THREE.Group();
    this.group.name = 'ClimbingFrame';
    this.group.position.set(-5, 0, -2);
    this.build(collision);
  }

  private build(collision: CollisionSystem): void {
    const woodMat = new THREE.MeshStandardMaterial({
      color: COLORS.WOOD,
      roughness: 0.8,
      metalness: 0.1
    });
    const woodDarkMat = new THREE.MeshStandardMaterial({
      color: COLORS.WOOD_DARK,
      roughness: 0.85,
      metalness: 0.1
    });

    const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.5, 12);
    const positions = [
      [-1.8, -1.5], [-1.8, 1.5],
      [1.8, -1.5], [1.8, 1.5],
      [0, -1.5], [0, 1.5]
    ];
    positions.forEach(([x, z]) => {
      const post = new THREE.Mesh(postGeo, woodDarkMat);
      post.position.set(x, 1.75, z);
      post.castShadow = true;
      post.receiveShadow = true;
      this.group.add(post);
      collision.addMeshCollider(post, 'climbing-post');
    });

    const platformPositions = [
      { y: 0.8, w: 3.8, d: 3.2 },
      { y: 2.2, w: 3.2, d: 2.5 }
    ];
    platformPositions.forEach(({ y, w, d }) => {
      const platform = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.12, d),
        woodMat
      );
      platform.position.y = y;
      platform.castShadow = true;
      platform.receiveShadow = true;
      this.group.add(platform);
      collision.addMeshCollider(platform, 'climbing-platform');
    });

    const rampGeo = new THREE.BoxGeometry(0.35, 0.08, 2.2);
    const ramp1 = new THREE.Mesh(rampGeo, woodMat);
    ramp1.position.set(-1.2, 1.5, 0);
    ramp1.rotation.z = -Math.PI / 8;
    ramp1.castShadow = true;
    ramp1.receiveShadow = true;
    this.group.add(ramp1);

    const ramp2 = new THREE.Mesh(rampGeo, woodMat);
    ramp2.position.set(1.2, 1.5, 1);
    ramp2.rotation.z = Math.PI / 8;
    ramp2.castShadow = true;
    ramp2.receiveShadow = true;
    this.group.add(ramp2);

    const barGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.4, 8);
    for (let i = 0; i < 5; i++) {
      const bar = new THREE.Mesh(barGeo, woodDarkMat);
      bar.position.set(-1.5 + i * 0.75, 2.8, -0.2);
      bar.rotation.z = Math.PI / 2;
      bar.castShadow = true;
      this.group.add(bar);
    }

    const topBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 3.8, 10),
      woodDarkMat
    );
    topBar.position.set(0, 3.3, 0);
    topBar.rotation.z = Math.PI / 2;
    topBar.castShadow = true;
    this.group.add(topBar);

    const ropeMat = new THREE.MeshStandardMaterial({
      color: 0xa0522d,
      roughness: 0.95
    });
    const ropeGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6);
    const rope1 = new THREE.Mesh(ropeGeo, ropeMat);
    rope1.position.set(1, 2.6, 1);
    this.group.add(rope1);
    const rope2 = rope1.clone();
    rope2.position.set(-1, 2.6, 1);
    this.group.add(rope2);
  }
}
