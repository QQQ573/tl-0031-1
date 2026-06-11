import * as THREE from 'three';
import type { InfoPointData } from './types';

export const SCENE = {
  WIDTH: 20,
  DEPTH: 16,
  HEIGHT: 5,
  WALL_THICKNESS: 0.4
};

export const PLAYER = {
  HEIGHT: 1.7,
  RADIUS: 0.4,
  MOVE_SPEED: 3.5,
  MOUSE_SENSITIVITY: 0.002,
  TOUCH_SENSITIVITY: 0.005,
  INITIAL_POS: new THREE.Vector3(0, 1.7, 6),
  PITCH_MIN: -Math.PI / 2 + 0.05,
  PITCH_MAX: Math.PI / 2 - 0.05
};

export const COLORS = {
  FLOOR: 0x8b7355,
  WALL: 0xf5f0e1,
  CEILING: 0xffffff,
  WOOD: 0x8b6914,
  WOOD_DARK: 0x5c4a1f,
  WATER: 0x4fc3f7,
  WATER_DEEP: 0x0288d1,
  METAL: 0x9e9e9e,
  GRASS_MAT: 0x66bb6a,
  INFO_POINT: 0xffd700,
  DOOR_FRAME: 0x5d4037,
  DOOR_PANEL: 0x8d6e63,
  WINDOW_GLASS: 0x88ccff
};

export const INFO_POINTS: InfoPointData[] = [
  {
    id: 'climbing-frame',
    position: new THREE.Vector3(-5, 2.2, -2),
    title: '攀爬架',
    icon: '🪵',
    description: '采用天然实木打造的多层攀爬结构，模拟野生大熊猫栖息地的树木环境。',
    feedingNote: '攀爬架不仅是娱乐设施，饲养员会在不同层级放置竹子和特制窝头，鼓励大熊猫攀爬取食，锻炼其四肢力量与协调能力，维持野生本能行为。'
  },
  {
    id: 'water-pool',
    position: new THREE.Vector3(4, 0.6, -3),
    title: '戏水池',
    icon: '💧',
    description: '恒温浅水池，水质每日检测更换，模拟山涧溪流环境。',
    feedingNote: '大熊猫怕热喜凉，夏季水池温度保持在 18-22℃。饲养员会在水中放置切块苹果、胡萝卜等食物，引导大熊猫玩水降温的同时补充水分与营养。'
  },
  {
    id: 'enclosure-door',
    position: new THREE.Vector3(0, 1.8, 7.5),
    title: '内舍门',
    icon: '🚪',
    description: '通往室内卧室的安全通道门，采用隔音隔热设计。',
    feedingNote: '内舍为大熊猫夜间休息区，配有恒温床和竹制睡垫。每日 7:00 与 18:00 饲养员会通过此门进行定点喂食与健康检查，确保大熊猫作息规律。'
  },
  {
    id: 'rest-platform',
    position: new THREE.Vector3(6, 2.0, 3),
    title: '休息平台',
    icon: '🛏️',
    description: '半开放式木质平台，铺有竹编软垫，是大熊猫最喜欢的午休位置。',
    feedingNote: '平台高度设计为 1.5 米，既方便大熊猫攀跳，也便于饲养员观察其进食状态。竹叶和竹笋会在此定点投放，让大熊猫在舒适的环境中用餐。'
  },
  {
    id: 'feeding-area',
    position: new THREE.Vector3(-6, 0.8, 4),
    title: '喂食区',
    icon: '🎋',
    description: '固定喂食区域，配备不锈钢食盆与饮水器。',
    feedingNote: '每日喂食 4 次：8:00 新鲜竹子，11:00 特制窝头（含玉米、大米、大豆），14:00 水果辅食，17:00 竹笋加餐。成年大熊猫日均进食约 20kg 竹子。'
  }
];
