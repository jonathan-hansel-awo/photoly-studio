/**
 * Main Entry Point - Photoly Studio
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { initSmoothScroll } from './core/scroll.js';
import { initResize } from './core/resize.js';
import Aperture from './sections/Aperture.js';
import Hero from './sections/Hero.js';
import Cube from './sections/Cube.js';
import Corridor from './sections/Corridor.js';
import Reels from './sections/Reels.js';
import Letter from './sections/Letter.js';
import Viewfinder from './sections/Viewfinder.js';
import Puzzle from './sections/Puzzle.js';
import BookButton from './components/BookButton.js';
import Modal from './components/Modal.js';
import EscapeRails from './components/EscapeRails.js';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

class App {
  constructor() {
    this.sections = {};
    this.components = {};
  }

  async init() {
    console.log('Photoly Studio initializing...');

    if (document.readyState === 'loading') {
      await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }

    // Initialize core systems
    initSmoothScroll();
    initResize();

    // Initialize aperture overlay
    const apertureOverlay = document.querySelector('[data-aperture-overlay]');
    if (apertureOverlay) {
      this.aperture = new Aperture(apertureOverlay);
    }

    // Initialize components
    this.initComponents();

    // Initialize sections
    this.initSections();

    document.body.classList.add('is-loaded');
    console.log('Photoly Studio ready!');
  }

  initComponents() {
    // Book button
    const bookButtonEl = document.querySelector('[data-book-button]');
    if (bookButtonEl) {
      this.components.bookButton = new BookButton(bookButtonEl);
    }

    // Modal
    const modalEl = document.querySelector('[data-modal="booking"]');
    if (modalEl) {
      this.components.modal = new Modal(modalEl);
    }

    // Escape Rails (mobile section skipping)
    this.components.escapeRails = new EscapeRails();

    // Progress indicator
    this.initProgressIndicator();
  }

  initSections() {
    // Hero
    const heroEl = document.querySelector('[data-section="hero"]');
    if (heroEl) {
      this.sections.hero = new Hero(heroEl);
    }

    // Cube
    const cubeEl = document.querySelector('[data-section="cube"]');
    if (cubeEl) {
      this.sections.cube = new Cube(cubeEl);
    }

    // Corridor
    const corridorEl = document.querySelector('[data-section="corridor"]');
    if (corridorEl) {
      this.sections.corridor = new Corridor(corridorEl);
    }

    // Reels
    const reelsEl = document.querySelector('[data-section="reels"]');
    if (reelsEl) {
      this.sections.reels = new Reels(reelsEl);
    }

    // Letter
    const letterEl = document.querySelector('[data-section="letter"]');
    if (letterEl) {
      this.sections.letter = new Letter(letterEl);
    }

    // Viewfinder
    const viewfinderEl = document.querySelector('[data-section="viewfinder"]');
    if (viewfinderEl) {
      this.sections.viewfinder = new Viewfinder(viewfinderEl);
    }

    // Puzzle
    const puzzleEl = document.querySelector('[data-section="puzzle"]');
    if (puzzleEl) {
      this.sections.puzzle = new Puzzle(puzzleEl);
    }
  }

  initProgressIndicator() {
    const progressEl = document.querySelector('[data-progress]');
    if (!progressEl) return;

    const bar = progressEl.querySelector('.progress-indicator__bar');
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      
      bar.style.width = `${progress}%`;
      
      if (scrollTop > 100) {
        progressEl.classList.add('is-visible');
      } else {
        progressEl.classList.remove('is-visible');
      }
    });
  }

  destroy() {
    if (this.aperture) this.aperture.destroy();
    
    Object.values(this.sections).forEach(section => {
      if (section.destroy) section.destroy();
    });

    Object.values(this.components).forEach(component => {
      if (component.destroy) component.destroy();
    });
  }
}

const app = new App();
app.init();

window.photolyApp = app;