/**
 * Photo Cube Section - Photoly Studio
 * Interactive 3D cube that expands images when face is front-facing
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
    this.hasInteracted = false;
    this.isExpanded = false;
    this.isSnapping = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.lastInteractionTime = 0;
    this.snapThreshold = 0.85; // How aligned the face needs to be (0-1, higher = more precise)
    this.currentFrontFace = -1;
    
    // Image paths and metadata for cube faces
    this.faceData = [
      { src: 'https://picsum.photos/seed/cube1/1024/1024', title: 'Eternal Moments', category: 'Weddings' },
      { src: 'https://picsum.photos/seed/cube2/1024/1024', title: 'Natural Light', category: 'Portraits' },
      { src: 'https://picsum.photos/seed/cube3/1024/1024', title: 'Urban Stories', category: 'Editorial' },
      { src: 'https://picsum.photos/seed/cube4/1024/1024', title: 'Quiet Reflections', category: 'Personal' },
      { src: 'https://picsum.photos/seed/cube5/1024/1024', title: 'Golden Hour', category: 'Landscapes' },
      { src: 'https://picsum.photos/seed/cube6/1024/1024', title: 'Candid Joy', category: 'Lifestyle' }
    ];
    
    // Face normals for detecting front-facing
    this.faceNormals = [
      new THREE.Vector3(1, 0, 0),   // Right face (index 0)
      new THREE.Vector3(-1, 0, 0),  // Left face (index 1)
      new THREE.Vector3(0, 1, 0),   // Top face (index 2)
      new THREE.Vector3(0, -1, 0),  // Bottom face (index 3)
      new THREE.Vector3(0, 0, 1),   // Front face (index 4)
      new THREE.Vector3(0, 0, -1)   // Back face (index 5)
    ];
    
    this.init();
  }

  init() {
    this.createExpandedViewHTML();
    this.createHintHTML();
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupLights();
    this.loadTexturesAndCreateCube();
    this.bindEvents();
    this.start();
  }

  createExpandedViewHTML() {
    // Create expanded view overlay
    const overlay = document.createElement('div');
    overlay.className = 'cube__expanded';
    overlay.setAttribute('data-cube-expanded', '');
    overlay.innerHTML = `
      <div class="cube__expanded-content">
        <img class="cube__expanded-image" data-cube-expanded-image src="" alt="">
        <div class="cube__expanded-caption">
          <h3 class="cube__expanded-title" data-cube-expanded-title></h3>
          <p class="cube__expanded-category" data-cube-expanded-category></p>
        </div>
        <p class="cube__expanded-hint">Tap to close</p>
      </div>
    `;
    this.container.appendChild(overlay);
    
    this.expandedView = overlay;
    this.expandedImage = overlay.querySelector('[data-cube-expanded-image]');
    this.expandedTitle = overlay.querySelector('[data-cube-expanded-title]');
    this.expandedCategory = overlay.querySelector('[data-cube-expanded-category]');
  }

  createHintHTML() {
    // Update or create hint element
    if (!this.hint) {
      const hint = document.createElement('div');
      hint.className = 'cube__hint';
      hint.setAttribute('data-cube-hint', '');
      this.canvasContainer.parentElement.appendChild(hint);
      this.hint = hint;
    }
    
    this.hint.innerHTML = `
      <div class="cube__hint-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M8 12h8M12 8v8"/>
          <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/>
          <path d="M17 12l-2-2m2 2l-2 2"/>
          <path d="M7 12l2-2m-2 2l2 2"/>
        </svg>
      </div>
      <span class="cube__hint-text">Drag to explore</span>
    `;
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
    
    const directional = new THREE.DirectionalLight(0xffffff, 0.6);
    directional.position.set(5, 5, 5);
    this.scene.add(directional);
    
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-5, -5, -5);
    this.scene.add(backLight);
  }

  loadTexturesAndCreateCube() {
    const textureLoader = new THREE.TextureLoader();
    this.materials = [];
    this.textures = [];
    
    let loadedCount = 0;
    const totalTextures = this.faceData.length;
    
    // Material order for BoxGeometry: +X, -X, +Y, -Y, +Z, -Z
    // This matches our faceNormals order
    this.faceData.forEach((face, index) => {
      textureLoader.load(
        face.src,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          this.textures[index] = texture;
          this.materials[index] = new THREE.MeshStandardMaterial({ 
            map: texture,
            roughness: 0.4,
            metalness: 0.1
          });
          
          loadedCount++;
          
          if (loadedCount === totalTextures) {
            this.createCube();
          }
        },
        undefined,
        (error) => {
          console.warn(`Failed to load texture: ${face.src}`);
          const colors = [0xC9A167, 0x1A1614, 0xE8E2D9, 0x2C2622, 0xF5F0E8, 0x6B5D52];
          this.materials[index] = new THREE.MeshStandardMaterial({ 
            color: colors[index],
            roughness: 0.4,
            metalness: 0.1
          });
          this.textures[index] = null;
          
          loadedCount++;
          
          if (loadedCount === totalTextures) {
            this.createCube();
          }
        }
      );
    });
  }

  createCube() {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    
    this.cube = new THREE.Mesh(geometry, this.materials);
    this.scene.add(this.cube);
    
    // Slight initial rotation for visual interest
    this.cube.rotation.x = 0.3;
    this.cube.rotation.y = 0.5;
    
    // Idle rotation speeds
    this.idleRotation = { x: 0.003, y: 0.005 };
    
    console.log('Cube created with textures');
  }

bindEvents() {
  // Mouse events
  this.canvasContainer.addEventListener('mousedown', (e) => this.onPointerDown(e));
  window.addEventListener('mousemove', (e) => this.onPointerMove(e));
  window.addEventListener('mouseup', () => this.onPointerUp());
  
  // Touch events
  this.canvasContainer.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
  window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
  window.addEventListener('touchend', () => this.onPointerUp());
  
  // Resize
  window.addEventListener('resize', () => this.onResize());
  
  // Expanded view close events - FIXED: prevent default and stop propagation
  this.expandedView.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.closeExpandedView();
  });
  
  this.expandedView.addEventListener('touchend', (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.closeExpandedView();
  });
  
  // Prevent clicks on the image/content from closing
  const content = this.expandedView.querySelector('.cube__expanded-content');
  if (content) {
    content.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    content.addEventListener('touchend', (e) => {
      e.stopPropagation();
    });
  }
  
  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && this.isExpanded) {
      this.closeExpandedView();
    }
  });
}

  onPointerDown(e) {
    if (this.isExpanded || this.isSnapping) return;
    
    this.isDragging = true;
    this.hasInteracted = true;
    this.previousMousePosition = { x: e.clientX, y: e.clientY };
    this.velocity = { x: 0, y: 0 };
    this.lastInteractionTime = Date.now();
    
    this.hideHint();
  }

  onTouchStart(e) {
    if (this.isExpanded || this.isSnapping) return;
    if (e.touches.length !== 1) return;
    
    e.preventDefault();
    this.isDragging = true;
    this.hasInteracted = true;
    this.previousMousePosition = { 
      x: e.touches[0].clientX, 
      y: e.touches[0].clientY 
    };
    this.velocity = { x: 0, y: 0 };
    this.lastInteractionTime = Date.now();
    
    this.hideHint();
  }

  onPointerMove(e) {
    if (!this.isDragging || this.isExpanded || this.isSnapping || !this.cube) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - this.previousMousePosition.x;
    const deltaY = clientY - this.previousMousePosition.y;
    
    this.velocity.x = deltaY * 0.008;
    this.velocity.y = deltaX * 0.008;
    
    this.cube.rotation.x += this.velocity.x;
    this.cube.rotation.y += this.velocity.y;
    
    this.previousMousePosition = { x: clientX, y: clientY };
    this.lastInteractionTime = Date.now();
  }

  onTouchMove(e) {
    if (!this.isDragging || this.isExpanded || this.isSnapping) return;
    if (e.touches.length !== 1) return;
    
    e.preventDefault();
    this.onPointerMove(e);
  }

  onPointerUp() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    
    // Check if a face is front-facing after drag ends
    if (!this.isExpanded && !this.isSnapping) {
      setTimeout(() => this.checkForFrontFace(), 100);
    }
  }

  checkForFrontFace() {
    if (!this.cube || this.isDragging || this.isExpanded || this.isSnapping) return;
    
    const cameraDirection = new THREE.Vector3(0, 0, -1); // Camera looks down -Z
    
    let bestFace = -1;
    let bestAlignment = -1;
    
    this.faceNormals.forEach((normal, index) => {
      // Transform the normal by the cube's rotation
      const worldNormal = normal.clone().applyQuaternion(this.cube.quaternion);
      
      // Dot product with camera direction (looking at the cube from +Z)
      // We want faces pointing toward camera (toward +Z)
      const alignment = worldNormal.dot(new THREE.Vector3(0, 0, 1));
      
      if (alignment > bestAlignment) {
        bestAlignment = alignment;
        bestFace = index;
      }
    });
    
    // If alignment is good enough, snap and expand
    if (bestAlignment >= this.snapThreshold && bestFace !== -1) {
      this.snapToFace(bestFace);
    }
  }

  snapToFace(faceIndex) {
    if (this.isSnapping || this.isExpanded || !this.cube) return;
    
    this.isSnapping = true;
    this.currentFrontFace = faceIndex;
    
    // Calculate target rotation to make this face perfectly front-facing
    const targetRotation = this.getTargetRotationForFace(faceIndex);
    
    // Animate cube rotation to snap
    gsap.to(this.cube.rotation, {
      x: targetRotation.x,
      y: targetRotation.y,
      z: targetRotation.z,
      duration: 0.4,
      ease: 'power2.out',
      onComplete: () => {
        this.isSnapping = false;
        // Small delay before expanding
        setTimeout(() => this.expandFace(faceIndex), 200);
      }
    });
  }

  getTargetRotationForFace(faceIndex) {
    // Returns the rotation needed to make a specific face point toward camera (+Z)
    const rotations = [
      { x: 0, y: -Math.PI / 2, z: 0 },  // Right face -> rotate Y -90°
      { x: 0, y: Math.PI / 2, z: 0 },   // Left face -> rotate Y 90°
      { x: Math.PI / 2, y: 0, z: 0 },   // Top face -> rotate X 90°
      { x: -Math.PI / 2, y: 0, z: 0 },  // Bottom face -> rotate X -90°
      { x: 0, y: 0, z: 0 },             // Front face -> no rotation
      { x: 0, y: Math.PI, z: 0 }        // Back face -> rotate Y 180°
    ];
    
    // Get current rotation and find nearest equivalent
    const current = {
      x: this.cube.rotation.x,
      y: this.cube.rotation.y,
      z: this.cube.rotation.z
    };
    
    const target = rotations[faceIndex];
    
    // Normalize to nearest rotation (handle multiple rotations)
    return {
      x: this.nearestAngle(current.x, target.x),
      y: this.nearestAngle(current.y, target.y),
      z: this.nearestAngle(current.z, target.z)
    };
  }

  nearestAngle(current, target) {
    const TWO_PI = Math.PI * 2;
    
    // Normalize current to 0-2π range
    let normalized = ((current % TWO_PI) + TWO_PI) % TWO_PI;
    
    // Find how many full rotations we've done
    const fullRotations = Math.round(current / TWO_PI) * TWO_PI;
    
    // Adjust target to be closest to current
    let adjustedTarget = target + fullRotations;
    
    // Check if going the other way is closer
    if (Math.abs(adjustedTarget + TWO_PI - current) < Math.abs(adjustedTarget - current)) {
      adjustedTarget += TWO_PI;
    } else if (Math.abs(adjustedTarget - TWO_PI - current) < Math.abs(adjustedTarget - current)) {
      adjustedTarget -= TWO_PI;
    }
    
    return adjustedTarget;
  }

  expandFace(faceIndex) {
    if (this.isExpanded) return;
    
    const faceData = this.faceData[faceIndex];
    
    this.isExpanded = true;
    
    // Set image
    this.expandedImage.src = faceData.src;
    this.expandedImage.alt = faceData.title;
    
    // Set caption
    this.expandedTitle.textContent = faceData.title;
    this.expandedCategory.textContent = faceData.category;
    
    // Show overlay with animation
    this.expandedView.classList.add('is-open');
    
    gsap.fromTo(this.expandedImage,
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
    );
    
    gsap.fromTo(this.expandedView.querySelector('.cube__expanded-caption'),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, delay: 0.2, ease: 'power2.out' }
    );
  }

  closeExpandedView() {
    if (!this.isExpanded) return;
    
    gsap.to(this.expandedImage, {
      scale: 0.8,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in'
    });
    
    gsap.to(this.expandedView.querySelector('.cube__expanded-caption'), {
      y: 20,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        this.isExpanded = false;
        this.expandedView.classList.remove('is-open');
        this.currentFrontFace = -1;
      }
    });
  }

  hideHint() {
    if (this.hint && !this.hint.classList.contains('is-hidden')) {
      gsap.to(this.hint, {
        opacity: 0,
        y: 10,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          this.hint.classList.add('is-hidden');
        }
      });
    }
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
    
    if (this.cube && !this.isExpanded && !this.isSnapping) {
      const timeSinceInteraction = Date.now() - this.lastInteractionTime;
      
      if (!this.isDragging) {
        // Apply momentum with decay
        this.velocity.x *= 0.96;
        this.velocity.y *= 0.96;
        
        this.cube.rotation.x += this.velocity.x;
        this.cube.rotation.y += this.velocity.y;
        
        // After momentum settles, check for front face
        if (Math.abs(this.velocity.x) < 0.001 && Math.abs(this.velocity.y) < 0.001) {
          if (this.hasInteracted && timeSinceInteraction > 500 && timeSinceInteraction < 600) {
            this.checkForFrontFace();
          }
        }
        
        // Idle rotation when no recent interaction
        if (!this.hasInteracted || timeSinceInteraction > 3000) {
          this.cube.rotation.x += this.idleRotation.x;
          this.cube.rotation.y += this.idleRotation.y;
        }
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