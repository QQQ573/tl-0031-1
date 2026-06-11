import * as THREE from 'three';

export interface AABB {
  min: THREE.Vector3;
  max: THREE.Vector3;
}

export interface InfoPointData {
  id: string;
  position: THREE.Vector3;
  title: string;
  icon: string;
  description: string;
  feedingNote: string;
}

export interface CollisionBox {
  box: AABB;
  tag?: string;
}

export interface ControllerState {
  forward: number;
  right: number;
  yaw: number;
  pitch: number;
}

export interface JoystickState {
  active: boolean;
  x: number;
  y: number;
}

export type DeviceType = 'desktop' | 'mobile';
