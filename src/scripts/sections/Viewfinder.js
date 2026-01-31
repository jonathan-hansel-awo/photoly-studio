/**
 * Viewfinder Section - Photoly Studio
 * Booking form with camera viewfinder styling
 */

import { gsap } from 'gsap';

export default class Viewfinder {
  constructor(container) {
    this.container = container;
    this.form = container.querySelector('[data-booking-form]');
    this.submitBtn = container.querySelector('.viewfinder__shutter');
    this.successEl = container.querySelector('[data-success]');
    
    this.isSubmitting = false;
    
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    // Add focus effects to inputs
    const inputs = this.container.querySelectorAll('.form-input, .form-select, .form-textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => this.onInputFocus(input));
      input.addEventListener('blur', () => this.onInputBlur(input));
    });
  }

  onInputFocus(input) {
    const group = input.closest('.form-group');
    if (group) {
      group.classList.add('is-focused');
    }
  }

  onInputBlur(input) {
    const group = input.closest('.form-group');
    if (group) {
      group.classList.remove('is-focused');
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    if (this.isSubmitting) return;
    
    // Validate
    if (!this.validateForm()) return;
    
    this.isSubmitting = true;
    
    // Animate shutter press
    await this.animateShutter();
    
    // Simulate form submission
    await this.submitForm();
    
    // Show success
    this.showSuccess();
    
    this.isSubmitting = false;
  }

  validateForm() {
    const name = this.form.querySelector('#name');
    const email = this.form.querySelector('#email');
    const session = this.form.querySelector('#session');
    
    let isValid = true;
    
    // Clear previous errors
    this.container.querySelectorAll('.form-error').forEach(el => {
      el.textContent = '';
    });
    
    if (!name.value.trim()) {
      this.showError('name', 'Please enter your name');
      isValid = false;
    }
    
    if (!email.value.trim()) {
      this.showError('email', 'Please enter your email');
      isValid = false;
    } else if (!this.isValidEmail(email.value)) {
      this.showError('email', 'Please enter a valid email');
      isValid = false;
    }
    
    if (!session.value) {
      this.showError('session', 'Please select a session type');
      isValid = false;
    }
    
    return isValid;
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  showError(field, message) {
    const errorEl = this.container.querySelector(`[data-error="${field}"]`);
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  animateShutter() {
    return new Promise(resolve => {
      const ring = this.submitBtn.querySelector('.viewfinder__shutter-ring');
      const button = this.submitBtn.querySelector('.viewfinder__shutter-button');
      
      gsap.timeline()
        .to(button, {
          scale: 0.85,
          duration: 0.1,
          ease: 'power2.in'
        })
        .to(button, {
          scale: 1,
          duration: 0.2,
          ease: 'back.out(2)'
        })
        .call(resolve);
    });
  }

  async submitForm() {
    // Simulate API call
    return new Promise(resolve => {
      setTimeout(resolve, 500);
    });
    
    // In production, you would do:
    // const formData = new FormData(this.form);
    // await fetch('/api/booking', { method: 'POST', body: formData });
  }

  showSuccess() {
    // Flash effect
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: absolute;
      inset: 0;
      background: white;
      opacity: 0;
      pointer-events: none;
      z-index: 100;
    `;
    this.container.querySelector('.viewfinder__frame').appendChild(flash);
    
    gsap.timeline()
      .to(flash, {
        opacity: 1,
        duration: 0.1
      })
      .to(flash, {
        opacity: 0,
        duration: 0.4,
        onComplete: () => flash.remove()
      });
    
    // Show success message
    this.successEl.classList.add('is-visible');
    this.successEl.setAttribute('aria-hidden', 'false');
    
    // Reset form
    this.form.reset();
  }

  destroy() {
    // Clean up
  }
}