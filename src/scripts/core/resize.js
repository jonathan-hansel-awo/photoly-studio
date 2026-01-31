/**
 * Resize Manager - Photoly Studio
 * Handles window resize events with debouncing
 */

import { debounce } from '../utils/debounce.js';

const BREAKPOINTS = {
  mobileS: 320,
  mobileM: 375,
  mobileL: 425,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
  large: 1920
};

let currentBreakpoint = null;
let listeners = [];

export function initResize() {
  // Set initial breakpoint
  updateBreakpoint();

  // Listen for resize
  window.addEventListener('resize', debounce(handleResize, 150));

  // Set CSS custom property for viewport height (mobile fix)
  setViewportHeight();
  window.addEventListener('resize', debounce(setViewportHeight, 100));

  console.log('Resize manager initialized');
}

function handleResize() {
  const previousBreakpoint = currentBreakpoint;
  updateBreakpoint();

  // Notify listeners
  listeners.forEach(callback => {
    callback({
      width: window.innerWidth,
      height: window.innerHeight,
      breakpoint: currentBreakpoint,
      breakpointChanged: previousBreakpoint !== currentBreakpoint
    });
  });
}

function updateBreakpoint() {
  const width = window.innerWidth;

  if (width < BREAKPOINTS.mobileM) {
    currentBreakpoint = 'mobileS';
  } else if (width < BREAKPOINTS.mobileL) {
    currentBreakpoint = 'mobileM';
  } else if (width < BREAKPOINTS.tablet) {
    currentBreakpoint = 'mobileL';
  } else if (width < BREAKPOINTS.laptop) {
    currentBreakpoint = 'tablet';
  } else if (width < BREAKPOINTS.desktop) {
    currentBreakpoint = 'laptop';
  } else if (width < BREAKPOINTS.large) {
    currentBreakpoint = 'desktop';
  } else {
    currentBreakpoint = 'large';
  }

  document.documentElement.setAttribute('data-breakpoint', currentBreakpoint);
}

function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

export function onResize(callback) {
  listeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    listeners = listeners.filter(cb => cb !== callback);
  };
}

export function getBreakpoint() {
  return currentBreakpoint;
}

export function isMobile() {
  return ['mobileS', 'mobileM', 'mobileL'].includes(currentBreakpoint);
}

export function isTablet() {
  return currentBreakpoint === 'tablet';
}

export function isDesktop() {
  return ['laptop', 'desktop', 'large'].includes(currentBreakpoint);
}

export { BREAKPOINTS };