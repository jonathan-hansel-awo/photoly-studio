/**
 * Hero Section - Photoly Studio
 * Main introduction with animations
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default class Hero {
  constructor(container) {
    this.container = container;
    this.title = container.querySelector('[data-hero-title]');
    this.subtitle = container.querySelector('[data-hero-subtitle]');
    this.tagline = container.querySelector('[data-hero-tagline]');
    this.categories = container.querySelector('[data-hero-categories]');
    this.scrollIndicator = container.querySelector('.hero__scroll-indicator');
    this.image = container.querySelector('.hero__image');
    
    this.hasAnimated = false;
    
    this.init();
  }

  init() {
    this.setupAnimations();
    this.setupParallax();
    
    console.log('Hero initialized');
  }

  setupAnimations() {
    // Listen for aperture completion
    document.addEventListener('aperture:complete', () => {
      console.log('Hero received aperture:complete event');
      this.animateIn();
    });
    
    // Fallback: Check if aperture section exists
    const aperture = document.querySelector('[data-section="aperture"]');
    
    if (!aperture) {
      // No aperture, animate immediately after short delay
      setTimeout(() => this.animateIn(), 500);
    }
  }

  animateIn() {
    if (this.hasAnimated) return;
    this.hasAnimated = true;
    
    console.log('Hero animating in');
    
    this.container.classList.add('is-visible');
    
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    
    if (this.title) {
      tl.to(this.title, { opacity: 1, y: 0, duration: 1 });
    }
    
    if (this.subtitle) {
      tl.to(this.subtitle, { opacity: 1, y: 0, duration: 1 }, '-=0.7');
    }
    
    if (this.tagline) {
      tl.to(this.tagline, { opacity: 1, y: 0, duration: 1 }, '-=0.7');
    }
    
    if (this.categories) {
      tl.to(this.categories, { opacity: 1, duration: 0.8 }, '-=0.5');
    }
    
    if (this.scrollIndicator) {
      tl.to(this.scrollIndicator, { opacity: 1, duration: 0.8 }, '-=0.3');
    }
  }

  setupParallax() {
    if (!this.image) return;
    
    gsap.to(this.image, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: this.container,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  destroy() {
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.trigger === this.container) {
        trigger.kill();
      }
    });
  }
}