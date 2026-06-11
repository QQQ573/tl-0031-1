import * as THREE from 'three';
import { SCENE, COLORS } from '../config';
import type { RouteStation } from '../types';

export class Minimap {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private stations: RouteStation[];
  private discovered: Set<string> = new Set();
  private currentId: string | null = null;
  private playerPos: { x: number; z: number } = { x: 0, z: 0 };
  private playerYaw: number = 0;
  private hoveredId: string | null = null;
  onStationClick?: (station: RouteStation) => void;
  private readonly MAP_W = 260;
  private readonly MAP_H = 216;
  private readonly PAD = 10;

  constructor(container: HTMLElement, stations: RouteStation[]) {
    this.container = container;
    this.stations = stations;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'minimap-canvas';
    this.canvas.width = this.MAP_W * window.devicePixelRatio;
    this.canvas.height = this.MAP_H * window.devicePixelRatio;
    this.canvas.style.width = `${this.MAP_W}px`;
    this.canvas.style.height = `${this.MAP_H}px`;

    const wrap = document.createElement('div');
    wrap.className = 'minimap-wrap';
    const title = document.createElement('div');
    title.className = 'minimap-title';
    title.textContent = '🗺️ 平面导览';
    wrap.appendChild(title);
    wrap.appendChild(this.canvas);
    this.container.appendChild(wrap);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    this.ctx = ctx;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredId = null;
      this.canvas.style.cursor = 'default';
      this.render();
    });

    this.render();
  }

  private worldToScreen(x: number, z: number): { x: number; y: number } {
    const sx = this.PAD + ((x + SCENE.WIDTH / 2) / SCENE.WIDTH) * (this.MAP_W - this.PAD * 2);
    const sy = this.PAD + ((z + SCENE.DEPTH / 2) / SCENE.DEPTH) * (this.MAP_H - this.PAD * 2);
    return { x: sx, y: sy };
  }

  private screenToWorld(sx: number, sy: number): { x: number; z: number } {
    const x = ((sx - this.PAD) / (this.MAP_W - this.PAD * 2)) * SCENE.WIDTH - SCENE.WIDTH / 2;
    const z = ((sy - this.PAD) / (this.MAP_H - this.PAD * 2)) * SCENE.DEPTH - SCENE.DEPTH / 2;
    return { x, z };
  }

  private handleClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    for (const st of this.stations) {
      const s = this.worldToScreen(st.worldPos.x, st.worldPos.z);
      const dx = sx - s.x;
      const dy = sy - s.y;
      if (dx * dx + dy * dy < 64) {
        this.onStationClick?.(st);
        return;
      }
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    let found: string | null = null;
    for (const st of this.stations) {
      const s = this.worldToScreen(st.worldPos.x, st.worldPos.z);
      const dx = sx - s.x;
      const dy = sy - s.y;
      if (dx * dx + dy * dy < 64) {
        found = st.id;
        break;
      }
    }

    if (found !== this.hoveredId) {
      this.hoveredId = found;
      this.canvas.style.cursor = found ? 'pointer' : 'default';
      this.render();
    }
  }

  updatePlayer(pos: { x: number; y: number; z: number }, yaw: number): void {
    this.playerPos = { x: pos.x, z: pos.z };
    this.playerYaw = yaw;
    this.render();
  }

  updateDiscovered(discoveredIds: string[]): void {
    this.discovered = new Set(discoveredIds);
    this.render();
  }

  updateCurrent(id: string | null): void {
    this.currentId = id;
    this.render();
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.MAP_W, this.MAP_H);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.beginPath();
    ctx.roundRect(0, 0, this.MAP_W, this.MAP_H, 10);
    ctx.fill();

    ctx.strokeStyle = 'rgba(45, 106, 79, 0.25)';
    ctx.lineWidth = 0.5;
    const gridSize = 40;
    for (let x = this.PAD; x <= this.MAP_W - this.PAD; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, this.PAD);
      ctx.lineTo(x, this.MAP_H - this.PAD);
      ctx.stroke();
    }
    for (let y = this.PAD; y <= this.MAP_H - this.PAD; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(this.PAD, y);
      ctx.lineTo(this.MAP_W - this.PAD, y);
      ctx.stroke();
    }

    const hw = SCENE.WIDTH / 2;
    const hd = SCENE.DEPTH / 2;
    const t = SCENE.WALL_THICKNESS;

    ctx.fillStyle = '#f5f0e1';
    ctx.strokeStyle = '#8b7355';
    ctx.lineWidth = 1;

    const floor = [
      this.worldToScreen(-hw, -hd),
      this.worldToScreen(hw, -hd),
      this.worldToScreen(hw, hd),
      this.worldToScreen(-hw, hd)
    ];
    ctx.beginPath();
    ctx.moveTo(floor[0].x, floor[0].y);
    for (let i = 1; i < floor.length; i++) ctx.lineTo(floor[i].x, floor[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#d7ccc8';
    const drawWall = (x1: number, z1: number, x2: number, z2: number) => {
      const p1 = this.worldToScreen(x1, z1);
      const p2 = this.worldToScreen(x2, z2);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 3;
      ctx.stroke();
    };

    drawWall(-hw - t, -hd - t, hw + t, -hd - t);
    drawWall(-hw - t, hd + t, -1.5, hd + t);
    drawWall(1.5, hd + t, hw + t, hd + t);
    drawWall(-hw - t, -hd - t, -hw - t, hd + t);
    drawWall(hw + t, -hd - t, hw + t, hd + t);

    ctx.strokeStyle = 'rgba(139, 105, 20, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    for (let i = 0; i < this.stations.length - 1; i++) {
      const a = this.stations[i];
      const b = this.stations[i + 1];
      const p1 = this.worldToScreen(a.worldPos.x, a.worldPos.z);
      const p2 = this.worldToScreen(b.worldPos.x, b.worldPos.z);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    this.stations.forEach((st, idx) => {
      const p = this.worldToScreen(st.worldPos.x, st.worldPos.z);
      const isDiscovered = this.discovered.has(st.id);
      const isCurrent = this.currentId === st.id;
      const isHovered = this.hoveredId === st.id;

      if (isCurrent) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = isDiscovered ? '#66bb6a' : (isCurrent ? '#FFD700' : '#9e9e9e');
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#333';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(idx + 1), p.x, p.y);

      if (isHovered) {
        const info = this.getInfoById(st.id);
        if (info) {
          ctx.fillStyle = 'rgba(0,0,0,0.75)';
          const labelW = ctx.measureText(info.title).width + 16;
          const lx = p.x - labelW / 2;
          const ly = p.y - 28;
          ctx.beginPath();
          ctx.roundRect(lx, ly, labelW, 18, 4);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = '11px sans-serif';
          ctx.textBaseline = 'middle';
          ctx.fillText(info.title, p.x, ly + 9);
        }
      }
    });

    const pp = this.worldToScreen(this.playerPos.x, this.playerPos.z);
    ctx.save();
    ctx.translate(pp.x, pp.y);
    ctx.rotate(-this.playerYaw);
    ctx.fillStyle = '#2196f3';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(7, 7);
    ctx.lineTo(0, 3);
    ctx.lineTo(-7, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('20×16m', this.MAP_W - 6, this.MAP_H - 6);
  }

  private getInfoById(id: string): { title: string } | null {
    const map: Record<string, { title: string }> = {
      'enclosure-door': { title: '🚪 内舍门' },
      'climbing-frame': { title: '🪵 攀爬架' },
      'panda': { title: '🐼 大熊猫' },
      'water-pool': { title: '💧 戏水池' },
      'rest-platform': { title: '🛏️ 休息平台' },
      'feeding-area': { title: '🎋 喂食区' }
    };
    return map[id] || null;
  }

  getDistanceToStation(station: RouteStation): number {
    const dx = this.playerPos.x - station.worldPos.x;
    const dz = this.playerPos.z - station.worldPos.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  dispose(): void {
    if (this.canvas.parentNode) {
      this.canvas.parentNode.parentNode?.removeChild(this.canvas.parentNode);
    }
  }
}
