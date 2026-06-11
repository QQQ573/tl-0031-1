import * as THREE from 'three';
import { COLORS } from '../config';
import { CollisionSystem } from '../core/CollisionSystem';

export class RestPlatform {
  group: THREE.Group;

  constructor(collision: CollisionSystem) {
    this.group = new THREE.Group();
    this.group.name = 'RestPlatform';
    this.group.position.set(6, 0, 3);
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
    const matMat = new THREE.MeshStandardMaterial({
      color: COLORS.GRASS_MAT,
      roughness: 0.95,
      metalness: 0
    });

    const legGeo = new THREE.BoxGeometry(0.15, 1.5, 0.15);
    const legPositions = [
      [-1.3, -0.9], [-1.3, 0.9],
      [1.3, -0.9], [1.3, 0.9]
    ];
    legPositions.forEach(([x, z]) => {
      const leg = new THREE.Mesh(legGeo, woodDarkMat);
      leg.position.set(x, 0.75, z);
      leg.castShadow = true;
      leg.receiveShadow = true;
      this.group.add(leg);
      collision.addMeshCollider(leg, 'platform-leg');
    });

    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.15, 2),
      woodMat
    );
    platform.position.y = 1.575;
    platform.castShadow = true;
    platform.receiveShadow = true;
    this.group.add(platform);
    collision.addMeshCollider(platform, 'platform-top');

    const mat = new THREE.Mesh(
      new THREE.BoxGeometry(2.7, 0.08, 1.7),
      matMat
    );
    mat.position.y = 1.575 + 0.075 + 0.04;
    mat.receiveShadow = true;
    this.group.add(mat);

    const backrest = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.8, 0.12),
      woodMat
    );
    backrest.position.set(0, 2.05, -0.94);
    backrest.castShadow = true;
    this.group.add(backrest);

    const pillowMat = new THREE.MeshStandardMaterial({
      color: 0xf5deb3,
      roughness: 0.9
    });
    const pillow = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.15, 0.5),
      pillowMat
    );
    pillow.position.set(0, 1.75, -0.6);
    pillow.castShadow = true;
    this.group.add(pillow);

    const stairGeo = new THREE.BoxGeometry(0.8, 0.2, 0.5);
    for (let i = 0; i < 3; i++) {
      const stair = new THREE.Mesh(stairGeo, woodMat);
      stair.position.set(-2.2 + i * 0.45, 0.1 + i * 0.5, 0);
      stair.castShadow = true;
      stair.receiveShadow = true;
      this.group.add(stair);
      collision.addMeshCollider(stair, 'platform-stair');
    }
  }
}
