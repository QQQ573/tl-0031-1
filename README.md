# 🐼 大熊猫室内兽舍 3D 漫游

基于 Three.js r160 + TypeScript + Vite 的浏览器端第一人称 3D 漫游应用，面向外地游客展示大熊猫室内兽舍环境与饲养设施科普信息。

## ✨ 功能特性

- **沉浸式漫游**：桌面端 WASD / 方向键移动 + 鼠标 Pointer Lock 环顾
- **移动端适配**：虚拟摇杆控制移动，滑动屏幕环顾视角
- **设施交互**：5 处金色信息点，点击弹出设施介绍与饲养说明
- **真实感场景**：PCF 软阴影、PBR 材质、雾效、ACES 色调映射
- **碰撞系统**：AABB 碰撞检测防止穿墙与穿越设施
- **性能优化**：几何体复用、Draw Call 控制、像素比限制

## 🚀 快速开始

### 开发模式

```bash
npm install
npm run dev
```
访问 http://localhost:5173

### 生产构建

```bash
npm run build
npm run preview
```

### Docker 部署（含 gzip 压缩）

```bash
docker compose up -d --build
```
访问 http://localhost:8080

## 🗺️ 场景层级结构

```
Scene
├── Enclosure (兽舍建筑)
│   ├── Floor (地面)
│   ├── Ceiling (天花板)
│   ├── Walls [N/S/E/W + Front 门洞 + Front 顶梁]
│   ├── Windows x4 (金属框玻璃窗)
│   └── Baseboard (木质踢脚线)
├── ClimbingFrame (攀爬架) @ (-5, 0, -2)
│   ├── Posts x6 (实木立柱)
│   ├── Platforms x2 (两层木质平台)
│   ├── Ramps x2 (斜向爬梯)
│   ├── Horizontal Bars x5+1 (顶部横杆)
│   └── Ropes x2 (悬挂绳索)
├── WaterPool (戏水池) @ (4, 0, -3)
│   ├── Bottom (池底)
│   ├── Edges x4 (木质围边 + 碰撞体)
│   ├── Water (动态水面)
│   └── Rocks x2 (装饰石)
├── EnclosureDoor (内舍门) @ (0, 0, 8)
│   ├── Door Frame (木门框)
│   ├── Door Panel (门板 + 浮雕)
│   ├── Handle + Knob (金属把手)
│   └── Window (观察玻璃窗)
├── RestPlatform (休息平台) @ (6, 0, 3)
│   ├── Legs x4 (木质支架)
│   ├── Platform (台面)
│   ├── Mat (竹编草垫)
│   ├── Backrest (靠背)
│   ├── Pillow (枕头)
│   └── Stairs x3 (侧楼梯)
├── FeedingArea (喂食区) @ (-6, 0, 4)
│   ├── Table (木质餐桌)
│   ├── Bowls x2 (不锈钢食盆)
│   ├── Bamboo Sticks x8 (新鲜竹子)
│   └── Water Dispenser (饮水器)
└── InfoPoints (信息点)
    ├── climbing-frame @ (-5, 2.2, -2)  🪵 攀爬架
    ├── water-pool    @ (4, 0.6, -3)    💧 戏水池
    ├── enclosure-door@ (0, 1.8, 7.5)   🚪 内舍门
    ├── rest-platform @ (6, 2.0, 3)     🛏️ 休息平台
    └── feeding-area  @ (-6, 0.8, 4)    🎋 喂食区
```

### 场景尺寸

| 参数 | 值 |
|------|-----|
| 室内长 (Z) | 16m |
| 室内宽 (X) | 20m |
| 室内高 (Y) | 5m |
| 门洞宽 | 3m |
| 玩家身高 | 1.7m |
| 移动速度 | 3.5 m/s |

## 🎮 操作说明

### 桌面端
| 操作 | 按键 |
|------|------|
| 前进 | `W` / `↑` |
| 后退 | `S` / `↓` |
| 左移 | `A` / `←` |
| 右移 | `D` / `→` |
| 环顾四周 | 点击画面锁定鼠标后移动 |
| 退出锁定 | `ESC` |
| 查看信息 | 准星对准金色信息点后点击 |
| 重置位置 | 点击右下角「🔄 重置位置」 |

### 移动端
| 操作 | 方式 |
|------|------|
| 移动 | 左下角虚拟摇杆 |
| 环顾 | 屏幕空白区域滑动手指 |
| 查看信息 | 点击金色信息点 |

## 📊 性能验收标准

| 指标 | 目标值 | 验收方法 |
|------|-------|---------|
| **帧率 (FPS)** | ≥ 60 | Chrome DevTools Performance / HUD 实时显示，1080p 中端笔记本 (i5-1235U / MX550 同级) |
| **三角形总数** | ≤ 50,000 | 浏览器控制台执行 `__DEBUG__.getTriangles()` |
| **Draw Call** | ≤ 50 | Chrome DevTools → More Tools → Rendering → FPS meter / Three.js Inspector |
| **首屏加载** | ≤ 3s | Chrome DevTools Network 面板，Disable Cache + Fast 3G，gzip 后 |
| **JS 包体积 (gzip)** | ≤ 500KB | 查看 `dist/assets/*.js.gz` 总大小 |
| **内存占用** | ≤ 300MB | Chrome Task Manager 标签页内存 |

### 调试 API

在浏览器控制台可使用：
```js
__DEBUG__.getTriangles()   // 返回当前场景三角形总数
__DEBUG__.sceneMgr         // 访问 SceneManager 实例
__DEBUG__.controller       // 访问 FPS 控制器
```

## 📁 项目结构

```
tl-0031-1/
├── src/
│   ├── main.ts                 # 应用入口与主循环
│   ├── types.ts                # 全局 TS 类型
│   ├── config.ts               # 场景尺寸/颜色/信息点数据
│   ├── core/
│   │   ├── SceneManager.ts     # 场景/相机/渲染器/光照
│   │   ├── FPSController.ts    # WASD + Pointer Lock 控制器
│   │   ├── MobileController.ts # 移动端触控 + 滑动视角
│   │   ├── Joystick.ts         # 虚拟摇杆组件
│   │   └── CollisionSystem.ts  # AABB 碰撞检测
│   ├── scene/
│   │   ├── Enclosure.ts        # 兽舍墙体/地面/天花板/窗
│   │   ├── ClimbingFrame.ts    # 攀爬架
│   │   ├── WaterPool.ts        # 戏水池（含水面动画）
│   │   ├── EnclosureDoor.ts    # 内舍门
│   │   ├── RestPlatform.ts     # 休息平台
│   │   ├── FeedingArea.ts      # 喂食区与竹子
│   │   └── InfoPoints.ts       # 发光信息点 + 射线拾取
│   ├── ui/
│   │   ├── StartScreen.ts      # 开始界面与操作提示
│   │   ├── HUD.ts              # FPS / 提示 / 重置按钮
│   │   └── InfoPanel.ts        # 饲养说明弹窗
│   └── styles/
│       └── main.css            # 全局样式
├── docker/
│   ├── nginx.conf              # Nginx 配置（gzip + 缓存）
│   └── Dockerfile              # 多阶段构建镜像
├── docker-compose.yml          # Docker Compose 编排
├── vite.config.ts              # Vite 配置（Three.js 分 chunk）
├── tsconfig.json               # TypeScript 配置
└── package.json                # 依赖与脚本
```

## 🛠️ 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 3D 引擎 | Three.js | r160 (0.160.0) |
| 语言 | TypeScript | 5.x |
| 构建工具 | Vite | 5.x |
| Web 服务器 | Nginx | 1.27 (Docker) |
| 容器 | Docker + Compose | v2 |

## 📝 License

内部项目
