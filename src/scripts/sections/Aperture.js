/**
 * Rotating Octagon Aperture - Photoly Studio
 * 8-sided octagon hole that rotates faster as it opens
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default class Aperture {
  constructor(container) {
    this.container = container;
    this.irisContainer = container.querySelector('[data-aperture-iris]');
    this.hint = container.querySelector('[data-aperture-hint]');
    
    this.progress = 0;
    this.isComplete = false;
    this.octagonElement = null;
    this.rotationGroup = null;
    
    this.init();
  }

  init() {
    this.createRotatingOctagon();
    this.setupScrollTrigger();
  }

  createRotatingOctagon() {
    const svgNS = 'http://www.w3.org/2000/svg';
    
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;
    
    // Create defs for mask
    const defs = document.createElementNS(svgNS, 'defs');
    
    // Create mask (white shows, black hides)
    const mask = document.createElementNS(svgNS, 'mask');
    mask.setAttribute('id', 'octagon-mask');
    
    // White background = overlay will be visible
    const maskBg = document.createElementNS(svgNS, 'rect');
    maskBg.setAttribute('x', '0');
    maskBg.setAttribute('y', '0');
    maskBg.setAttribute('width', '100');
    maskBg.setAttribute('height', '100');
    maskBg.setAttribute('fill', 'white');
    
    // Group for rotating octagon - starting with slight rotation for visual interest
    this.rotationGroup = document.createElementNS(svgNS, 'g');
    this.rotationGroup.setAttribute('transform', 'rotate(0 50 50)');
    
    // Create octagon (black = creates hole in mask)
    this.octagonElement = document.createElementNS(svgNS, 'polygon');
    this.octagonElement.setAttribute('id', 'octagon-hole');
    this.octagonElement.setAttribute('fill', 'black');
    this.octagonElement.setAttribute('stroke', 'none');
    
    this.rotationGroup.appendChild(this.octagonElement);
    
    mask.appendChild(maskBg);
    mask.appendChild(this.rotationGroup);
    defs.appendChild(mask);
    svg.appendChild(defs);
    
    // Black overlay (masked by octagon)
    const overlay = document.createElementNS(svgNS, 'rect');
    overlay.setAttribute('x', '0');
    overlay.setAttribute('y', '0');
    overlay.setAttribute('width', '100');
    overlay.setAttribute('height', '100');
    overlay.setAttribute('fill', '#0A0A0A');
    overlay.setAttribute('mask', 'url(#octagon-mask)');
    svg.appendChild(overlay);
    
    this.irisContainer.appendChild(svg);
    
    // Initial state (closed)
    this.updateOctagon(0);
  }

  /**
   * Calculate octagon points
   * @param {number} size - 0 to 50 (radius from center)
   * @returns {string} SVG points string
   */
  calculateOctagonPoints(size) {
    const centerX = 50;
    const centerY = 50;
    const points = [];
    
    if (size <= 0) {
      // When closed, return a point at the center
      return `${centerX},${centerY}`;
    }
    
    // Create octagon points (8 sides)
    // For octagon, offset by 22.5° to have flat top
    const sides = 8;
    const offsetAngle = -Math.PI / 8; // -22.5° for flat top
    
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI / sides) + offsetAngle;
      const x = centerX + size * Math.cos(angle);
      const y = centerY + size * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    
    return points.join(' ');
  }

  updateOctagon(progress) {
    // Size grows from 0 to 55 based on progress (slightly larger for full coverage)
    const size = progress * 55;
    
    // Update octagon points
    const points = this.calculateOctagonPoints(size);
    this.octagonElement.setAttribute('points', points);
    
    // Apply FASTER rotation based on progress
    // Increased from 60° to 240° total rotation for faster spin
    const rotation = progress * 240;
    this.rotationGroup.setAttribute('transform', `rotate(${rotation} 50 50)`);
  }

  setupScrollTrigger() {
    const heroSection = document.querySelector('[data-section="hero"]');
    const triggerElement = heroSection || this.container;
    
    this.scrollTrigger = ScrollTrigger.create({
      trigger: triggerElement,
      start: 'top top',
      end: '+=50',
      scrub: 0.5,
      onUpdate: (self) => {
        this.updateAperture(self.progress);
      },
      onLeave: () => this.onComplete(),
      onEnterBack: () => this.onReset()
    });
  }

  updateAperture(progress) {
    this.progress = progress;
    
    // Update octagon size and rotation
    this.updateOctagon(progress);
    
    // Fade out hint
    if (this.hint) {
      this.hint.style.opacity = Math.max(0, 1 - (progress * 4));
    }
    
    // Mark as opening
    if (progress > 0.01) {
      this.container.classList.add('is-opening');
    } else {
      this.container.classList.remove('is-opening');
    }
    
    // Complete when fully open
    if (progress >= 0.95 && !this.isComplete) {
      this.onComplete();
    }
  }

  onComplete() {
    if (this.isComplete) return;
    this.isComplete = true;
    
    this.container.classList.add('is-complete');
    
    setTimeout(() => {
      this.container.classList.add('is-hidden');
    }, 600);
    
    document.dispatchEvent(new CustomEvent('aperture:complete'));
  }

  onReset() {
    if (!this.isComplete) return;
    this.isComplete = false;
    this.container.classList.remove('is-complete', 'is-hidden', 'is-opening');
  }

  destroy() {
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }
  }
}