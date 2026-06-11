import type { InfoPointData } from '../types';

export class InfoPanel {
  private element: HTMLElement;
  private body: HTMLElement;
  private closeBtn: HTMLButtonElement;

  constructor(container: HTMLElement) {
    this.element = document.createElement('div');
    this.element.className = 'info-panel';
    this.element.innerHTML = `
      <div class="info-panel-header">
        <div class="info-panel-title-row">
          <span class="info-panel-icon"></span>
          <span class="info-panel-title"></span>
        </div>
        <button class="info-panel-close" aria-label="关闭">×</button>
      </div>
      <div class="info-panel-body"></div>
    `;
    container.appendChild(this.element);
    this.body = this.element.querySelector('.info-panel-body') as HTMLElement;
    this.closeBtn = this.element.querySelector('.info-panel-close') as HTMLButtonElement;
    this.closeBtn.addEventListener('click', () => this.hide());
  }

  show(data: InfoPointData): void {
    (this.element.querySelector('.info-panel-icon') as HTMLElement).textContent = data.icon;
    (this.element.querySelector('.info-panel-title') as HTMLElement).textContent = data.title;
    this.body.innerHTML = `
      <div class="info-panel-section">
        <div class="info-panel-label">设施介绍</div>
        <div class="info-panel-text">${data.description}</div>
      </div>
      <div class="info-panel-section">
        <div class="info-panel-label">饲养说明</div>
        <div class="info-panel-text feeding">${data.feedingNote}</div>
      </div>
    `;
    this.element.classList.add('visible');
  }

  hide(): void {
    this.element.classList.remove('visible');
  }

  isVisible(): boolean {
    return this.element.classList.contains('visible');
  }
}
