import type { DeviceType } from '../types';

export class StartScreen {
  private element: HTMLElement;
  private onStart?: () => void;
  private deviceType: DeviceType;

  constructor(container: HTMLElement, deviceType: DeviceType) {
    this.deviceType = deviceType;
    this.element = document.createElement('div');
    this.element.className = 'start-screen';
    this.element.innerHTML = this.buildHTML();
    container.appendChild(this.element);
    const btn = this.element.querySelector('.start-btn') as HTMLButtonElement;
    btn.addEventListener('click', () => {
      this.hide();
      this.onStart?.();
    });
  }

  private buildHTML(): string {
    const tips = this.deviceType === 'desktop' ? `
      <div class="tip-card">
        <div class="tip-card-title">⌨️ 移动</div>
        <div class="tip-card-desc">使用 W A S D 或方向键在兽舍内自由移动</div>
      </div>
      <div class="tip-card">
        <div class="tip-card-title">🖱️ 视角</div>
        <div class="tip-card-desc">点击画面锁定鼠标，移动鼠标环顾四周，按 ESC 退出</div>
      </div>
      <div class="tip-card">
        <div class="tip-card-title">✨ 交互</div>
        <div class="tip-card-desc">将准星对准金色信息点并点击，查看饲养科普说明</div>
      </div>
    ` : `
      <div class="tip-card">
        <div class="tip-card-title">🕹️ 移动</div>
        <div class="tip-card-desc">使用左下角虚拟摇杆控制移动方向</div>
      </div>
      <div class="tip-card">
        <div class="tip-card-title">👆 视角</div>
        <div class="tip-card-desc">在屏幕空白区域滑动手指来环顾四周</div>
      </div>
      <div class="tip-card">
        <div class="tip-card-title">✨ 交互</div>
        <div class="tip-card-desc">点击金色信息点，查看设施的饲养科普说明</div>
      </div>
    `;
    return `
      <h1 class="start-title">🐼 大熊猫室内兽舍漫游</h1>
      <p class="start-subtitle">沉浸式体验大熊猫的日常生活环境，了解每一处设施背后的饲养智慧</p>
      <button class="start-btn">开始漫游</button>
      <div class="start-tips">${tips}</div>
    `;
  }

  setOnStart(callback: () => void): void {
    this.onStart = callback;
  }

  hide(): void {
    this.element.classList.add('hidden');
    setTimeout(() => {
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }, 400);
  }
}
