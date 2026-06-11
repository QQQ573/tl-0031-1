import * as THREE from 'three';
import { PLAYER } from '../config';
import { Joystick } from './Joystick';
import { FPSController } from './FPSController';

export class MobileController {
  private joystickContainer: HTMLElement;
  private touchLookHint: HTMLElement;
  private joystick: Joystick;
  private controller: FPSController;
  private lookTouchId: number | null = null;
  private lastLookX: number = 0;
  private lastLookY: number = 0;
  private enabled: boolean = false;

  constructor(container: HTMLElement, controller: FPSController) {
    this.controller = controller;
    this.joystickContainer = document.createElement('div');
    this.joystickContainer.className = 'joystick-container';
    container.appendChild(this.joystickContainer);
    this.joystick = new Joystick(this.joystickContainer);
    this.joystick.onChange = (state) => {
      this.controller.setMovement(-state.y, state.x);
    };

    this.touchLookHint = document.createElement('div');
    this.touchLookHint.className = 'touch-look-hint';
    this.touchLookHint.textContent = '👆 滑动屏幕环顾四周';
    container.appendChild(this.touchLookHint);

    this.bindLookEvents(container);
  }

  private bindLookEvents(target: HTMLElement): void {
    target.addEventListener('touchstart', (e) => {
      if (!this.enabled) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (this.joystickContainer.contains(touch.target as Node)) continue;
        if (this.lookTouchId === null) {
          this.lookTouchId = touch.identifier;
          this.lastLookX = touch.clientX;
          this.lastLookY = touch.clientY;
          this.touchLookHint.classList.remove('visible');
          break;
        }
      }
    }, { passive: true });

    target.addEventListener('touchmove', (e) => {
      if (!this.enabled) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.lookTouchId) {
          const dx = touch.clientX - this.lastLookX;
          const dy = touch.clientY - this.lastLookY;
          this.lastLookX = touch.clientX;
          this.lastLookY = touch.clientY;
          this.controller.addYaw(-dx * PLAYER.TOUCH_SENSITIVITY);
          this.controller.addPitch(-dy * PLAYER.TOUCH_SENSITIVITY);
          break;
        }
      }
    }, { passive: true });

    target.addEventListener('touchend', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.lookTouchId) {
          this.lookTouchId = null;
          break;
        }
      }
    }, { passive: true });
  }

  enable(): void {
    this.enabled = true;
    this.joystick.show();
    this.touchLookHint.classList.add('visible');
    setTimeout(() => {
      this.touchLookHint.classList.remove('visible');
    }, 4000);
  }

  disable(): void {
    this.enabled = false;
    this.joystick.hide();
    this.touchLookHint.classList.remove('visible');
    this.controller.setMovement(0, 0);
  }
}
