/**
 * Asset Loader - Photoly Studio
 * Preloads critical assets
 */

export function initLoader() {
  return new Promise((resolve) => {
    const criticalImages = [
      '/assets/images/hero/hero-signature.jpg'
    ];

    let loaded = 0;
    const total = criticalImages.length;

    if (total === 0) {
      resolve();
      return;
    }

    criticalImages.forEach(src => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded >= total) {
          resolve();
        }
      };
      img.src = src;
    });

    // Timeout fallback
    setTimeout(resolve, 5000);
  });
}

export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function preloadImages(sources) {
  return Promise.all(sources.map(preloadImage));
}