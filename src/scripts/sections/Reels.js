/**
 * Reels Section - Photoly Studio
 * Dual scrolling strips with micro-stories and clickable images
 */

import { gsap } from 'gsap';

export default class Reels {
  constructor(container) {
    this.container = container;
    this.topRow = container.querySelector('[data-reels-row="top"]');
    this.bottomRow = container.querySelector('[data-reels-row="bottom"]');
    
    this.isExpanded = false;
    
    // Stories paired with images
    this.stories = [
      { text: "She laughed right before I clicked. That's the one.", image: '/assets/images/reels/reel-1.jpg', title: 'The Laugh' },
      { text: "4am. No sleep. Worth it.", image: '/assets/images/reels/reel-2.jpg', title: 'Golden Hour' },
      { text: "He didn't want photos. Now it's his favorite.", image: '/assets/images/reels/reel-3.jpg', title: 'The Reluctant Subject' },
      { text: "My daughter. My heart.", image: '/assets/images/reels/reel-4.jpg', title: 'Family' },
      { text: "Rain wasn't in the plan. It was better.", image: '/assets/images/reels/reel-5.jpg', title: 'Happy Accident' },
      { text: "The dress was borrowed. The moment was hers.", image: '/assets/images/reels/reel-6.jpg', title: 'Something Borrowed' },
      { text: "They forgot I was there. That's when magic happens.", image: '/assets/images/reels/reel-7.jpg', title: 'Invisible' },
      { text: "Three generations in one frame.", image: '/assets/images/reels/reel-8.jpg', title: 'Legacy' },
      { text: "First dance. Last light. Perfect.", image: '/assets/images/reels/reel-9.jpg', title: 'First Dance' },
      { text: "She said yes. I caught the tears.", image: '/assets/images/reels/reel-10.jpg', title: 'The Proposal' },
      { text: "Golden hour never disappoints.", image: '/assets/images/reels/reel-11.jpg', title: 'Magic Hour' },
      { text: "Sometimes the candid shots tell the real story.", image: '/assets/images/reels/reel-12.jpg', title: 'Candid' }
    ];
    
    this.init();
  }

  init() {
    this.createExpandedViewHTML();
    this.populateRows();
    this.setupHoverPause();
    this.setupClickToExpand();
  }

  createExpandedViewHTML() {
    const overlay = document.createElement('div');
    overlay.className = 'reels__expanded';
    overlay.setAttribute('data-reels-expanded', '');
    overlay.innerHTML = `
      <div class="reels__expanded-content">
        <img class="reels__expanded-image" data-reels-expanded-image src="" alt="">
        <div class="reels__expanded-caption">
          <h3 class="reels__expanded-title" data-reels-expanded-title></h3>
          <p class="reels__expanded-story" data-reels-expanded-story></p>
        </div>
      </div>
      <button class="reels__expanded-close" data-reels-expanded-close aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <p class="reels__expanded-hint">Click anywhere to close</p>
    `;
    this.container.appendChild(overlay);
    
    this.expandedView = overlay;
    this.expandedImage = overlay.querySelector('[data-reels-expanded-image]');
    this.expandedTitle = overlay.querySelector('[data-reels-expanded-title]');
    this.expandedStory = overlay.querySelector('[data-reels-expanded-story]');
  }

  populateRows() {
    this.topRow.innerHTML = '';
    this.bottomRow.innerHTML = '';
    
    // Top row content
    const topContent = this.createRowContent('top');
    this.topRow.innerHTML = topContent + topContent; // Duplicate for seamless loop
    
    // Bottom row content
    const bottomContent = this.createRowContent('bottom');
    this.bottomRow.innerHTML = bottomContent + bottomContent;
  }

  createRowContent(row) {
    let html = '';
    
    this.stories.forEach((story, index) => {
      if (row === 'top') {
        if (index % 2 === 0) {
          html += this.createTextCard(story.text);
          html += this.createImageCard(story, index);
        } else {
          html += this.createImageCard(story, index);
          html += this.createTextCard(story.text);
        }
      } else {
        if (index % 2 === 0) {
          html += this.createImageCard(story, index);
          html += this.createTextCard(story.text);
        } else {
          html += this.createTextCard(story.text);
          html += this.createImageCard(story, index);
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

  createImageCard(story, index) {
    return `
      <div class="reels__card reels__card--image" 
           data-reels-image 
           data-image-src="${story.image}" 
           data-image-title="${story.title}"
           data-image-story="${story.text}">
        <img src="${story.image}" alt="${story.title}" loading="lazy" 
             onerror="this.style.display='none'; this.parentElement.style.backgroundColor='var(--color-cognac)';">
        <div class="reels__card-overlay">
          <span class="reels__card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </span>
        </div>
      </div>
    `;
  }

  setupHoverPause() {
    // Pause on hover
    this.container.addEventListener('mouseenter', () => {
      if (!this.isExpanded) {
        this.pauseAnimation();
      }
    });
    
    this.container.addEventListener('mouseleave', () => {
      if (!this.isExpanded) {
        this.resumeAnimation();
      }
    });

    // Pause on touch
    let touchTimeout;
    this.container.addEventListener('touchstart', () => {
      if (!this.isExpanded) {
        this.pauseAnimation();
        clearTimeout(touchTimeout);
      }
    }, { passive: true });
    
    this.container.addEventListener('touchend', () => {
      if (!this.isExpanded) {
        touchTimeout = setTimeout(() => this.resumeAnimation(), 2000);
      }
    }, { passive: true });
  }

  pauseAnimation() {
    this.topRow.style.animationPlayState = 'paused';
    this.bottomRow.style.animationPlayState = 'paused';
  }

  resumeAnimation() {
    this.topRow.style.animationPlayState = 'running';
    this.bottomRow.style.animationPlayState = 'running';
  }

  setupClickToExpand() {
    // Event delegation for image clicks
    this.container.addEventListener('click', (e) => {
      const imageCard = e.target.closest('[data-reels-image]');
      if (imageCard && !this.isExpanded) {
        this.openExpandedView(imageCard);
      }
    });
    
    // Close expanded view
    this.expandedView.addEventListener('click', (e) => {
      if (e.target === this.expandedView || 
          e.target.closest('[data-reels-expanded-close]') ||
          e.target.closest('.reels__expanded-hint')) {
        this.closeExpandedView();
      }
    });
    
    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isExpanded) {
        this.closeExpandedView();
      }
    });
  }

  openExpandedView(imageCard) {
    const imageSrc = imageCard.dataset.imageSrc;
    const title = imageCard.dataset.imageTitle;
    const story = imageCard.dataset.imageStory;
    
    this.isExpanded = true;
    
    // Pause animation
    this.pauseAnimation();
    
    // Set content
    this.expandedImage.src = imageSrc;
    this.expandedImage.alt = title;
    this.expandedTitle.textContent = title;
    this.expandedStory.textContent = `"${story}"`;
    
    // Show overlay
    this.expandedView.classList.add('is-open');
    
    // Animate in
    gsap.fromTo(this.expandedImage,
      { scale: 0.8, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' }
    );
    
    gsap.fromTo(this.expandedView.querySelector('.reels__expanded-caption'),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, delay: 0.2, ease: 'power2.out' }
    );
  }

  closeExpandedView() {
    if (!this.isExpanded) return;
    
    gsap.to(this.expandedImage, {
      scale: 0.9,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in'
    });
    
    gsap.to(this.expandedView.querySelector('.reels__expanded-caption'), {
      opacity: 0,
      y: 10,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        this.isExpanded = false;
        this.expandedView.classList.remove('is-open');
        this.resumeAnimation();
      }
    });
  }

  destroy() {
    // Clean up
  }
}