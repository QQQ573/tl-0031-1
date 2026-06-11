import * as THREE from 'three';
import { COLORS } from '../config';
import { CollisionSystem } from '../core/CollisionSystem';

export class FeedingArea {
  group: THREE.Group;

  constructor(collision: CollisionSystem) {
    this.group = new THREE.Group();
    this.group.name = 'FeedingArea';
    this.group.position.set(-6, 0, 4);
    this.build(collision);
  }

  private build(collision: CollisionSystem): void {
    const metalMat = new THREE.MeshStandardMaterial({
      color: COLORS.METAL,
      roughness: 0.35,
      metalness: 0.8
    });
    const woodMat = new THREE.MeshStandardMaterial({
      color: COLORS.WOOD,
      roughness: 0.8,
      metalness: 0.1
    });

    const table = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.1, 1.2),
      woodMat
    );
    table.position.y = 0.8;
    table.castShadow = true;
    table.receiveShadow = true;
    this.group.add(table);
    collision.addMeshCollider(table, 'feeding-table');

    const legGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    const legPositions = [
      [-1, -0.5], [-1, 0.5],
      [1, -0.5], [1, 0.5]
    ];
    legPositions.forEach(([x, z]) => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(x, 0.4, z);
      leg.castShadow = true;
      this.group.add(leg);
      collision.addMeshCollider(leg, 'feeding-leg');
    });

    const bowlGeo = new THREE.CylinderGeometry(0.3, 0.25, 0.18, 24);
    const bowl1 = new THREE.Mesh(bowlGeo, metalMat);
    bowl1.position.set(-0.5, 0.8 + 0.09, 0);
    bowl1.castShadow = true;
    this.group.add(bowl1);

    const bowl2 = bowl1.clone();
    bowl2.position.x = 0.5;
    this.group.add(bowl2);

    const bowlInsideMat = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      roughness: 0.4,
      metalness: 0.6
    });
    const bowlInsideGeo = new THREE.CylinderGeometry(0.26, 0.22, 0.14, 24);
    const inside1 = new THREE.Mesh(bowlInsideGeo, bowlInsideMat);
    inside1.position.set(-0.5, 0.8 + 0.09 + 0.02, 0);
    this.group.add(inside1);
    const inside2 = inside1.clone();
    inside2.position.x = 0.5;
    this.group.add(inside2);

    const bambooMat = new THREE.MeshStandardMaterial({
      color: 0x7cb342,
      roughness: 0.8
    });
    const bambooGroup = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const stick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8),
        bambooMat
      );
      stick.position.set(
        -0.5 + (Math.random() - 0.5) * 0.3,
        0.95 + Math.random() * 0.1,
        (Math.random() - 0.5) * 0.2
      );
      stick.rotation.z = (Math.random() - 0.5) * 0.3;
      stick.rotation.x = (Math.random() - 0.5) * 0.4;
      bambooGroup.add(stick);
    }
    this.group.add(bambooGroup);

    const waterDispenser = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.8, 0.3),
      metalMat
    );
    waterDispenser.position.set(1.5, 0.4, 0.3);
    waterDispenser.castShadow = true;
    this.group.add(waterDispenser);
    collision.addMeshCollider(waterDispenser, 'water-dispenser');
  }
}
