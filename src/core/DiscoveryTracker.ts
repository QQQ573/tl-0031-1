import type { RouteStation, StationState, GuideProgress } from '../types';

export class DiscoveryTracker {
  private stations: RouteStation[];
  private state: Map<string, StationState>;
  private currentIndex: number = 0;
  private completed: boolean = false;
  private elapsedTime: number = 0;
  onProgressChange?: (progress: GuideProgress) => void;
  onStationDiscovered?: (stationId: string, index: number) => void;
  onAllDiscovered?: () => void;

  constructor(stations: RouteStation[]) {
    this.stations = stations;
    this.state = new Map();
    stations.forEach((s) => {
      this.state.set(s.id, {
        id: s.id,
        discovered: false,
        panelOpened: false,
        enteredTime: null,
        stayTime: 0
      });
    });
  }

  update(playerPos: { x: number; y: number; z: number }, delta: number): void {
    if (this.completed) return;
    this.elapsedTime += delta;

    const current = this.stations[this.currentIndex];
    if (!current) return;

    const stationState = this.state.get(current.id)!;
    const dist = this.distanceXZ(playerPos, current.worldPos);

    if (dist <= current.radius) {
      if (stationState.enteredTime === null) {
        stationState.enteredTime = this.elapsedTime;
      } else {
        stationState.stayTime += delta;
      }

      const hasStayedEnough = stationState.stayTime >= 3;
      if ((stationState.panelOpened || hasStayedEnough) && !stationState.discovered) {
        this.markDiscovered(current.id);
      }
    } else {
      if (stationState.enteredTime !== null) {
        stationState.enteredTime = null;
      }
    }
  }

  markPanelOpened(stationId: string): void {
    const s = this.state.get(stationId);
    if (!s) return;
    s.panelOpened = true;
    const station = this.stations[this.currentIndex];
    if (station && station.id === stationId && !s.discovered) {
      const dist = this.distanceXZ(
        { x: 0, y: 0, z: 0 },
        station.worldPos
      );
      if (dist <= station.radius || s.stayTime >= 0) {
        this.markDiscovered(stationId);
      }
    }
  }

  private markDiscovered(stationId: string): void {
    const s = this.state.get(stationId);
    if (!s || s.discovered) return;
    s.discovered = true;

    const idx = this.stations.findIndex((st) => st.id === stationId);
    this.onStationDiscovered?.(stationId, idx);

    if (idx === this.currentIndex) {
      this.currentIndex++;
      if (this.currentIndex >= this.stations.length) {
        this.completed = true;
        this.onAllDiscovered?.();
      }
    }

    this.notifyProgress();
  }

  getCurrentStation(): RouteStation | null {
    if (this.completed) return null;
    return this.stations[this.currentIndex] || null;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getStationState(id: string): StationState | undefined {
    return this.state.get(id);
  }

  isDiscovered(id: string): boolean {
    return this.state.get(id)?.discovered || false;
  }

  isCompleted(): boolean {
    return this.completed;
  }

  getTotalCount(): number {
    return this.stations.length;
  }

  getDiscoveredCount(): number {
    let count = 0;
    this.state.forEach((s) => {
      if (s.discovered) count++;
    });
    return count;
  }

  getProgress(): GuideProgress {
    const stations: StationState[] = [];
    this.stations.forEach((s) => {
      const state = this.state.get(s.id)!;
      stations.push(state);
    });
    return {
      currentIndex: this.currentIndex,
      completed: this.completed,
      stations
    };
  }

  reset(): void {
    this.currentIndex = 0;
    this.completed = false;
    this.elapsedTime = 0;
    this.stations.forEach((s) => {
      this.state.set(s.id, {
        id: s.id,
        discovered: false,
        panelOpened: false,
        enteredTime: null,
        stayTime: 0
      });
    });
    this.notifyProgress();
  }

  private distanceXZ(
    a: { x: number; y: number; z: number },
    b: { x: number; y: number; z: number }
  ): number {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  private notifyProgress(): void {
    this.onProgressChange?.(this.getProgress());
  }
}
