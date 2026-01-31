/**
 * Corridor Section - Photoly Studio
 * 3D parallax gallery with textures, images, and floor pricing
 */

import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default class Corridor {
  constructor(container) {
    this.container = container;
    this.canvasContainer = container.querySelector('[data-corridor-canvas]');
    this.zoneIndicator = container.querySelector('[data-corridor-zone]');
    this.zoneName = container.querySelector('.corridor__zone-name');
    
    this.isRunning = false;
    this.progress = 0;
    this.textureLoader = new THREE.TextureLoader();
    
    // Zone configurations
    this.zones = [
      { 
        name: 'Portraits', 
        start: 0, 
        end: 0.25, 
        wallColor: 0xF5F0E8,
        floorTexture: '/assets/textures/floors/oak.jpg',
        images: [
          '/assets/images/corridor/portraits/portrait-1.jpg',
          '/assets/images/corridor/portraits/portrait-2.jpg',
          '/assets/images/corridor/portraits/portrait-3.jpg',
          '/assets/images/corridor/portraits/portrait-4.jpg'
        ],
        pricing: 'Portraits · Starting at £100'
      },
      { 
        name: 'Weddings', 
        start: 0.25, 
        end: 0.5, 
        wallColor: 0xF0E4DF,
        floorTexture: '/assets/textures/floors/marble.jpg',
        images: [
          '/assets/images/corridor/weddings/wedding-1.jpg',
          '/assets/images/corridor/weddings/wedding-2.jpg',
          '/assets/images/corridor/weddings/wedding-3.jpg',
          '/assets/images/corridor/weddings/wedding-4.jpg'
        ],
        pricing: 'Weddings · Starting at £500'
      },
      { 
        name: 'Editorial', 
        start: 0.5, 
        end: 0.75, 
        wallColor: 0xD5D0CB,
        floorTexture: '/assets/textures/floors/concrete.jpg',
        images: [
          '/assets/images/corridor/editorial/editorial-1.jpg',
          '/assets/images/corridor/editorial/editorial-2.jpg',
          '/assets/images/corridor/editorial/editorial-3.jpg',
          '/assets/images/corridor/editorial/editorial-4.jpg'
        ],
        pricing: 'Editorial · Inquire for rates'
      },
      { 
        name: 'Personal', 
        start: 0.75, 
        end: 1.5, 
        wallColor: 0xf2e6c0,
        floorTexture: '/assets/textures/floors/walnut.jpg',
        images: [
          '/assets/images/corridor/personal/personal-1.jpg',
          '/assets/images/corridor/personal/personal-2.jpg',
          '/assets/images/corridor/personal/personal-3.jpg',
          '/assets/images/corridor/personal/personal-4.jpg'
        ],
        pricing: 'Personal Projects · From the heart'
      }
    ];
    
    this.currentZone = null;
    this.frames = [];
    this.floorTextMeshes = [];
    
    this.init();
  }

  init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupLights();
    this.createCorridor();
    this.createFloorPricing();
    this.setupScrollTrigger();
    this.bindEvents();
    this.start();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1A1614);
    this.scene.fog = new THREE.Fog(0x1A1614, 5, 35);
  }

  setupCamera() {
    const aspect = this.canvasContainer.clientWidth / this.canvasContainer.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
    this.camera.position.set(0, 1.6, 0);
    this.camera.lookAt(0, 1.6, -10);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(this.canvasContainer.clientWidth, this.canvasContainer.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.canvasContainer.appendChild(this.renderer.domElement);
  }

  setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);
    
    // Spotlight following camera
    this.spotlight = new THREE.SpotLight(0xffffff, 1.5);
    this.spotlight.position.set(0, 4, 2);
    this.spotlight.angle = Math.PI / 3;
    this.spotlight.penumbra = 0.5;
    this.spotlight.decay = 1;
    this.spotlight.distance = 30;
    this.spotlight.castShadow = true;
    this.spotlight.shadow.mapSize.width = 1024;
    this.spotlight.shadow.mapSize.height = 1024;
    this.scene.add(this.spotlight);
    this.scene.add(this.spotlight.target);
  }

  createCorridor() {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(8, 60);
    this.floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2C2622,
      roughness: 0.8,
      metalness: 0.1
    });
    
    // Try to load floor texture
    this.textureLoader.load(
      '/assets/textures/floors/oak.jpg',
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 30);
        this.floorMaterial.map = texture;
        this.floorMaterial.needsUpdate = true;
      },
      undefined,
      () => console.log('Floor texture not found, using color')
    );
    
    this.floor = new THREE.Mesh(floorGeometry, this.floorMaterial);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = 0;
    this.floor.position.z = -25;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);
    
    // Walls
    const wallGeometry = new THREE.PlaneGeometry(60, 5);
    
    // Left wall
    this.leftWallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xE8E2D9,
      roughness: 0.9,
      metalness: 0
    });
    this.leftWall = new THREE.Mesh(wallGeometry, this.leftWallMaterial);
    this.leftWall.rotation.y = Math.PI / 2;
    this.leftWall.position.set(-4, 2.5, -25);
    this.leftWall.receiveShadow = true;
    this.scene.add(this.leftWall);
    
    // Right wall
    this.rightWallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xE8E2D9,
      roughness: 0.9,
      metalness: 0
    });
    this.rightWall = new THREE.Mesh(wallGeometry, this.rightWallMaterial);
    this.rightWall.rotation.y = -Math.PI / 2;
    this.rightWall.position.set(4, 2.5, -25);
    this.rightWall.receiveShadow = true;
    this.scene.add(this.rightWall);
    
    // Ceiling (optional - dark)
    const ceilingGeometry = new THREE.PlaneGeometry(8, 60);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0x0A0A0A,
      roughness: 1
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 5, -25);
    this.scene.add(ceiling);
    
    // Create frames on walls
    this.createFrames();
  }

  createFrames() {
    const allImages = [];
    
    // Collect all images from all zones
    this.zones.forEach(zone => {
      zone.images.forEach(img => {
        allImages.push({ src: img, zone: zone.name });
      });
    });
    
    const frameCount = allImages.length;
    const spacing = 3.5;
    
    allImages.forEach((imageData, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const zPos = -5 - Math.floor(i / 2) * spacing;
      
      // Frame border
      const frameGeometry = new THREE.BoxGeometry(1.8, 1.2, 0.08);
      const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xC9A167,
        roughness: 0.3,
        metalness: 0.3
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.set(side * 3.9, 1.8, zPos);
      frame.rotation.y = side * Math.PI / 2;
      frame.castShadow = true;
      this.scene.add(frame);
      
      // Image inside frame
      const imageGeometry = new THREE.PlaneGeometry(1.6, 1.0);
      const imageMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x333333
      });
      
      // Load texture for this frame
      this.textureLoader.load(
        imageData.src,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          imageMaterial.map = texture;
          imageMaterial.needsUpdate = true;
        },
        undefined,
        () => {
          // Fallback - random color
          imageMaterial.color.setHex(Math.random() * 0xffffff);
        }
      );
      
      const image = new THREE.Mesh(imageGeometry, imageMaterial);
      image.position.set(side * 3.85, 1.8, zPos);
      image.rotation.y = side * Math.PI / 2;
      this.scene.add(image);
      
      this.frames.push({ frame, image, zPos, side, zone: imageData.zone });
    });
  }

  createFloorPricing() {
    // We'll use a canvas texture for the floor text
    this.zones.forEach((zone, index) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      
      // Clear
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Text
      ctx.fillStyle = 'rgba(201, 161, 103, 0.6)';
      ctx.font = 'bold 48px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(zone.pricing, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      
      const textGeometry = new THREE.PlaneGeometry(6, 0.75);
      const textMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8
      });
      
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.rotation.x = -Math.PI / 2;
      textMesh.position.set(0, 0.01, -8 - (index * 12));
      
      this.scene.add(textMesh);
      this.floorTextMeshes.push(textMesh);
    });
  }

  setupScrollTrigger() {
    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.container,
      start: 'top top',
      end: '+=300%',
      pin: true,
      scrub: 1,
      onUpdate: (self) => this.updateCorridor(self.progress)
    });
  }

  updateCorridor(progress) {
    this.progress = progress;
    
    // Move camera forward through corridor
    const zPosition = -progress * 45;
    this.camera.position.z = zPosition;
    this.camera.lookAt(0, 1.6, zPosition - 10);
    
    // Update spotlight position
    this.spotlight.position.set(0, 4, zPosition + 3);
    this.spotlight.target.position.set(0, 1, zPosition - 5);
    
    // Update zone
    this.updateZone(progress);
  }

  updateZone(progress) {
    const zone = this.zones.find(z => progress >= z.start && progress < z.end);
    
    if (zone && zone !== this.currentZone) {
      this.currentZone = zone;
      
      // Update zone indicator
      if (this.zoneName) {
        this.zoneName.textContent = zone.name;
      }
      if (this.zoneIndicator) {
        this.zoneIndicator.classList.add('is-visible');
      }
      
      // Animate wall color change
      const color = new THREE.Color(zone.wallColor);
      gsap.to(this.leftWallMaterial.color, {
        r: color.r,
        g: color.g,
        b: color.b,
        duration: 1.5
      });
      gsap.to(this.rightWallMaterial.color, {
        r: color.r,
        g: color.g,
        b: color.b,
        duration: 1.5
      });
      
      // Update scene background and fog for mood
      const bgColor = new THREE.Color(zone.wallColor).multiplyScalar(0.2);
      gsap.to(this.scene.background, {
        r: bgColor.r,
        g: bgColor.g,
        b: bgColor.b,
        duration: 1.5
      });
      gsap.to(this.scene.fog.color, {
        r: bgColor.r,
        g: bgColor.g,
        b: bgColor.b,
        duration: 1.5
      });
      
      // Load new floor texture if available
      if (zone.floorTexture) {
        this.textureLoader.load(
          zone.floorTexture,
          (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(4, 30);
            this.floorMaterial.map = texture;
            this.floorMaterial.needsUpdate = true;
          }
        );
      }
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    const width = this.canvasContainer.clientWidth;
    const height = this.canvasContainer.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
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
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.stop();
    
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }
    
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