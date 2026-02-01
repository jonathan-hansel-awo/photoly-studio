/**
 * Scroll Manager - Photoly Studio
 * Lenis smooth scroll with GSAP integration
 */

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

let lenis = null;

export function initSmoothScroll() {
  // Initialize Lenis
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false
  });

  // Connect Lenis to GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  // Add Lenis to GSAP ticker
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  // Disable GSAP's lag smoothing for better sync
  gsap.ticker.lagSmoothing(0);

  // Add class to HTML for CSS hooks
  document.documentElement.classList.add('lenis');

  console.log('Smooth scroll initialized');

  return lenis;
}

export function getScrollManager() {
  return lenis;
}

export function scrollTo(target, options = {}) {
  if (!lenis) return;
  
  lenis.scrollTo(target, {
    offset: 0,
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    ...options
  });
}

export function stopScroll() {
  if (lenis) lenis.stop();
}

export function startScroll() {
  if (lenis) lenis.start();
}

export function destroyScroll() {
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
}