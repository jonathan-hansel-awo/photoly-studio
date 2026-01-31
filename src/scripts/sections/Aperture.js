/**
 * Aperture Overlay - Photoly Studio
 * Fixed overlay with circular reveal that shows hero beneath
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
    this.maskHole = null;
    
    this.init();
  }

  init() {
    this.createApertureSVG();
    this.setupScrollTrigger();
    
    console.log('Aperture initialized');
  }

  createApertureSVG() {
    const svgNS = 'http://www.w3.org/2000/svg';
    
    // Create main SVG that covers entire viewport
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
    
    // Create defs for mask
    const defs = document.createElementNS(svgNS, 'defs');
    
    // Create mask
    // In SVG masks: white = visible, black = hidden
    // We want the OPPOSITE: show a hole, hide the rest
    // So we use a white rect (show noir) with a black circle (hide = create hole)
    const mask = document.createElementNS(svgNS, 'mask');
    mask.setAttribute('id', 'aperture-hole-mask');
    
    // White background = noir overlay will be visible here
    const maskRect = document.createElementNS(svgNS, 'rect');
    maskRect.setAttribute('x', '0');
    maskRect.setAttribute('y', '0');
    maskRect.setAttribute('width', '100');
    maskRect.setAttribute('height', '100');
    maskRect.setAttribute('fill', 'white');
    
    // Black circle = noir overlay will be HIDDEN here (creating the hole)
    this.maskHole = document.createElementNS(svgNS, 'circle');
    this.maskHole.setAttribute('cx', '50');
    this.maskHole.setAttribute('cy', '50');
    this.maskHole.setAttribute('r', '0'); // Start with no hole
    this.maskHole.setAttribute('fill', 'black');
    
    mask.appendChild(maskRect);
    mask.appendChild(this.maskHole);
    defs.appendChild(mask);
    svg.appendChild(defs);
    
    // The noir (black) overlay - masked to create hole
    const noirOverlay = document.createElementNS(svgNS, 'rect');
    noirOverlay.setAttribute('x', '0');
    noirOverlay.setAttribute('y', '0');
    noirOverlay.setAttribute('width', '100');
    noirOverlay.setAttribute('height', '100');
    noirOverlay.setAttribute('fill', '#0A0A0A');
    noirOverlay.setAttribute('mask', 'url(#aperture-hole-mask)');
    svg.appendChild(noirOverlay);
    
    this.irisContainer.appendChild(svg);
    this.svg = svg;
  }

setupScrollTrigger() {
  // Use the hero section as the trigger since aperture is fixed
  const heroSection = document.querySelector('[data-section="hero"]');
  
  if (!heroSection) {
    console.warn('No hero section found for aperture trigger');
    this.onComplete();
    return;
  }

  this.scrollTrigger = ScrollTrigger.create({
    trigger: heroSection,
    start: 'top top',
    end: '+=200', // 300px of scrolling to fully open (not tied to hero height)
    scrub: 0.3,
    onUpdate: (self) => this.updateAperture(self.progress),
    onLeave: () => this.onComplete(),
    onEnterBack: () => this.onReset()
  });
}

  updateAperture(progress) {
    this.progress = progress;
    
    // Expand the hole radius from 0 to 80 (covers full viewport)
    const radius = progress * 80;
    this.maskHole.setAttribute('r', radius);
    
    // Fade out hint
    if (this.hint) {
      const hintOpacity = Math.max(0, 1 - (progress * 4));
      this.hint.style.opacity = hintOpacity;
    }
    
    // Mark as opening
    if (progress > 0.01) {
      this.container.classList.add('is-opening');
    }
    
    // Complete when hole is big enough
    if (progress >= 0.95 && !this.isComplete) {
      this.onComplete();
    }
  }

  onComplete() {
    if (this.isComplete) return;
    this.isComplete = true;
    
    console.log('Aperture complete');
    
    this.container.classList.add('is-complete');
    
    // After fade transition, hide completely
    setTimeout(() => {
      this.container.classList.add('is-hidden');
    }, 600);
    
    // Dispatch event for hero
    document.dispatchEvent(new CustomEvent('aperture:complete'));
  }

  onReset() {
    if (!this.isComplete) return;
    
    this.isComplete = false;
    this.container.classList.remove('is-complete');
    this.container.classList.remove('is-hidden');
    this.container.classList.remove('is-opening');
  }

  destroy() {
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }
  }
}