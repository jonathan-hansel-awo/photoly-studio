/**
 * Book Button Component - Photoly Studio
 * Fixed CTA that appears after hero section
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default class BookButton {
  constructor(element) {
    this.element = element;
    this.isVisible = false;
    
    this.init();
  }

  init() {
    this.setupScrollTrigger();
    this.bindEvents();
  }

  setupScrollTrigger() {
    const heroSection = document.querySelector('[data-section="hero"]');
    if (!heroSection) {
      // No hero, show button immediately
      this.show();
      return;
    }

    ScrollTrigger.create({
      trigger: heroSection,
      start: 'bottom 80%',
      onEnter: () => this.show(),
      onLeaveBack: () => this.hide()
    });
  }

  bindEvents() {
    this.element.addEventListener('click', () => this.handleClick());
  }

  handleClick() {
    // Scroll to viewfinder section
    const viewfinder = document.querySelector('#viewfinder');
    if (viewfinder) {
      viewfinder.scrollIntoView({ behavior: 'smooth' });
    }
  }

  show() {
    if (this.isVisible) return;
    this.isVisible = true;
    
    this.element.setAttribute('aria-hidden', 'false');
    this.element.classList.add('is-visible');
    
    gsap.fromTo(this.element, 
      { scale: 0.8, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }
    );
  }

  hide() {
    if (!this.isVisible) return;
    this.isVisible = false;
    
    gsap.to(this.element, {
      scale: 0.8,
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        this.element.setAttribute('aria-hidden', 'true');
        this.element.classList.remove('is-visible');
      }
    });
  }

  destroy() {
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.trigger === this.element) {
        trigger.kill();
      }
    });
  }
}