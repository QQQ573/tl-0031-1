import * as THREE from 'three';

export class Panda {
  group: THREE.Group;
  private bodyParts: {
    head: THREE.Mesh;
    body: THREE.Mesh;
    leftArm: THREE.Mesh;
    rightArm: THREE.Mesh;
    leftLeg: THREE.Mesh;
    rightLeg: THREE.Mesh;
    tail: THREE.Mesh;
    nose: THREE.Mesh;
  };
  private animTime: number = 0;
  private basePos: THREE.Vector3;

  constructor(position: THREE.Vector3 = new THREE.Vector3(0, 0, 0), rotationY: number = 0) {
    this.group = new THREE.Group();
    this.group.name = 'Panda';
    this.basePos = position.clone();
    this.group.position.copy(position);
    this.group.rotation.y = rotationY;

    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.85,
      metalness: 0.0
    });
    const blackMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.9,
      metalness: 0.0
    });
    const darkGrayMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8
    });

    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 24, 20),
      whiteMat
    );
    body.scale.set(1.1, 0.95, 1.4);
    body.position.y = 0.75;
    body.castShadow = true;
    body.receiveShadow = true;
    this.group.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 24, 20),
      whiteMat
    );
    head.position.set(0, 1.35, 0.38);
    head.scale.set(1.05, 1, 1);
    head.castShadow = true;
    this.group.add(head);

    const makeEar = (x: number) => {
      const ear = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 14),
        blackMat
      );
      ear.position.set(x, 1.68, 0.12);
      ear.scale.set(1, 1.1, 0.7);
      ear.castShadow = true;
      this.group.add(ear);
      return ear;
    };
    makeEar(-0.28);
    makeEar(0.28);

    const makeEyePatch = (x: number) => {
      const patch = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 16, 12),
        blackMat
      );
      patch.position.set(x, 1.38, 0.72);
      patch.scale.set(0.7, 1, 0.2);
      patch.rotation.y = x > 0 ? -0.3 : 0.3;
      this.group.add(patch);

      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 12, 10),
        darkGrayMat
      );
      eye.position.set(x + (x > 0 ? 0.02 : -0.02), 1.38, 0.84);
      this.group.add(eye);

      const eyeShine = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      eyeShine.position.set(x + 0.01, 1.4, 0.88);
      this.group.add(eyeShine);
    };
    makeEyePatch(-0.16);
    makeEyePatch(0.16);

    const nose = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 14, 10),
      new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.5 })
    );
    nose.position.set(0, 1.22, 0.78);
    nose.scale.set(1.3, 0.8, 0.8);
    this.group.add(nose);

    const mouthGeo = new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI);
    const mouth = new THREE.Mesh(
      mouthGeo,
      new THREE.MeshStandardMaterial({ color: 0x3a2020, roughness: 0.8 })
    );
    mouth.position.set(0, 1.13, 0.76);
    mouth.rotation.x = Math.PI;
    this.group.add(mouth);

    const makeLimb = (isArm: boolean, x: number, z: number) => {
      const limb = new THREE.Mesh(
        new THREE.CapsuleGeometry(isArm ? 0.11 : 0.13, isArm ? 0.28 : 0.3, 8, 12),
        blackMat
      );
      limb.position.set(x, isArm ? 0.95 : 0.35, z);
      limb.rotation.z = x * (isArm ? 0.25 : 0.08);
      limb.rotation.x = isArm ? 0.2 : -0.05;
      limb.castShadow = true;
      limb.receiveShadow = true;
      this.group.add(limb);
      return limb;
    };

    const leftArm = makeLimb(true, -0.5, 0.15);
    const rightArm = makeLimb(true, 0.5, 0.15);
    const leftLeg = makeLimb(false, -0.3, -0.1);
    const rightLeg = makeLimb(false, 0.3, -0.1);

    const tail = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 12, 10),
      whiteMat
    );
    tail.position.set(0, 0.7, -0.72);
    tail.scale.set(1, 0.9, 1.2);
    tail.castShadow = true;
    this.group.add(tail);

    this.bodyParts = {
      head, body, leftArm, rightArm, leftLeg, rightLeg, tail, nose
    };

    this.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
      }
    });
  }

  update(time: number, delta: number): void {
    this.animTime += delta;
    const t = this.animTime;

    const breathe = Math.sin(t * 2) * 0.015;
    this.bodyParts.body.scale.y = 0.95 + breathe;
    this.bodyParts.body.position.y = 0.75 + breathe * 0.5;
    this.bodyParts.head.position.y = 1.35 + breathe * 0.5;

    const idle = Math.sin(t * 1.2) * 0.06;
    this.bodyParts.head.rotation.y = idle;
    this.bodyParts.head.rotation.x = Math.sin(t * 0.8) * 0.05;

    const armSwing = Math.sin(t * 1.5) * 0.08;
    this.bodyParts.leftArm.rotation.x = 0.2 + armSwing;
    this.bodyParts.rightArm.rotation.x = 0.2 - armSwing;

    this.group.position.y = this.basePos.y + Math.sin(t * 0.8) * 0.01;
  }
}
