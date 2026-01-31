/**
 * Reels Section - Photoly Studio
 * Dual scrolling strips with micro-stories and real images
 */

export default class Reels {
  constructor(container) {
    this.container = container;
    this.topRow = container.querySelector('[data-reels-row="top"]');
    this.bottomRow = container.querySelector('[data-reels-row="bottom"]');
    
    // Stories paired with images
    this.stories = [
      { text: "She laughed right before I clicked. That's the one.", image: '/assets/images/reels/reel-1.jpg' },
      { text: "4am. No sleep. Worth it.", image: '/assets/images/reels/reel-2.jpg' },
      { text: "He didn't want photos. Now it's his favorite.", image: '/assets/images/reels/reel-3.jpg' },
      { text: "My daughter. My heart.", image: '/assets/images/reels/reel-4.jpg' },
      { text: "Rain wasn't in the plan. It was better.", image: '/assets/images/reels/reel-5.jpg' },
      { text: "The dress was borrowed. The moment was hers.", image: '/assets/images/reels/reel-6.jpg' },
      { text: "They forgot I was there. That's when magic happens.", image: '/assets/images/reels/reel-7.jpg' },
      { text: "Three generations in one frame.", image: '/assets/images/reels/reel-8.jpg' },
      { text: "First dance. Last light. Perfect.", image: '/assets/images/reels/reel-9.jpg' },
      { text: "She said yes. I caught the tears.", image: '/assets/images/reels/reel-10.jpg' },
      { text: "Golden hour never disappoints.", image: '/assets/images/reels/reel-11.jpg' },
      { text: "Sometimes the candid shots tell the real story.", image: '/assets/images/reels/reel-12.jpg' }
    ];
    
    this.init();
  }

  init() {
    this.populateRows();
    this.setupHoverPause();
  }

  populateRows() {
    this.topRow.innerHTML = '';
    this.bottomRow.innerHTML = '';
    
    // Top row: alternates text, image, text, image...
    const topContent = this.createRowContent('top');
    this.topRow.innerHTML = topContent + topContent; // Duplicate for seamless loop
    
    // Bottom row: alternates image, text, image, text...
    const bottomContent = this.createRowContent('bottom');
    this.bottomRow.innerHTML = bottomContent + bottomContent;
  }

  createRowContent(row) {
    let html = '';
    
    this.stories.forEach((story, index) => {
      if (row === 'top') {
        // Top row: text first on even indexes
        if (index % 2 === 0) {
          html += this.createTextCard(story.text);
          html += this.createImageCard(story.image);
        } else {
          html += this.createImageCard(story.image);
          html += this.createTextCard(story.text);
        }
      } else {
        // Bottom row: image first on even indexes (opposite pattern)
        if (index % 2 === 0) {
          html += this.createImageCard(story.image);
          html += this.createTextCard(story.text);
        } else {
          html += this.createTextCard(story.text);
          html += this.createImageCard(story.image);
        }
      }
    });
    
    return html;
  }

  createTextCard(text) {
    return `
      <div class="reels__card reels__card--text">
        <p>"${text}"</p>
      </div>
    `;
  }

  createImageCard(imageSrc) {
    return `
      <div class="reels__card reels__card--image">
        <img src="${imageSrc}" alt="Photography moment" loading="lazy" onerror="this.parentElement.style.backgroundColor='var(--color-cognac)'">
      </div>
    `;
  }

  setupHoverPause() {
    this.container.addEventListener('mouseenter', () => {
      this.topRow.style.animationPlayState = 'paused';
      this.bottomRow.style.animationPlayState = 'paused';
    });
    
    this.container.addEventListener('mouseleave', () => {
      this.topRow.style.animationPlayState = 'running';
      this.bottomRow.style.animationPlayState = 'running';
    });

    this.container.addEventListener('touchstart', () => {
      this.topRow.style.animationPlayState = 'paused';
      this.bottomRow.style.animationPlayState = 'paused';
    }, { passive: true });
    
    this.container.addEventListener('touchend', () => {
      this.topRow.style.animationPlayState = 'running';
      this.bottomRow.style.animationPlayState = 'running';
    });
  }

  destroy() {
    // Clean up
  }
}