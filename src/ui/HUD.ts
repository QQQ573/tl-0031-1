import type { DeviceType } from '../types';

export class HUD {
  private container: HTMLElement;
  private fpsEl: HTMLElement;
  private hintEl: HTMLElement;
  private resetBtn: HTMLButtonElement;
  private crosshair: HTMLElement;
  private tooltip: HTMLElement;
  private frameTimes: number[] = [];
  onReset?: () => void;

  constructor(container: HTMLElement, deviceType: DeviceType) {
    this.container = container;

    this.fpsEl = document.createElement('div');
    this.fpsEl.className = 'hud hud-top-right';
    this.fpsEl.innerHTML = `<div class="hud-fps">FPS: --</div>`;
    container.appendChild(this.fpsEl);

    this.hintEl = document.createElement('div');
    this.hintEl.className = 'hud hud-top-left';
    const hintText = deviceType === 'desktop'
      ? '使用 <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> 移动，点击画面环顾四周'
      : '左下角摇杆移动，滑动屏幕环顾';
    this.hintEl.innerHTML = `<div class="hud-hint">${hintText}</div>`;
    container.appendChild(this.hintEl);

    this.resetBtn = document.createElement('button');
    this.resetBtn.className = 'hud-reset-btn';
    this.resetBtn.textContent = '🔄 重置位置';
    const resetWrap = document.createElement('div');
    resetWrap.className = 'hud hud-bottom-right';
    resetWrap.style.pointerEvents = 'auto';
    resetWrap.appendChild(this.resetBtn);
    container.appendChild(resetWrap);
    this.resetBtn.addEventListener('click', () => this.onReset?.());

    this.crosshair = document.createElement('div');
    this.crosshair.className = 'hud-crosshair';
    if (deviceType === 'desktop') container.appendChild(this.crosshair);

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'hud-tooltip';
    container.appendChild(this.tooltip);
  }

  updateFPS(delta: number): void {
    this.frameTimes.push(delta);
    if (this.frameTimes.length > 30) this.frameTimes.shift();
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const fps = Math.round(1 / avg);
    this.fpsEl.querySelector('.hud-fps')!.textContent = `FPS: ${fps}`;
  }

  showTooltip(text: string): void {
    this.tooltip.textContent = text;
    this.tooltip.classList.add('visible');
  }

  hideTooltip(): void {
    this.tooltip.classList.remove('visible');
  }

  setCrosshairVisible(v: boolean): void {
    this.crosshair.style.display = v ? 'block' : 'none';
  }
}
