import * as THREE from 'three';
import { COLORS } from '../config';
import { CollisionSystem } from '../core/CollisionSystem';

export class WaterPool {
  group: THREE.Group;
  private waterMesh: THREE.Mesh;

  constructor(collision: CollisionSystem) {
    this.group = new THREE.Group();
    this.group.name = 'WaterPool';
    this.group.position.set(4, 0, -3);

    const edgeMat = new THREE.MeshStandardMaterial({
      color: COLORS.WOOD_DARK,
      roughness: 0.7,
      metalness: 0.1
    });
    const waterMat = new THREE.MeshStandardMaterial({
      color: COLORS.WATER,
      transparent: true,
      opacity: 0.75,
      roughness: 0.08,
      metalness: 0.4
    });
    const bottomMat = new THREE.MeshStandardMaterial({
      color: COLORS.WATER_DEEP,
      roughness: 0.9,
      metalness: 0
    });

    const w = 4, d = 3, h = 0.4, t = 0.2;

    const bottom = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.1, d),
      bottomMat
    );
    bottom.position.y = 0.05;
    bottom.receiveShadow = true;
    this.group.add(bottom);

    const edgeN = new THREE.Mesh(
      new THREE.BoxGeometry(w + t * 2, h, t),
      edgeMat
    );
    edgeN.position.set(0, h / 2, -d / 2 - t / 2);
    edgeN.castShadow = true;
    edgeN.receiveShadow = true;
    this.group.add(edgeN);
    collision.addMeshCollider(edgeN, 'pool-edge');

    const edgeS = edgeN.clone();
    edgeS.position.z = d / 2 + t / 2;
    this.group.add(edgeS);
    collision.addMeshCollider(edgeS, 'pool-edge');

    const edgeW = new THREE.Mesh(
      new THREE.BoxGeometry(t, h, d),
      edgeMat
    );
    edgeW.position.set(-w / 2 - t / 2, h / 2, 0);
    edgeW.castShadow = true;
    edgeW.receiveShadow = true;
    this.group.add(edgeW);
    collision.addMeshCollider(edgeW, 'pool-edge');

    const edgeE = edgeW.clone();
    edgeE.position.x = w / 2 + t / 2;
    this.group.add(edgeE);
    collision.addMeshCollider(edgeE, 'pool-edge');

    this.waterMesh = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.05, 0.02, d - 0.05),
      waterMat
    );
    this.waterMesh.position.y = h * 0.75;
    this.group.add(this.waterMesh);

    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.95
    });
    const rock1 = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.25, 0),
      rockMat
    );
    rock1.position.set(-1.2, 0.25, 0.8);
    rock1.rotation.set(0.3, 0.8, 0.2);
    rock1.castShadow = true;
    this.group.add(rock1);

    const rock2 = rock1.clone();
    rock2.scale.setScalar(0.7);
    rock2.position.set(1.4, 0.2, -0.7);
    this.group.add(rock2);
  }

  update(time: number): void {
    this.waterMesh.position.y = 0.3 + Math.sin(time * 1.5) * 0.015;
  }
}
