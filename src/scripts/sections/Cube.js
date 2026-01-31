/**
 * Photo Cube Section - Photoly Studio
 * Interactive 3D cube with photographs on each face
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

export default class Cube {
  constructor(container) {
    this.container = container;
    this.canvasContainer = container.querySelector('[data-cube-canvas]');
    this.hint = container.querySelector('[data-cube-hint]');
    
    this.isRunning = false;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    
    // Image paths for cube faces
    this.faceImages = [
      '/assets/images/cube/face-1.jpg',
      '/assets/images/cube/face-2.jpg',
      '/assets/images/cube/face-3.jpg',
      '/assets/images/cube/face-4.jpg',
      '/assets/images/cube/face-5.jpg',
      '/assets/images/cube/face-6.jpg'
    ];
    
    this.init();
  }

  init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupLights();
    this.loadTexturesAndCreateCube();
    this.bindEvents();
    this.start();
  }

  setupScene() {
    this.scene = new THREE.Scene();
  }

  setupCamera() {
    const aspect = this.canvasContainer.clientWidth / this.canvasContainer.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.z = 5;
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    this.renderer.setSize(this.canvasContainer.clientWidth, this.canvasContainer.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.canvasContainer.appendChild(this.renderer.domElement);
  }

  setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambient);
    
    const directional = new THREE.DirectionalLight(0xffffff, 0.5);
    directional.position.set(5, 5, 5);
    this.scene.add(directional);
  }

  loadTexturesAndCreateCube() {
    const textureLoader = new THREE.TextureLoader();
    const materials = [];
    
    let loadedCount = 0;
    const totalTextures = this.faceImages.length;
    
    this.faceImages.forEach((imagePath, index) => {
      textureLoader.load(
        imagePath,
        // Success callback
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          materials[index] = new THREE.MeshStandardMaterial({ 
            map: texture,
            roughness: 0.5,
            metalness: 0.1
          });
          
          loadedCount++;
          
          // Once all textures are loaded, create the cube
          if (loadedCount === totalTextures) {
            this.createCube(materials);
          }
        },
        // Progress callback
        undefined,
        // Error callback - use fallback color
        (error) => {
          console.warn(`Failed to load texture: ${imagePath}`, error);
          const colors = [0xC9A167, 0x1A1614, 0xE8E2D9, 0x2C2622, 0xF5F0E8, 0x6B5D52];
          materials[index] = new THREE.MeshStandardMaterial({ 
            color: colors[index],
            roughness: 0.5,
            metalness: 0.1
          });
          
          loadedCount++;
          
          if (loadedCount === totalTextures) {
            this.createCube(materials);
          }
        }
      );
    });
  }

  createCube(materials) {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    
    this.cube = new THREE.Mesh(geometry, materials);
    this.scene.add(this.cube);
    
    // Slow idle rotation
    this.idleRotation = { x: 0.002, y: 0.003 };
    
    console.log('Cube created with textures');
  }

  bindEvents() {
    // Mouse events
    this.canvasContainer.addEventListener('mousedown', (e) => this.onMouseDown(e));
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mouseup', () => this.onMouseUp());
    
    // Touch events
    this.canvasContainer.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true });
    window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });
    window.addEventListener('touchend', () => this.onTouchEnd());
    
    // Resize
    window.addEventListener('resize', () => this.onResize());
  }

  onMouseDown(e) {
    this.isDragging = true;
    this.previousMousePosition = { x: e.clientX, y: e.clientY };
    this.hideHint();
  }

  onMouseMove(e) {
    if (!this.isDragging) return;
    
    const deltaX = e.clientX - this.previousMousePosition.x;
    const deltaY = e.clientY - this.previousMousePosition.y;
    
    this.velocity.x = deltaY * 0.005;
    this.velocity.y = deltaX * 0.005;
    
    if (this.cube) {
      this.cube.rotation.x += this.velocity.x;
      this.cube.rotation.y += this.velocity.y;
    }
    
    this.previousMousePosition = { x: e.clientX, y: e.clientY };
  }

  onMouseUp() {
    this.isDragging = false;
  }

  onTouchStart(e) {
    if (e.touches.length === 1) {
      this.isDragging = true;
      this.previousMousePosition = { 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      };
      this.hideHint();
    }
  }

  onTouchMove(e) {
    if (!this.isDragging || e.touches.length !== 1) return;
    
    const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
    const deltaY = e.touches[0].clientY - this.previousMousePosition.y;
    
    this.velocity.x = deltaY * 0.005;
    this.velocity.y = deltaX * 0.005;
    
    if (this.cube) {
      this.cube.rotation.x += this.velocity.x;
      this.cube.rotation.y += this.velocity.y;
    }
    
    this.previousMousePosition = { 
      x: e.touches[0].clientX, 
      y: e.touches[0].clientY 
    };
  }

  onTouchEnd() {
    this.isDragging = false;
  }

  onResize() {
    const width = this.canvasContainer.clientWidth;
    const height = this.canvasContainer.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  hideHint() {
    if (this.hint && !this.hint.classList.contains('is-hidden')) {
      this.hint.classList.add('is-hidden');
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
  }

  animate() {
    if (!this.isRunning) return;
    
    requestAnimationFrame(() => this.animate());
    
    if (this.cube) {
      if (!this.isDragging) {
        this.cube.rotation.x += this.idleRotation.x;
        this.cube.rotation.y += this.idleRotation.y;
        
        // Momentum decay
        this.velocity.x *= 0.95;
        this.velocity.y *= 0.95;
        
        this.cube.rotation.x += this.velocity.x;
        this.cube.rotation.y += this.velocity.y;
      }
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.stop();
    
    this.scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => {
            if (mat.map) mat.map.dispose();
            mat.dispose();
          });
        } else {
          if (object.material.map) object.material.map.dispose();
          object.material.dispose();
        }
      }
    });
    
    this.renderer.dispose();
    
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}