import * as THREE from 'three';
import { PLAYER } from '../config';
import type { ControllerState } from '../types';
import { CollisionSystem } from './CollisionSystem';

export class FPSController {
  camera: THREE.PerspectiveCamera;
  private keys: Set<string> = new Set();
  private yaw: number = 0;
  private pitch: number = 0;
  private isLocked: boolean = false;
  private canvas: HTMLCanvasElement;
  collision: CollisionSystem;
  state: ControllerState = { forward: 0, right: 0, yaw: 0, pitch: 0 };
  onPointerLockChange?: (locked: boolean) => void;

  constructor(camera: THREE.PerspectiveCamera, canvas: HTMLCanvasElement, collision: CollisionSystem) {
    this.camera = camera;
    this.canvas = canvas;
    this.collision = collision;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
    });
    document.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isLocked) return;
      this.yaw -= e.movementX * PLAYER.MOUSE_SENSITIVITY;
      this.pitch -= e.movementY * PLAYER.MOUSE_SENSITIVITY;
      this.pitch = Math.max(PLAYER.PITCH_MIN, Math.min(PLAYER.PITCH_MAX, this.pitch));
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = document.pointerLockElement === this.canvas;
      this.onPointerLockChange?.(this.isLocked);
    });
  }

  requestLock(): void {
    this.canvas.requestPointerLock?.();
  }

  exitLock(): void {
    document.exitPointerLock?.();
  }

  setRotation(yaw: number, pitch: number): void {
    this.yaw = yaw;
    this.pitch = Math.max(PLAYER.PITCH_MIN, Math.min(PLAYER.PITCH_MAX, pitch));
  }

  addYaw(delta: number): void {
    this.yaw += delta;
  }

  addPitch(delta: number): void {
    this.pitch = Math.max(PLAYER.PITCH_MIN, Math.min(PLAYER.PITCH_MAX, this.pitch + delta));
  }

  setMovement(forward: number, right: number): void {
    this.state.forward = THREE.MathUtils.clamp(forward, -1, 1);
    this.state.right = THREE.MathUtils.clamp(right, -1, 1);
  }

  update(delta: number): void {
    const kForward = (this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0) -
      (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0);
    const kRight = (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0) -
      (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0);

    const fwd = kForward || this.state.forward;
    const rgt = kRight || this.state.right;

    const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);

    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const prevPos = this.camera.position.clone();
    const speed = PLAYER.MOVE_SPEED * delta;

    const newPos = prevPos.clone();
    newPos.addScaledVector(forward, fwd * speed);
    newPos.addScaledVector(right, rgt * speed);
    newPos.y = PLAYER.HEIGHT;

    const resolved = this.collision.resolveCollision(newPos, prevPos, PLAYER.RADIUS);
    this.camera.position.copy(resolved);

    this.state.yaw = this.yaw;
    this.state.pitch = this.pitch;
  }

  reset(position: THREE.Vector3): void {
    this.camera.position.copy(position);
    this.yaw = 0;
    this.pitch = 0;
    this.state.forward = 0;
    this.state.right = 0;
  }
}
