import * as THREE from 'three';
import { SCENE, COLORS } from '../config';
import { CollisionSystem } from '../core/CollisionSystem';

export class Enclosure {
  group: THREE.Group;
  private collision: CollisionSystem;

  constructor(collision: CollisionSystem) {
    this.group = new THREE.Group();
    this.group.name = 'Enclosure';
    this.collision = collision;
    this.build();
  }

  private build(): void {
    const hw = SCENE.WIDTH / 2;
    const hd = SCENE.DEPTH / 2;
    const h = SCENE.HEIGHT;
    const t = SCENE.WALL_THICKNESS;

    const wallMat = new THREE.MeshStandardMaterial({
      color: COLORS.WALL,
      roughness: 0.85,
      metalness: 0.05
    });
    const floorMat = new THREE.MeshStandardMaterial({
      color: COLORS.FLOOR,
      roughness: 0.9,
      metalness: 0
    });
    const ceilMat = new THREE.MeshStandardMaterial({
      color: COLORS.CEILING,
      roughness: 0.7,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(SCENE.WIDTH, 0.2, SCENE.DEPTH),
      floorMat
    );
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    this.group.add(floor);

    const ceiling = new THREE.Mesh(
      new THREE.BoxGeometry(SCENE.WIDTH, 0.2, SCENE.DEPTH),
      ceilMat
    );
    ceiling.position.y = h + 0.1;
    ceiling.receiveShadow = true;
    this.group.add(ceiling);

    const backWall = this.makeWall(SCENE.WIDTH + t * 2, h, t, wallMat);
    backWall.position.set(0, h / 2, -hd - t / 2);
    this.addCollidable(backWall);

    const frontWallL = this.makeWall((SCENE.WIDTH - 3) / 2, h, t, wallMat);
    frontWallL.position.set(-hw / 2 - 1.5 / 2, h / 2, hd + t / 2);
    this.addCollidable(frontWallL);

    const frontWallR = this.makeWall((SCENE.WIDTH - 3) / 2, h, t, wallMat);
    frontWallR.position.set(hw / 2 + 1.5 / 2, h / 2, hd + t / 2);
    this.addCollidable(frontWallR);

    const frontWallTop = this.makeWall(3, h - 2.8, t, wallMat);
    frontWallTop.position.set(0, h - (h - 2.8) / 2, hd + t / 2);
    this.group.add(frontWallTop);

    const leftWall = this.makeWall(t, h, SCENE.DEPTH + t * 2, wallMat);
    leftWall.position.set(-hw - t / 2, h / 2, 0);
    this.addCollidable(leftWall);

    const rightWall = this.makeWall(t, h, SCENE.DEPTH + t * 2, wallMat);
    rightWall.position.set(hw + t / 2, h / 2, 0);
    this.addCollidable(rightWall);

    this.addWindows();
    this.addBaseboard();
  }

  private makeWall(w: number, h: number, d: number, mat: THREE.Material): THREE.Mesh {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.group.add(mesh);
    return mesh;
  }

  private addCollidable(mesh: THREE.Mesh): void {
    this.collision.addMeshCollider(mesh);
  }

  private addWindows(): void {
    const hd = SCENE.DEPTH / 2;
    const hw = SCENE.WIDTH / 2;
    const t = SCENE.WALL_THICKNESS;

    const glassMat = new THREE.MeshStandardMaterial({
      color: COLORS.WINDOW_GLASS,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.2,
      side: THREE.DoubleSide
    });
    const frameMat = new THREE.MeshStandardMaterial({
      color: COLORS.METAL,
      roughness: 0.4,
      metalness: 0.7
    });

    const makeWindow = (x: number, y: number, z: number, ry: number) => {
      const group = new THREE.Group();
      const w = 2.5, h = 1.8, d = 0.08;
      const glass = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glassMat);
      group.add(glass);
      const barH = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.08, d + 0.06), frameMat);
      const barV = new THREE.Mesh(new THREE.BoxGeometry(0.08, h + 0.1, d + 0.06), frameMat);
      const barTop = barH.clone();
      barTop.position.y = h / 2;
      const barBot = barH.clone();
      barBot.position.y = -h / 2;
      const barL = barV.clone();
      barL.position.x = -w / 2;
      const barR = barV.clone();
      barR.position.x = w / 2;
      const barMid = barV.clone();
      group.add(barTop, barBot, barL, barR, barMid);
      group.position.set(x, y, z);
      group.rotation.y = ry;
      this.group.add(group);
    };

    makeWindow(-hw / 2, 3.2, -hd - t / 2 + 0.05, 0);
    makeWindow(hw / 2, 3.2, -hd - t / 2 + 0.05, 0);
    makeWindow(-hw - t / 2 + 0.05, 3.2, -hd / 2, Math.PI / 2);
    makeWindow(-hw - t / 2 + 0.05, 3.2, hd / 2, Math.PI / 2);
  }

  private addBaseboard(): void {
    const hw = SCENE.WIDTH / 2;
    const hd = SCENE.DEPTH / 2;
    const baseMat = new THREE.MeshStandardMaterial({
      color: COLORS.WOOD_DARK,
      roughness: 0.7,
      metalness: 0.1
    });
    const h = 0.15, d = 0.04;
    const makeBase = (w: number, x: number, z: number, ry: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), baseMat);
      m.position.set(x, h / 2, z);
      m.rotation.y = ry;
      this.group.add(m);
    };
    makeBase(SCENE.WIDTH, 0, -hd + 0.02, 0);
    makeBase(SCENE.DEPTH, -hw + 0.02, 0, Math.PI / 2);
    makeBase(SCENE.DEPTH, hw - 0.02, 0, Math.PI / 2);
    makeBase((SCENE.WIDTH - 3) / 2, -hw / 2 - 1.5 / 2, hd - 0.02, 0);
    makeBase((SCENE.WIDTH - 3) / 2, hw / 2 + 1.5 / 2, hd - 0.02, 0);
  }
}
