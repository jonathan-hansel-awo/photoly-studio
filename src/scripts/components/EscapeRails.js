/**
 * Escape Rails - Photoly Studio
 * Touch zones on screen edges for mobile users to skip sections
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default class EscapeRails {
  constructor() {
    this.isActive = false;
    this.isMobile = this.checkMobile();
    this.currentSection = null;
    this.sections = [];
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.railWidth = 50; // Width of touch zone in pixels
    this.swipeThreshold = 80; // Minimum swipe distance to trigger
    
    if (this.isMobile) {
      this.init();
    }
    
    // Re-check on resize
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = this.checkMobile();
      
      if (this.isMobile && !wasMobile) {
        this.init();
      } else if (!this.isMobile && wasMobile) {
        this.destroy();
      }
    });
  }

  checkMobile() {
    return window.innerWidth <= 1024 || 'ontouchstart' in window;
  }

  init() {
    if (this.isActive) return;
    this.isActive = true;
    
    this.createRailElements();
    this.collectSections();
    this.bindEvents();
    this.setupScrollTracking();
    
    console.log('Escape Rails initialized');
  }

  createRailElements() {
    // Left rail
    this.leftRail = document.createElement('div');
    this.leftRail.className = 'escape-rail escape-rail--left';
    this.leftRail.innerHTML = `
      <div class="escape-rail__indicator">
        <div class="escape-rail__arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </div>
        <span class="escape-rail__text">Skip</span>
      </div>
    `;
    document.body.appendChild(this.leftRail);
    
    // Right rail
    this.rightRail = document.createElement('div');
    this.rightRail.className = 'escape-rail escape-rail--right';
    this.rightRail.innerHTML = `
      <div class="escape-rail__indicator">
        <div class="escape-rail__arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <span class="escape-rail__text">Skip</span>
      </div>
    `;
    document.body.appendChild(this.rightRail);
  }

  collectSections() {
    // Get all main sections
    this.sections = Array.from(document.querySelectorAll('.section[data-section]'));
  }

  setupScrollTracking() {
    // Track which section we're in
    this.sections.forEach((section, index) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => this.setCurrentSection(index),
        onEnterBack: () => this.setCurrentSection(index)
      });
    });
  }

  setCurrentSection(index) {
    this.currentSectionIndex = index;
    this.currentSection = this.sections[index];
    
    // Update rail indicators
    this.updateRailIndicators();
  }

  updateRailIndicators() {
    const hasPrevious = this.currentSectionIndex > 0;
    const hasNext = this.currentSectionIndex < this.sections.length - 1;
    
    // Left rail shows "previous" (swipe up indicator)
    if (hasPrevious) {
      this.leftRail.classList.add('has-target');
      this.leftRail.querySelector('.escape-rail__arrow').style.transform = 'rotate(0deg)';
    } else {
      this.leftRail.classList.remove('has-target');
    }
    
    // Right rail shows "next" (swipe down indicator)
    if (hasNext) {
      this.rightRail.classList.add('has-target');
      this.rightRail.querySelector('.escape-rail__arrow').style.transform = 'rotate(0deg)';
    } else {
      this.rightRail.classList.remove('has-target');
    }
  }

  bindEvents() {
    // Touch events for left rail
    this.leftRail.addEventListener('touchstart', (e) => this.onRailTouchStart(e, 'left'), { passive: true });
    this.leftRail.addEventListener('touchmove', (e) => this.onRailTouchMove(e, 'left'), { passive: false });
    this.leftRail.addEventListener('touchend', (e) => this.onRailTouchEnd(e, 'left'), { passive: true });
    
    // Touch events for right rail
    this.rightRail.addEventListener('touchstart', (e) => this.onRailTouchStart(e, 'right'), { passive: true });
    this.rightRail.addEventListener('touchmove', (e) => this.onRailTouchMove(e, 'right'), { passive: false });
    this.rightRail.addEventListener('touchend', (e) => this.onRailTouchEnd(e, 'right'), { passive: true });
    
    // Also detect touches starting anywhere near the edges
    document.addEventListener('touchstart', (e) => this.onDocumentTouchStart(e), { passive: true });
    document.addEventListener('touchmove', (e) => this.onDocumentTouchMove(e), { passive: false });
    document.addEventListener('touchend', (e) => this.onDocumentTouchEnd(e), { passive: true });
  }

  onDocumentTouchStart(e) {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const screenWidth = window.innerWidth;
    
    // Check if touch started near left or right edge
    if (touch.clientX < this.railWidth) {
      this.activeRail = 'left';
      this.showRail(this.leftRail);
    } else if (touch.clientX > screenWidth - this.railWidth) {
      this.activeRail = 'right';
      this.showRail(this.rightRail);
    } else {
      this.activeRail = null;
      return;
    }
    
    this.touchStartY = touch.clientY;
    this.touchStartX = touch.clientX;
  }

  onDocumentTouchMove(e) {
    if (!this.activeRail || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const deltaY = this.touchStartY - touch.clientY;
    const deltaX = Math.abs(touch.clientX - this.touchStartX);
    
    // If horizontal movement is too large, cancel
    if (deltaX > 50) {
      this.activeRail = null;
      this.hideRails();
      return;
    }
    
    // Show swipe progress on the rail
    const rail = this.activeRail === 'left' ? this.leftRail : this.rightRail;
    const progress = Math.min(Math.abs(deltaY) / this.swipeThreshold, 1);
    
    rail.style.setProperty('--swipe-progress', progress);
    
    if (progress > 0.3) {
      rail.classList.add('is-swiping');
    }
    
    // Prevent scrolling while swiping on rail
    if (Math.abs(deltaY) > 10) {
      e.preventDefault();
    }
  }

  onDocumentTouchEnd(e) {
    if (!this.activeRail) return;
    
    const touch = e.changedTouches[0];
    const deltaY = this.touchStartY - touch.clientY;
    
    const rail = this.activeRail === 'left' ? this.leftRail : this.rightRail;
    
    // Check if swipe was long enough
    if (Math.abs(deltaY) >= this.swipeThreshold) {
      if (deltaY > 0) {
        // Swiped up - go to next section
        this.goToNextSection();
      } else {
        // Swiped down - go to previous section
        this.goToPreviousSection();
      }
      
      // Success feedback
      rail.classList.add('is-triggered');
      setTimeout(() => rail.classList.remove('is-triggered'), 300);
    }
    
    // Reset
    this.activeRail = null;
    rail.classList.remove('is-swiping');
    rail.style.setProperty('--swipe-progress', 0);
    
    setTimeout(() => this.hideRails(), 200);
  }

  onRailTouchStart(e, side) {
    this.activeRail = side;
    this.touchStartY = e.touches[0].clientY;
    this.touchStartX = e.touches[0].clientX;
    
    const rail = side === 'left' ? this.leftRail : this.rightRail;
    this.showRail(rail);
  }

  onRailTouchMove(e, side) {
    // Handled by document touch move
  }

  onRailTouchEnd(e, side) {
    // Handled by document touch end
  }

  showRail(rail) {
    rail.classList.add('is-visible');
  }

  hideRails() {
    this.leftRail.classList.remove('is-visible');
    this.rightRail.classList.remove('is-visible');
  }

  goToNextSection() {
    if (this.currentSectionIndex >= this.sections.length - 1) return;
    
    const nextSection = this.sections[this.currentSectionIndex + 1];
    if (nextSection) {
      this.scrollToSection(nextSection);
    }
  }

  goToPreviousSection() {
    if (this.currentSectionIndex <= 0) return;
    
    const prevSection = this.sections[this.currentSectionIndex - 1];
    if (prevSection) {
      this.scrollToSection(prevSection);
    }
  }

  scrollToSection(section) {
    // Use GSAP for smooth scrolling
    gsap.to(window, {
      duration: 1,
      scrollTo: {
        y: section,
        autoKill: false
      },
      ease: 'power3.inOut'
    });
    
    // Fallback if ScrollTo plugin not available
    if (!gsap.plugins.scrollTo) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  destroy() {
    if (!this.isActive) return;
    this.isActive = false;
    
    if (this.leftRail) {
      this.leftRail.remove();
    }
    if (this.rightRail) {
      this.rightRail.remove();
    }
    
    // Kill ScrollTriggers
    ScrollTrigger.getAll().forEach(trigger => {
      if (this.sections.includes(trigger.trigger)) {
        // Don't kill - might be used by sections
      }
    });
  }
}