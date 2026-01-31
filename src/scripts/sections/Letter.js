/**
 * Letter to Light Section - Photoly Studio
 * Scroll-driven text reveal
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default class Letter {
  constructor(container) {
    this.container = container;
    this.heading = container.querySelector('.letter__heading');
    this.paragraphs = container.querySelectorAll('.letter__text p');
    this.signature = container.querySelector('.letter__signature');
    
    this.init();
  }

  init() {
    this.setupScrollAnimations();
  }

  setupScrollAnimations() {
    // Heading animation
    ScrollTrigger.create({
      trigger: this.heading,
      start: 'top 80%',
      onEnter: () => this.animateElement(this.heading)
    });
    
    // Paragraph animations with stagger
    this.paragraphs.forEach((p, index) => {
      ScrollTrigger.create({
        trigger: p,
        start: 'top 85%',
        onEnter: () => this.animateElement(p, index * 0.1)
      });
    });
    
    // Signature animation
    ScrollTrigger.create({
      trigger: this.signature,
      start: 'top 85%',
      onEnter: () => this.animateElement(this.signature)
    });
  }

  animateElement(element, delay = 0) {
    if (element.classList.contains('is-visible')) return;
    
    element.classList.add('is-visible');
    
    gsap.to(element, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: delay,
      ease: 'expo.out'
    });
  }

  destroy() {
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.trigger === this.heading || 
          trigger.trigger === this.signature ||
          [...this.paragraphs].includes(trigger.trigger)) {
        trigger.kill();
      }
    });
  }
}