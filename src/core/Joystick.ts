import type { JoystickState } from '../types';

export class Joystick {
  private container: HTMLElement;
  private knob: HTMLElement;
  private touchId: number | null = null;
  private centerX: number = 0;
  private centerY: number = 0;
  private maxRadius: number = 50;
  state: JoystickState = { active: false, x: 0, y: 0 };
  onChange?: (state: JoystickState) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.knob = document.createElement('div');
    this.knob.className = 'joystick-knob';
    this.container.appendChild(this.knob);
    this.maxRadius = this.container.clientWidth / 2 - this.knob.clientWidth / 2;
    this.bindEvents();
  }

  private bindEvents(): void {
    this.container.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    this.container.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    this.container.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
    this.container.addEventListener('touchcancel', this.onTouchEnd.bind(this), { passive: false });
  }

  private onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    const touch = e.changedTouches[0];
    this.touchId = touch.identifier;
    const rect = this.container.getBoundingClientRect();
    this.centerX = rect.left + rect.width / 2;
    this.centerY = rect.top + rect.height / 2;
    this.container.classList.add('active');
    this.state.active = true;
    this.updateFromTouch(touch);
  }

  private onTouchMove(e: TouchEvent): void {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.touchId) {
        this.updateFromTouch(touch);
        break;
      }
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.touchId) {
        this.touchId = null;
        this.state.active = false;
        this.state.x = 0;
        this.state.y = 0;
        this.knob.style.transform = 'translate(-50%, -50%)';
        this.container.classList.remove('active');
        this.onChange?.(this.state);
        break;
      }
    }
  }

  private updateFromTouch(touch: Touch): void {
    let dx = touch.clientX - this.centerX;
    let dy = touch.clientY - this.centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > this.maxRadius) {
      const scale = this.maxRadius / dist;
      dx *= scale;
      dy *= scale;
    }
    this.state.x = dx / this.maxRadius;
    this.state.y = dy / this.maxRadius;
    this.knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    this.onChange?.(this.state);
  }

  show(): void {
    this.container.classList.add('visible');
  }

  hide(): void {
    this.container.classList.remove('visible');
  }
}
