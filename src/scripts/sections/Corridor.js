/**
 * Corridor Section - Photoly Studio
 * 3D parallax gallery with colored floors, wall images, and end photo wall
 * Click any image to expand it to fullscreen
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
    this.expandedView = container.querySelector('[data-corridor-expanded]');
    this.expandedImage = container.querySelector('[data-corridor-expanded-image]');
    this.expandedTitle = container.querySelector('[data-corridor-expanded-title]');
    this.expandedCategory = container.querySelector('[data-corridor-expanded-category]');
    
    this.isRunning = false;
    this.progress = 0;
    this.textureLoader = new THREE.TextureLoader();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.isExpanded = false;
    
    // Zone configurations with floor colors
    this.zones = [
      { 
        name: 'Portraits', 
        start: 0, 
        end: 0.25, 
        wallColor: 0xF5F0E8,
        floorColor: 0x8B7355,
        pricing: 'Portraits · Starting at $500'
      },
      { 
        name: 'Weddings', 
        start: 0.25, 
        end: 0.5, 
        wallColor: 0xF0E4DF,
        floorColor: 0xE8E8E8,
        pricing: 'Weddings · Starting at $3,000'
      },
      { 
        name: 'Editorial', 
        start: 0.5, 
        end: 0.75, 
        wallColor: 0xD5D0CB,
        floorColor: 0x808080,
        pricing: 'Editorial · Inquire for rates'
      },
      { 
        name: 'Personal', 
        start: 0.75, 
        end: 1, 
        wallColor: 0x2A1A18,
        floorColor: 0x3D2B1F,
        pricing: 'Personal Projects · From the heart'
      }
    ];
    
    // All corridor images with metadata
    this.corridorImages = [
      { src: '/assets/images/corridor/portraits/portrait-1.jpg', title: 'Portrait Study I', category: 'Portraits' },
      { src: '/assets/images/corridor/portraits/portrait-2.jpg', title: 'Portrait Study II', category: 'Portraits' },
      { src: '/assets/images/corridor/portraits/portrait-3.jpg', title: 'Portrait Study III', category: 'Portraits' },
      { src: '/assets/images/corridor/portraits/portrait-4.jpg', title: 'Portrait Study IV', category: 'Portraits' },
      { src: '/assets/images/corridor/weddings/wedding-1.jpg', title: 'The First Dance', category: 'Weddings' },
      { src: '/assets/images/corridor/weddings/wedding-2.jpg', title: 'Golden Hour', category: 'Weddings' },
      { src: '/assets/images/corridor/weddings/wedding-3.jpg', title: 'The Ceremony', category: 'Weddings' },
      { src: '/assets/images/corridor/weddings/wedding-4.jpg', title: 'Forever Begins', category: 'Weddings' },
      { src: '/assets/images/corridor/editorial/editorial-1.jpg', title: 'Urban Edge', category: 'Editorial' },
      { src: '/assets/images/corridor/editorial/editorial-2.jpg', title: 'Fashion Forward', category: 'Editorial' },
      { src: '/assets/images/corridor/editorial/editorial-3.jpg', title: 'Bold Statement', category: 'Editorial' },
      { src: '/assets/images/corridor/editorial/editorial-4.jpg', title: 'Modern Classic', category: 'Editorial' },
      { src: '/assets/images/corridor/personal/personal-1.jpg', title: 'Quiet Moments', category: 'Personal' },
      { src: '/assets/images/corridor/personal/personal-2.jpg', title: 'Home', category: 'Personal' },
      { src: '/assets/images/corridor/personal/personal-3.jpg', title: 'Wandering', category: 'Personal' },
      { src: '/assets/images/corridor/personal/personal-4.jpg', title: 'Reflection', category: 'Personal' }
    ];
    
    // End wall 3x3 grid images
    this.endWallImages = [
      { src: '/assets/images/corridor/endwall/end-1.jpg', title: 'Highlight I', category: 'Featured' },
      { src: '/assets/images/corridor/endwall/end-2.jpg', title: 'Highlight II', category: 'Featured' },
      { src: '/assets/images/corridor/endwall/end-3.jpg', title: 'Highlight III', category: 'Featured' },
      { src: '/assets/images/corridor/endwall/end-4.jpg', title: 'Highlight IV', category: 'Featured' },
      { src: '/assets/images/corridor/endwall/end-5.jpg', title: 'Highlight V', category: 'Featured' },
      { src: '/assets/images/corridor/endwall/end-6.jpg', title: 'Highlight VI', category: 'Featured' },
      { src: '/assets/images/corridor/endwall/end-7.jpg', title: 'Highlight VII', category: 'Featured' },
      { src: '/assets/images/corridor/endwall/end-8.jpg', title: 'Highlight VIII', category: 'Featured' },
      { src: '/assets/images/corridor/endwall/end-9.jpg', title: 'Highlight IX', category: 'Featured' }
    ];
    
    this.currentZone = null;
    this.frames = [];
    this.clickableImages = []; // Store meshes that can be clicked
    this.floorTextMeshes = [];
    
    this.init();
  }

  init() {
    this.createExpandedViewHTML();
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupLights();
    this.createCorridor();
    this.createWallFrames();
    this.createFloorPricing();
    this.createEndWall();
    this.setupScrollTrigger();
    this.bindEvents();
    this.start();
    
    console.log('Corridor initialized');
  }

  createExpandedViewHTML() {
    // Create expanded view overlay if it doesn't exist in HTML
    if (!this.expandedView) {
      const overlay = document.createElement('div');
      overlay.className = 'corridor__expanded';
      overlay.setAttribute('data-corridor-expanded', '');
      overlay.innerHTML = `
        <img class="corridor__expanded-image" data-corridor-expanded-image src="" alt="">
        <div class="corridor__expanded-caption">
          <h3 class="corridor__expanded-title" data-corridor-expanded-title></h3>
          <p class="corridor__expanded-category" data-corridor-expanded-category></p>
        </div>
        <button class="corridor__expanded-close" data-corridor-expanded-close>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
      this.container.appendChild(overlay);
      
      this.expandedView = overlay;
      this.expandedImage = overlay.querySelector('[data-corridor-expanded-image]');
      this.expandedTitle = overlay.querySelector('[data-corridor-expanded-title]');
      this.expandedCategory = overlay.querySelector('[data-corridor-expanded-category]');
    }
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1A1614);
    this.scene.fog = new THREE.Fog(0x1A1614, 5, 40);
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
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);
    
    this.spotlight = new THREE.SpotLight(0xffffff, 2);
    this.spotlight.position.set(0, 4, 2);
    this.spotlight.angle = Math.PI / 3;
    this.spotlight.penumbra = 0.5;
    this.spotlight.decay = 1;
    this.spotlight.distance = 40;
    this.spotlight.castShadow = true;
    this.spotlight.shadow.mapSize.width = 1024;
    this.spotlight.shadow.mapSize.height = 1024;
    this.scene.add(this.spotlight);
    this.scene.add(this.spotlight.target);
    
    const fillLight1 = new THREE.PointLight(0xffffff, 0.3);
    fillLight1.position.set(-3, 2, -10);
    this.scene.add(fillLight1);
    
    const fillLight2 = new THREE.PointLight(0xffffff, 0.3);
    fillLight2.position.set(3, 2, -10);
    this.scene.add(fillLight2);
  }

  createCorridor() {
    const corridorLength = 60;
    
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(8, corridorLength);
    this.floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B7355,
      roughness: 0.7,
      metalness: 0.1
    });
    
    this.floor = new THREE.Mesh(floorGeometry, this.floorMaterial);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = 0;
    this.floor.position.z = -corridorLength / 2;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);
    
    // Left wall
    const wallGeometry = new THREE.PlaneGeometry(corridorLength, 5);
    this.leftWallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xF5F0E8,
      roughness: 0.9,
      metalness: 0,
      side: THREE.DoubleSide
    });
    this.leftWall = new THREE.Mesh(wallGeometry, this.leftWallMaterial);
    this.leftWall.rotation.y = Math.PI / 2;
    this.leftWall.position.set(-4, 2.5, -corridorLength / 2);
    this.leftWall.receiveShadow = true;
    this.scene.add(this.leftWall);
    
    // Right wall
    this.rightWallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xF5F0E8,
      roughness: 0.9,
      metalness: 0,
      side: THREE.DoubleSide
    });
    this.rightWall = new THREE.Mesh(wallGeometry, this.rightWallMaterial);
    this.rightWall.rotation.y = -Math.PI / 2;
    this.rightWall.position.set(4, 2.5, -corridorLength / 2);
    this.rightWall.receiveShadow = true;
    this.scene.add(this.rightWall);
    
    // Ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(8, corridorLength);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0x0A0A0A,
      roughness: 1
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 5, -corridorLength / 2);
    this.scene.add(ceiling);
  }

  createWallFrames() {
    const frameCount = this.corridorImages.length;
    const startZ = -4;
    const spacing = 3.2;
    
    this.corridorImages.forEach((imageData, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const zPos = startZ - Math.floor(i / 2) * spacing;
      
      // Frame border
      const frameGeometry = new THREE.BoxGeometry(1.6, 1.1, 0.08);
      const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xC9A167,
        roughness: 0.3,
        metalness: 0.4
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.set(side * 3.95, 1.8, zPos);
      frame.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2;
      frame.castShadow = true;
      this.scene.add(frame);
      
      // Image plane
      const imageGeometry = new THREE.PlaneGeometry(1.4, 0.95);
      const imageMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x222222
      });
      
      const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
      imageMesh.position.set(side * 3.91, 1.8, zPos);
      imageMesh.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2;
      
      // Store image data on the mesh for click handling
      imageMesh.userData = {
        isClickable: true,
        imageSrc: imageData.src,
        title: imageData.title,
        category: imageData.category
      };
      
      this.scene.add(imageMesh);
      this.clickableImages.push(imageMesh);
      
      // Load texture
      this.textureLoader.load(
        imageData.src,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          imageMaterial.map = texture;
          imageMaterial.color.set(0xffffff);
          imageMaterial.needsUpdate = true;
        },
        undefined,
        (error) => {
          const colors = [0xC9A167, 0x6B5D52, 0xE8E2D9, 0x2C2622];
          imageMaterial.color.set(colors[i % colors.length]);
        }
      );
      
      this.frames.push({ frame, imageMesh, zPos });
    });
  }

  createFloorPricing() {
    this.zones.forEach((zone, index) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(201, 161, 103, 0.8)';
      ctx.font = 'bold 52px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(zone.pricing, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      
      const textGeometry = new THREE.PlaneGeometry(5, 0.6);
      const textMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        depthWrite: false
      });
      
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.rotation.x = -Math.PI / 2;
      textMesh.position.set(0, 0.02, -6 - (index * 12));
      
      this.scene.add(textMesh);
      this.floorTextMeshes.push(textMesh);
    });
  }

  createEndWall() {
    const endWallZ = -54;
    
    // End wall background
    const endWallGeometry = new THREE.PlaneGeometry(8, 5);
    const endWallMaterial = new THREE.MeshStandardMaterial({
      color: 0x1A1614,
      roughness: 0.9
    });
    const endWall = new THREE.Mesh(endWallGeometry, endWallMaterial);
    endWall.position.set(0, 2.5, endWallZ);
    this.scene.add(endWall);
    
    // 3x3 Photo grid
    const gridSize = 3;
    const photoSize = 1.2;
    const gap = 0.15;
    const totalWidth = gridSize * photoSize + (gridSize - 1) * gap;
    const startX = -totalWidth / 2 + photoSize / 2;
    const startY = 1.0 + photoSize / 2;
    
    this.endWallImages.forEach((imageData, i) => {
      const col = i % gridSize;
      const row = Math.floor(i / gridSize);
      
      const x = startX + col * (photoSize + gap);
      const y = startY + (gridSize - 1 - row) * (photoSize + gap);
      
      // Frame
      const frameGeometry = new THREE.BoxGeometry(photoSize + 0.1, photoSize + 0.1, 0.05);
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0xC9A167,
        roughness: 0.3,
        metalness: 0.4
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.set(x, y, endWallZ + 0.03);
      this.scene.add(frame);
      
      // Photo
      const photoGeometry = new THREE.PlaneGeometry(photoSize - 0.05, photoSize - 0.05);
      const photoMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333
      });
      
      const photo = new THREE.Mesh(photoGeometry, photoMaterial);
      photo.position.set(x, y, endWallZ + 0.06);
      
      // Store image data for click handling
      photo.userData = {
        isClickable: true,
        imageSrc: imageData.src,
        title: imageData.title,
        category: imageData.category
      };
      
      this.scene.add(photo);
      this.clickableImages.push(photo);
      
      // Load texture
      this.textureLoader.load(
        imageData.src,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          photoMaterial.map = texture;
          photoMaterial.color.set(0xffffff);
          photoMaterial.needsUpdate = true;
        },
        undefined,
        (error) => {
          const hue = (i * 40) % 360;
          photoMaterial.color.setHSL(hue / 360, 0.4, 0.5);
        }
      );
    });
    
    // "Thank You" text
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(250, 246, 240, 0.9)';
    ctx.font = 'italic 48px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Thank you for visiting', canvas.width / 2, canvas.height / 2);
    
    const thankYouTexture = new THREE.CanvasTexture(canvas);
    const thankYouGeometry = new THREE.PlaneGeometry(3, 0.6);
    const thankYouMaterial = new THREE.MeshBasicMaterial({
      map: thankYouTexture,
      transparent: true
    });
    
    const thankYouMesh = new THREE.Mesh(thankYouGeometry, thankYouMaterial);
    thankYouMesh.position.set(0, 0.4, endWallZ + 0.05);
    this.scene.add(thankYouMesh);
  }

  setupScrollTrigger() {
    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.container,
      start: 'top top',
      end: '+=400%',
      pin: true,
      scrub: 1,
      onUpdate: (self) => this.updateCorridor(self.progress)
    });
  }

  updateCorridor(progress) {
    this.progress = progress;
    
    const totalDistance = 52;
    const zPosition = -progress * totalDistance;
    this.camera.position.z = zPosition;
    this.camera.lookAt(0, 1.6, zPosition - 10);
    
    this.spotlight.position.set(0, 4, zPosition + 3);
    this.spotlight.target.position.set(0, 1.5, zPosition - 8);
    
    this.updateZone(progress);
  }

  updateZone(progress) {
    const zone = this.zones.find(z => progress >= z.start && progress < z.end);
    
    if (zone && zone !== this.currentZone) {
      this.currentZone = zone;
      
      if (this.zoneName) {
        this.zoneName.textContent = zone.name;
      }
      if (this.zoneIndicator) {
        this.zoneIndicator.classList.add('is-visible');
      }
      
      const wallColor = new THREE.Color(zone.wallColor);
      gsap.to(this.leftWallMaterial.color, {
        r: wallColor.r,
        g: wallColor.g,
        b: wallColor.b,
        duration: 1.5,
        ease: 'power2.inOut'
      });
      gsap.to(this.rightWallMaterial.color, {
        r: wallColor.r,
        g: wallColor.g,
        b: wallColor.b,
        duration: 1.5,
        ease: 'power2.inOut'
      });
      
      const floorColor = new THREE.Color(zone.floorColor);
      gsap.to(this.floorMaterial.color, {
        r: floorColor.r,
        g: floorColor.g,
        b: floorColor.b,
        duration: 1.5,
        ease: 'power2.inOut'
      });
      
      const bgColor = new THREE.Color(zone.wallColor).multiplyScalar(0.15);
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
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());
    
    // Click/tap on canvas to select image
    this.renderer.domElement.addEventListener('click', (e) => this.onCanvasClick(e));
    this.renderer.domElement.addEventListener('touchend', (e) => this.onCanvasTouch(e));
    
    // Change cursor on hover
    this.renderer.domElement.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e));
    
    // Close expanded view
    this.expandedView.addEventListener('click', (e) => {
      if (e.target === this.expandedView || e.target.closest('[data-corridor-expanded-close]')) {
        this.closeExpandedView();
      }
    });
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isExpanded) {
        this.closeExpandedView();
      }
    });
  }

  onCanvasClick(e) {
    if (this.isExpanded) return;
    
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.checkIntersection();
  }

  onCanvasTouch(e) {
    if (this.isExpanded) return;
    if (e.changedTouches.length === 0) return;
    
    const touch = e.changedTouches[0];
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.checkIntersection();
  }

  onCanvasMouseMove(e) {
    if (this.isExpanded) return;
    
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.clickableImages);
    
    if (intersects.length > 0 && intersects[0].object.userData.isClickable) {
      this.renderer.domElement.style.cursor = 'pointer';
    } else {
      this.renderer.domElement.style.cursor = 'default';
    }
  }

  checkIntersection() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.clickableImages);
    
    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      
      if (clickedMesh.userData.isClickable) {
        this.openExpandedView(clickedMesh.userData);
      }
    }
  }

  openExpandedView(imageData) {
    this.isExpanded = true;
    
    // Set image source
    this.expandedImage.src = imageData.imageSrc;
    this.expandedImage.alt = imageData.title;
    
    // Set caption
    if (this.expandedTitle) {
      this.expandedTitle.textContent = imageData.title;
    }
    if (this.expandedCategory) {
      this.expandedCategory.textContent = imageData.category;
    }
    
    // Show overlay
    this.expandedView.classList.add('is-open');
    
    // Pause scroll
    if (this.scrollTrigger) {
      this.scrollTrigger.disable();
    }
    
    // Animate in
    gsap.fromTo(this.expandedImage, 
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
  }

  closeExpandedView() {
    // Animate out
    gsap.to(this.expandedImage, {
      scale: 0.9,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        this.isExpanded = false;
        this.expandedView.classList.remove('is-open');
        
        // Resume scroll
        if (this.scrollTrigger) {
          this.scrollTrigger.enable();
        }
      }
    });
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