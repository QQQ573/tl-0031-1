import * as THREE from 'three';
import type { AABB, CollisionBox } from '../types';

export class CollisionSystem {
  private boxes: CollisionBox[] = [];

  addBox(box: AABB, tag?: string): void {
    this.boxes.push({ box, tag });
  }

  addMeshCollider(mesh: THREE.Object3D, tag?: string): void {
    const box = new THREE.Box3().setFromObject(mesh);
    this.boxes.push({
      box: { min: box.min.clone(), max: box.max.clone() },
      tag
    });
  }

  checkCollision(pos: THREE.Vector3, radius: number): boolean {
    for (const { box } of this.boxes) {
      if (this.sphereIntersectsAABB(pos, radius, box)) {
        return true;
      }
    }
    return false;
  }

  checkCollisionXZ(pos: THREE.Vector3, radius: number, y: number): boolean {
    const testPos = new THREE.Vector3(pos.x, y, pos.z);
    for (const { box } of this.boxes) {
      if (this.sphereIntersectsAABB(testPos, radius, box)) {
        return true;
      }
    }
    return false;
  }

  resolveCollision(
    pos: THREE.Vector3,
    prevPos: THREE.Vector3,
    radius: number
  ): THREE.Vector3 {
    const result = pos.clone();
    const testX = new THREE.Vector3(pos.x, prevPos.y, prevPos.z);
    if (this.checkCollisionXZ(testX, radius, prevPos.y)) {
      result.x = prevPos.x;
    }
    const testZ = new THREE.Vector3(result.x, prevPos.y, pos.z);
    if (this.checkCollisionXZ(testZ, radius, prevPos.y)) {
      result.z = prevPos.z;
    }
    return result;
  }

  private sphereIntersectsAABB(
    center: THREE.Vector3,
    radius: number,
    box: AABB
  ): boolean {
    const cx = Math.max(box.min.x, Math.min(center.x, box.max.x));
    const cy = Math.max(box.min.y, Math.min(center.y, box.max.y));
    const cz = Math.max(box.min.z, Math.min(center.z, box.max.z));
    const dx = center.x - cx;
    const dy = center.y - cy;
    const dz = center.z - cz;
    return dx * dx + dy * dy + dz * dz < radius * radius;
  }
}
