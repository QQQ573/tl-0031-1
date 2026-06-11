import './styles/main.css';
import * as THREE from 'three';
import { PLAYER, INFO_POINTS } from './config';
import type { DeviceType, InfoPointData } from './types';
import { SceneManager } from './core/SceneManager';
import { CollisionSystem } from './core/CollisionSystem';
import { FPSController } from './core/FPSController';
import { MobileController } from './core/MobileController';
import { Enclosure } from './scene/Enclosure';
import { ClimbingFrame } from './scene/ClimbingFrame';
import { WaterPool } from './scene/WaterPool';
import { EnclosureDoor } from './scene/EnclosureDoor';
import { RestPlatform } from './scene/RestPlatform';
import { FeedingArea } from './scene/FeedingArea';
import { InfoPoints } from './scene/InfoPoints';
import { StartScreen } from './ui/StartScreen';
import { HUD } from './ui/HUD';
import { InfoPanel } from './ui/InfoPanel';

const container = document.getElementById('app') as HTMLElement;
const deviceType: DeviceType = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
) || ('ontouchstart' in window && window.innerWidth < 900)
  ? 'mobile'
  : 'desktop';

const sceneMgr = new SceneManager(container);
const collision = new CollisionSystem();
const controller = new FPSController(sceneMgr.camera, sceneMgr.renderer.domElement, collision);

let mobileCtrl: MobileController | null = null;
if (deviceType === 'mobile') {
  mobileCtrl = new MobileController(container, controller);
}

const enclosure = new Enclosure(collision);
const climbingFrame = new ClimbingFrame(collision);
const waterPool = new WaterPool(collision);
const enclosureDoor = new EnclosureDoor(collision);
const restPlatform = new RestPlatform(collision);
const feedingArea = new FeedingArea(collision);
const infoPoints = new InfoPoints();

sceneMgr.scene.add(
  enclosure.group,
  climbingFrame.group,
  waterPool.group,
  enclosureDoor.group,
  restPlatform.group,
  feedingArea.group,
  infoPoints.group
);

sceneMgr.camera.position.copy(PLAYER.INITIAL_POS);
sceneMgr.camera.lookAt(0, PLAYER.HEIGHT, 0);

const startScreen = new StartScreen(container, deviceType);
const hud = new HUD(container, deviceType);
const infoPanel = new InfoPanel(container);

let started = false;

hud.onReset = () => {
  controller.reset(PLAYER.INITIAL_POS.clone());
  sceneMgr.camera.lookAt(0, PLAYER.HEIGHT, 0);
  if (deviceType === 'desktop') controller.requestLock();
};

const openInfo = (data: InfoPointData) => {
  infoPanel.show(data);
  if (deviceType === 'desktop') controller.exitLock();
};

sceneMgr.renderer.domElement.addEventListener('click', () => {
  if (!started) return;
  if (infoPanel.isVisible()) return;
  if (deviceType === 'desktop' && document.pointerLockElement !== sceneMgr.renderer.domElement) {
    controller.requestLock();
    return;
  }
  if (deviceType === 'desktop') {
    const hit = infoPoints.getClosestToCenter(sceneMgr.camera, 5);
    if (hit) {
      openInfo(hit);
    }
  }
});

container.addEventListener('touchend', (e) => {
  if (!started || infoPanel.isVisible()) return;
  const touch = e.changedTouches[0];
  if (!touch) return;
  if (mobileCtrl && touch.clientX < window.innerWidth * 0.4 && touch.clientY > window.innerHeight * 0.6) {
    return;
  }
  const nx = (touch.clientX / window.innerWidth) * 2 - 1;
  const ny = -(touch.clientY / window.innerHeight) * 2 + 1;
  const hit = infoPoints.pick(sceneMgr.camera, nx, ny);
  if (hit && hit.distance < 6) {
    openInfo(hit.data);
  }
});

controller.onPointerLockChange = (locked) => {
  if (!started) return;
  hud.setCrosshairVisible(locked);
};

startScreen.setOnStart(() => {
  started = true;
  if (deviceType === 'desktop') {
    controller.requestLock();
  } else if (mobileCtrl) {
    mobileCtrl.enable();
  }
  animate();
});

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(sceneMgr.getDelta(), 0.05);
  const time = sceneMgr.getElapsed();

  if (started) {
    controller.update(delta);
    infoPoints.update(time);
    waterPool.update(time);
    hud.updateFPS(delta);

    if (deviceType === 'desktop' && !infoPanel.isVisible()) {
      const hover = infoPoints.getClosestToCenter(sceneMgr.camera, 4);
      if (hover) {
        hud.showTooltip(`点击查看「${hover.title}」`);
      } else {
        hud.hideTooltip();
      }
    }
  }

  sceneMgr.render();
}

(window as any).__DEBUG__ = {
  sceneMgr,
  controller,
  collision,
  getTriangles: () => {
    let count = 0;
    sceneMgr.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.geometry) {
        const pos = obj.geometry.attributes.position;
        if (pos) count += pos.count / 3;
      }
    });
    return Math.round(count);
  }
};
