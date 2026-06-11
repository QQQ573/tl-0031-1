import * as THREE from 'three';
import { SCENE } from '../config';

export class SceneManager {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf5f0e1);
    this.scene.fog = new THREE.Fog(0xf5f0e1, 15, 40);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    container.appendChild(this.renderer.domElement);
    window.addEventListener('resize', this.onResize.bind(this));

    this.setupLights();
  }

  private setupLights(): void {
    const ambient = new THREE.AmbientLight(0xfff5e6, 0.45);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.left = -SCENE.WIDTH / 2 - 2;
    dirLight.shadow.camera.right = SCENE.WIDTH / 2 + 2;
    dirLight.shadow.camera.top = SCENE.DEPTH / 2 + 2;
    dirLight.shadow.camera.bottom = -SCENE.DEPTH / 2 - 2;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 30;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    const pointLight1 = new THREE.PointLight(0xffe4b5, 0.6, 15, 2);
    pointLight1.position.set(-5, 4, -3);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffe4b5, 0.6, 15, 2);
    pointLight2.position.set(5, 4, 3);
    this.scene.add(pointLight2);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x8b7355, 0.25);
    this.scene.add(hemi);
  }

  getDelta(): number {
    return this.clock.getDelta();
  }

  getElapsed(): number {
    return this.clock.elapsedTime;
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  dispose(): void {
    window.removeEventListener('resize', this.onResize.bind(this));
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
