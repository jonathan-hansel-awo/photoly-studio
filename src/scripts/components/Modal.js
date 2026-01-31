/**
 * Modal Component - Photoly Studio
 */

import { stopScroll, startScroll } from '../core/scroll.js';

export default class Modal {
  constructor(element) {
    this.element = element;
    this.isOpen = false;
    
    this.backdrop = element.querySelector('[data-modal-close]');
    this.closeButtons = element.querySelectorAll('[data-modal-close]');
    
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Close buttons
    this.closeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target === this.backdrop || e.target.hasAttribute('data-modal-close')) {
          this.close();
        }
      });
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    
    this.element.classList.add('is-open');
    this.element.setAttribute('aria-hidden', 'false');
    
    stopScroll();
    
    // Focus first focusable element
    const focusable = this.element.querySelector('button, [href], input, select, textarea');
    if (focusable) focusable.focus();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    
    this.element.classList.remove('is-open');
    this.element.setAttribute('aria-hidden', 'true');
    
    startScroll();
  }

  destroy() {
    this.close();
  }
}