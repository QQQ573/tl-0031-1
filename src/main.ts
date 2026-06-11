import './styles/main.css';
import * as THREE from 'three';
import { PLAYER, INFO_POINTS } from './config';
import type { DeviceType, InfoPointData } from './types';
import { SceneManager } from './core/SceneManager';
import { CollisionSystem } from './core/CollisionSystem';
import { FPSController } from './core/FPSController';
import { MobileController } from './core/MobileController';
import { FacilityGuide } from './core/FacilityGuide';
import { Enclosure } from './scene/Enclosure';
import { ClimbingFrame } from './scene/ClimbingFrame';
import { WaterPool } from './scene/WaterPool';
import { EnclosureDoor } from './scene/EnclosureDoor';
import { RestPlatform } from './scene/RestPlatform';
import { FeedingArea } from './scene/FeedingArea';
import { InfoPoints } from './scene/InfoPoints';
import { Panda } from './scene/Panda';
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

const panda1 = new Panda(new THREE.Vector3(2, 0, 0), Math.PI * 0.3);
const panda2 = new Panda(new THREE.Vector3(-3, 0, 2.5), -Math.PI * 0.5);
panda2.group.scale.setScalar(0.85);

sceneMgr.scene.add(
  enclosure.group,
  climbingFrame.group,
  waterPool.group,
  enclosureDoor.group,
  restPlatform.group,
  feedingArea.group,
  infoPoints.group,
  panda1.group,
  panda2.group
);

sceneMgr.camera.position.copy(PLAYER.INITIAL_POS);
sceneMgr.camera.lookAt(0, PLAYER.HEIGHT, 0);

const startScreen = new StartScreen(container, deviceType);
const hud = new HUD(container, deviceType);
const infoPanel = new InfoPanel(container);

let started = false;
let facilityGuide: FacilityGuide | null = null;

FacilityGuide.load(sceneMgr.scene, sceneMgr.camera, container)
  .then((guide) => {
    facilityGuide = guide;
    facilityGuide.onReset = () => {
      controller.reset(PLAYER.INITIAL_POS.clone());
      sceneMgr.camera.lookAt(0, PLAYER.HEIGHT, 0);
      if (deviceType === 'desktop') controller.requestLock();
    };
  })
  .catch((err) => {
    console.warn('Failed to load guide route:', err);
  });

hud.onReset = () => {
  controller.reset(PLAYER.INITIAL_POS.clone());
  sceneMgr.camera.lookAt(0, PLAYER.HEIGHT, 0);
  if (deviceType === 'desktop') controller.requestLock();
  if (facilityGuide) {
    facilityGuide.getTracker().reset();
  }
};

const openInfo = (data: InfoPointData) => {
  infoPanel.show(data);
  if (facilityGuide) {
    facilityGuide.markPanelOpened(data.id);
  }
  if (deviceType === 'desktop') controller.exitLock();
};

const tryOpenClosestInfo = (maxDistance: number = 5): boolean => {
  const hit = infoPoints.getClosestToCenter(sceneMgr.camera, maxDistance);
  if (hit) {
    openInfo(hit);
    return true;
  }
  return false;
};

if (deviceType === 'desktop') {
  document.addEventListener('keydown', (e) => {
    if (!started || infoPanel.isVisible()) return;
    if (e.code === 'KeyE' || e.code === 'Space') {
      tryOpenClosestInfo(5);
    }
  });

  const canvas = sceneMgr.renderer.domElement;
  const pointerDownPos = { x: 0, y: 0, t: 0 };

  canvas.addEventListener('mousedown', (e) => {
    if (!started) return;
    pointerDownPos.x = e.clientX;
    pointerDownPos.y = e.clientY;
    pointerDownPos.t = performance.now();
  });

  canvas.addEventListener('mouseup', (e) => {
    if (!started) return;
    const dx = e.clientX - pointerDownPos.x;
    const dy = e.clientY - pointerDownPos.y;
    const dt = performance.now() - pointerDownPos.t;
    const isClick = Math.sqrt(dx * dx + dy * dy) < 5 && dt < 300;
    if (!isClick) return;

    if (infoPanel.isVisible()) return;

    const locked = document.pointerLockElement === canvas;
    if (locked) {
      tryOpenClosestInfo(5);
    } else {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      const hit = infoPoints.pick(sceneMgr.camera, nx, ny);
      if (hit && hit.distance < 8) {
        openInfo(hit.data);
        return;
      }
      controller.requestLock();
    }
  });
}

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
}, { passive: true });

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
    panda1.update(time, delta);
    panda2.update(time, delta);
    hud.updateFPS(delta);

    if (facilityGuide) {
      const yaw = controller.state.yaw;
      facilityGuide.update(
        { x: sceneMgr.camera.position.x, y: sceneMgr.camera.position.y, z: sceneMgr.camera.position.z },
        yaw,
        delta,
        time
      );
    }

    if (deviceType === 'desktop' && !infoPanel.isVisible()) {
      const hover = infoPoints.getClosestToCenter(sceneMgr.camera, 4);
      if (hover) {
        hud.showTooltip(`点击 / 按 E 查看「${hover.title}」`);
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
  facilityGuide: () => facilityGuide,
  getTriangles: () => {
    let count = 0;
    sceneMgr.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.geometry) {
        const pos = obj.geometry.attributes.position;
        if (pos) count += pos.count / 3;
      }
    });
    return Math.round(count);
  },
  INFO_POINTS
};
