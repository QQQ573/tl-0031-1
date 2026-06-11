import * as THREE from 'three';
import type { RouteStation, RouteData } from '../types';
import { DiscoveryTracker } from './DiscoveryTracker';
import { Minimap } from '../ui/Minimap';
import { INFO_POINTS } from '../config';

export class FacilityGuide {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private container: HTMLElement;
  private tracker: DiscoveryTracker;
  private minimap: Minimap;
  private guideHud: HTMLElement;
  private waypointArrow: THREE.Group | null = null;
  private completionOverlay: HTMLElement | null = null;
  private stations: RouteStation[];
  private showDistanceForStation: string | null = null;
  private showDistanceTimer: number = 0;
  onReset?: () => void;

  static async load(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    container: HTMLElement
  ): Promise<FacilityGuide> {
    const res = await fetch('./guideRoute.json');
    if (!res.ok) throw new Error('Failed to load guideRoute.json');
    const data: RouteData = await res.json();
    return new FacilityGuide(scene, camera, container, data.stations);
  }

  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    container: HTMLElement,
    stations: RouteStation[]
  ) {
    this.scene = scene;
    this.camera = camera;
    this.container = container;
    this.stations = stations;
    this.tracker = new DiscoveryTracker(stations);

    this.minimap = new Minimap(container, stations);
    this.minimap.onStationClick = (st) => this.showStationDistance(st);

    this.guideHud = document.createElement('div');
    this.guideHud.className = 'guide-hud';
    container.appendChild(this.guideHud);

    this.createWaypointArrow();

    this.tracker.onProgressChange = (p) => {
      this.minimap.updateDiscovered(
        p.stations.filter((s) => s.discovered).map((s) => s.id)
      );
      const current = this.tracker.getCurrentStation();
      this.minimap.updateCurrent(current?.id || null);
    };

    this.tracker.onAllDiscovered = () => {
      this.showCompletionOverlay();
      this.hideWaypointArrow();
    };

    this.updateGuideHud();
  }

  private createWaypointArrow(): void {
    const group = new THREE.Group();
    group.name = 'WaypointArrow';

    const coneGeo = new THREE.ConeGeometry(0.4, 1.2, 20, 1);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.rotation.x = Math.PI;
    cone.position.y = 0.6;
    group.add(cone);

    const ringGeo = new THREE.RingGeometry(0.5, 0.6, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.1;
    group.add(ring);

    const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8);
    const poleMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.4
    });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1.25;
    group.add(pole);

    this.waypointArrow = group;
    this.scene.add(group);
  }

  private showWaypointArrow(pos: { x: number; y: number; z: number }): void {
    if (!this.waypointArrow) return;
    this.waypointArrow.visible = true;
    this.waypointArrow.position.set(pos.x, pos.y + 2.5, pos.z);
  }

  private hideWaypointArrow(): void {
    if (this.waypointArrow) {
      this.waypointArrow.visible = false;
    }
  }

  update(
    playerPos: { x: number; y: number; z: number },
    playerYaw: number,
    delta: number,
    time: number
  ): void {
    this.tracker.update(playerPos, delta);

    const current = this.tracker.getCurrentStation();
    if (current) {
      const dist = this.distanceXZ(playerPos, current.worldPos);

      if (dist > 8) {
        this.showWaypointArrow(current.worldPos);
      } else if (dist < 3) {
        this.hideWaypointArrow();
      }

      if (this.waypointArrow && this.waypointArrow.visible) {
        this.waypointArrow.lookAt(
          this.camera.position.x,
          this.waypointArrow.position.y,
          this.camera.position.z
        );
        const pulse = 0.75 + Math.sin(time * 3) * 0.15;
        this.waypointArrow.traverse((obj) => {
          if (obj instanceof THREE.Mesh && obj.material) {
            const mat = obj.material as THREE.MeshBasicMaterial;
            if (mat.opacity !== undefined) {
              mat.opacity = (mat.opacity > 0.5 ? 0.75 : 0.5) * pulse;
            }
          }
        });
      }
    }

    this.minimap.updatePlayer(playerPos, playerYaw);
    this.updateGuideHud();

    if (this.showDistanceForStation && this.showDistanceTimer > 0) {
      this.showDistanceTimer -= delta;
      if (this.showDistanceTimer <= 0) {
        this.showDistanceForStation = null;
      }
    }
  }

  private distanceXZ(
    a: { x: number; y: number; z: number },
    b: { x: number; y: number; z: number }
  ): number {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  private getStationTitle(id: string): string {
    const info = INFO_POINTS.find((i) => i.id === id);
    return info ? `${info.icon} ${info.title}` : id;
  }

  private updateGuideHud(): void {
    const current = this.tracker.getCurrentStation();
    const discovered = this.tracker.getDiscoveredCount();
    const total = this.tracker.getTotalCount();

    if (this.showDistanceForStation) {
      const st = this.stations.find((s) => s.id === this.showDistanceForStation);
      if (st) {
        const dist = this.minimap.getDistanceToStation(st);
        this.guideHud.innerHTML = `
          <div class="guide-hud-title">📍 ${this.getStationTitle(st.id)}</div>
          <div class="guide-hud-distance">直线距离 ${dist.toFixed(1)} m</div>
          <div class="guide-hud-progress">
            <span class="guide-hud-progress-count">${discovered}/${total}</span>
            <div class="guide-hud-progress-bar">
              <div class="guide-hud-progress-fill" style="width: ${(discovered / total) * 100}%"></div>
            </div>
          </div>
        `;
        return;
      }
    }

    if (current) {
      const dist = this.distanceXZ(this.camera.position, current.worldPos);
      this.guideHud.innerHTML = `
        <div class="guide-hud-title">🎯 下一站：${this.getStationTitle(current.id)}</div>
        <div class="guide-hud-distance">剩余 ${dist.toFixed(1)} m</div>
        <div class="guide-hud-hint">${current.hintText}</div>
        <div class="guide-hud-progress">
          <span class="guide-hud-progress-count">进度 ${discovered}/${total}</span>
          <div class="guide-hud-progress-bar">
            <div class="guide-hud-progress-fill" style="width: ${(discovered / total) * 100}%"></div>
          </div>
        </div>
      `;
    } else if (this.tracker.isCompleted()) {
      this.guideHud.innerHTML = `
        <div class="guide-hud-title">🎉 寻访完成！</div>
        <div class="guide-hud-hint">你已探索全部 ${total} 处设施</div>
        <div class="guide-hud-progress">
          <span class="guide-hud-progress-count">${discovered}/${total}</span>
          <div class="guide-hud-progress-bar">
            <div class="guide-hud-progress-fill" style="width: 100%"></div>
          </div>
        </div>
      `;
    }
  }

  markPanelOpened(stationId: string): void {
    this.tracker.markPanelOpened(stationId);
  }

  private showStationDistance(station: RouteStation): void {
    this.showDistanceForStation = station.id;
    this.showDistanceTimer = 4;
    this.updateGuideHud();
  }

  private showCompletionOverlay(): void {
    this.completionOverlay = document.createElement('div');
    this.completionOverlay.className = 'completion-overlay';
    this.completionOverlay.innerHTML = `
      <div class="completion-card">
        <div class="completion-icon">🎊</div>
        <h2 class="completion-title">寻访完成！</h2>
        <p class="completion-desc">你已完整探索大熊猫兽舍的全部 6 处设施，感谢你的参观！</p>
        <div class="completion-stats">
          <div class="completion-stat">
            <div class="completion-stat-value">6</div>
            <div class="completion-stat-label">设施寻访</div>
          </div>
          <div class="completion-stat">
            <div class="completion-stat-value">🐼</div>
            <div class="completion-stat-label">国宝了解</div>
          </div>
          <div class="completion-stat">
            <div class="completion-stat-value">⭐⭐⭐</div>
            <div class="completion-stat-label">体验评分</div>
          </div>
        </div>
        <button class="completion-btn" id="reset-guide-btn">🔄 重新开始寻访</button>
      </div>
    `;
    this.container.appendChild(this.completionOverlay);

    const btn = this.completionOverlay.querySelector('#reset-guide-btn') as HTMLButtonElement;
    btn.addEventListener('click', () => {
      this.resetGuide();
    });

    setTimeout(() => {
      if (this.completionOverlay) {
        this.completionOverlay.classList.add('visible');
      }
    }, 50);
  }

  private resetGuide(): void {
    this.tracker.reset();
    this.minimap.updateDiscovered([]);
    const current = this.tracker.getCurrentStation();
    this.minimap.updateCurrent(current?.id || null);
    if (this.completionOverlay) {
      this.completionOverlay.classList.remove('visible');
      setTimeout(() => {
        if (this.completionOverlay && this.completionOverlay.parentNode) {
          this.completionOverlay.parentNode.removeChild(this.completionOverlay);
        }
        this.completionOverlay = null;
      }, 400);
    }
    this.onReset?.();
    this.updateGuideHud();
  }

  getTracker(): DiscoveryTracker {
    return this.tracker;
  }

  isCompleted(): boolean {
    return this.tracker.isCompleted();
  }

  dispose(): void {
    if (this.waypointArrow) {
      this.scene.remove(this.waypointArrow);
    }
    if (this.guideHud.parentNode) {
      this.guideHud.parentNode.removeChild(this.guideHud);
    }
    if (this.completionOverlay && this.completionOverlay.parentNode) {
      this.completionOverlay.parentNode.removeChild(this.completionOverlay);
    }
    this.minimap.dispose();
  }
}
