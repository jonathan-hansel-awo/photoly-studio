/**
 * Math Utilities - Photoly Studio
 */

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

export function map(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

export function radToDeg(radians) {
  return radians * (180 / Math.PI);
}