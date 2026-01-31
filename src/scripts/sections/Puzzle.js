/**
 * Puzzle Section - Photoly Studio
 * Interactive sliding tile puzzle with real images
 */

import { gsap } from 'gsap';

export default class Puzzle {
  constructor(container) {
    this.container = container;
    this.board = container.querySelector('[data-puzzle-board]');
    this.skipBtn = container.querySelector('[data-puzzle-skip]');
    this.counter = container.querySelector('[data-puzzle-counter]');
    this.completeEl = container.querySelector('[data-puzzle-complete]');
    
    this.size = 4; // 4x4 grid
    this.tiles = [];
    this.emptyIndex = 15;
    this.solvedCount = 0;
    this.isSolved = false;
    this.isAnimating = false;
    
    // Puzzle images
    this.images = [
      '/assets/images/puzzle/puzzle-1.jpg',
      '/assets/images/puzzle/puzzle-2.jpg',
      '/assets/images/puzzle/puzzle-3.jpg',
      '/assets/images/puzzle/puzzle-4.jpg',
      '/assets/images/puzzle/puzzle-5.jpg'
    ];
    this.currentImageIndex = 0;
    this.currentImage = null;
    
    this.init();
  }

  init() {
    this.loadImageAndStart();
    this.bindEvents();
  }

  loadImageAndStart() {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      this.currentImage = img;
      this.createPuzzle();
      this.shuffle();
      this.render();
    };
    
    img.onerror = () => {
      // Fallback to color-based puzzle
      this.currentImage = null;
      this.createPuzzle();
      this.shuffle();
      this.render();
    };
    
    img.src = this.images[this.currentImageIndex];
  }

  createPuzzle() {
    this.tiles = [];
    for (let i = 0; i < 16; i++) {
      this.tiles.push(i); // 0 = empty, 1-15 = tiles
    }
    this.emptyIndex = 15;
    this.isSolved = false;
  }

  shuffle() {
    // Perform random valid moves to ensure solvability
    const moves = 150;
    
    for (let i = 0; i < moves; i++) {
      const validMoves = this.getValidMoves();
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      
      // Swap
      [this.tiles[randomMove], this.tiles[this.emptyIndex]] = 
      [this.tiles[this.emptyIndex], this.tiles[randomMove]];
      
      this.emptyIndex = randomMove;
    }
  }

  getValidMoves() {
    const moves = [];
    const row = Math.floor(this.emptyIndex / this.size);
    const col = this.emptyIndex % this.size;
    
    if (row > 0) moves.push(this.emptyIndex - this.size); // Up
    if (row < this.size - 1) moves.push(this.emptyIndex + this.size); // Down
    if (col > 0) moves.push(this.emptyIndex - 1); // Left
    if (col < this.size - 1) moves.push(this.emptyIndex + 1); // Right
    
    return moves;
  }

  render() {
    this.board.innerHTML = '';
    
    this.tiles.forEach((tileValue, index) => {
      const tileEl = document.createElement('div');
      tileEl.className = 'puzzle__tile';
      tileEl.dataset.index = index;
      tileEl.dataset.value = tileValue;
      
      if (tileValue === 0) {
        // Empty tile
        tileEl.classList.add('puzzle__tile--empty');
      } else {
        // Calculate background position for this tile piece
        const originalRow = Math.floor((tileValue - 1) / this.size);
        const originalCol = (tileValue - 1) % this.size;
        
        if (this.currentImage) {
          // Use image
          tileEl.style.backgroundImage = `url(${this.currentImage.src})`;
          tileEl.style.backgroundSize = '400% 400%';
          tileEl.style.backgroundPosition = `${(originalCol / 3) * 100}% ${(originalRow / 3) * 100}%`;
        } else {
          // Fallback to colored tiles with numbers
          const hue = (tileValue * 24) % 360;
          tileEl.style.backgroundColor = `hsl(${hue}, 40%, 45%)`;
          tileEl.innerHTML = `<span style="color:white;font-size:1.5rem;font-weight:bold;">${tileValue}</span>`;
          tileEl.style.display = 'flex';
          tileEl.style.alignItems = 'center';
          tileEl.style.justifyContent = 'center';
        }
      }
      
      this.board.appendChild(tileEl);
    });
  }

  bindEvents() {
    // Click on tiles
    this.board.addEventListener('click', (e) => {
      const tile = e.target.closest('.puzzle__tile');
      if (tile && !tile.classList.contains('puzzle__tile--empty') && !this.isAnimating) {
        const clickedIndex = parseInt(tile.dataset.index);
        this.handleTileClick(clickedIndex);
      }
    });
    
    // Touch support for swipe
    let touchStartX = 0;
    let touchStartY = 0;
    
    this.board.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    this.board.addEventListener('touchend', (e) => {
      if (this.isAnimating) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 30) this.swipe('right');
        else if (deltaX < -30) this.swipe('left');
      } else {
        if (deltaY > 30) this.swipe('down');
        else if (deltaY < -30) this.swipe('up');
      }
    }, { passive: true });
    
    // Skip button
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => this.skip());
    }
  }

  swipe(direction) {
    const emptyRow = Math.floor(this.emptyIndex / this.size);
    const emptyCol = this.emptyIndex % this.size;
    
    let targetIndex = -1;
    
    // The tile that moves INTO the empty space
    switch (direction) {
      case 'up':
        // Tile below empty moves up
        if (emptyRow < this.size - 1) targetIndex = this.emptyIndex + this.size;
        break;
      case 'down':
        // Tile above empty moves down
        if (emptyRow > 0) targetIndex = this.emptyIndex - this.size;
        break;
      case 'left':
        // Tile to the right of empty moves left
        if (emptyCol < this.size - 1) targetIndex = this.emptyIndex + 1;
        break;
      case 'right':
        // Tile to the left of empty moves right
        if (emptyCol > 0) targetIndex = this.emptyIndex - 1;
        break;
    }
    
    if (targetIndex >= 0) {
      this.moveTile(targetIndex);
    }
  }

  handleTileClick(clickedIndex) {
    const validMoves = this.getValidMoves();
    
    if (validMoves.includes(clickedIndex)) {
      this.moveTile(clickedIndex);
    }
  }

  moveTile(fromIndex) {
    if (this.isSolved || this.isAnimating) return;
    
    this.isAnimating = true;
    
    const fromTile = this.board.querySelector(`[data-index="${fromIndex}"]`);
    const toTile = this.board.querySelector(`[data-index="${this.emptyIndex}"]`);
    
    if (!fromTile || !toTile) {
      this.isAnimating = false;
      return;
    }
    
    // Calculate movement direction
    const fromRow = Math.floor(fromIndex / this.size);
    const fromCol = fromIndex % this.size;
    const toRow = Math.floor(this.emptyIndex / this.size);
    const toCol = this.emptyIndex % this.size;
    
    const tileSize = this.board.clientWidth / this.size;
    const moveX = (toCol - fromCol) * tileSize;
    const moveY = (toRow - fromRow) * tileSize;
    
    // Animate the tile
    gsap.to(fromTile, {
      x: moveX,
      y: moveY,
      duration: 0.15,
      ease: 'power2.out',
      onComplete: () => {
        // Swap in data
        [this.tiles[fromIndex], this.tiles[this.emptyIndex]] = 
        [this.tiles[this.emptyIndex], this.tiles[fromIndex]];
        
        this.emptyIndex = fromIndex;
        
        // Re-render
        this.render();
        
        this.isAnimating = false;
        
        // Check if solved
        if (this.checkSolved()) {
          this.onSolved();
        }
      }
    });
  }

  checkSolved() {
    for (let i = 0; i < 15; i++) {
      if (this.tiles[i] !== i + 1) return false;
    }
    return this.tiles[15] === 0;
  }

  onSolved() {
    this.isSolved = true;
    this.solvedCount++;
    
    if (this.counter) {
      this.counter.textContent = `Puzzles solved: ${this.solvedCount}`;
    }
    
    // Show complete state
    this.board.classList.add('is-solved');
    
    if (this.completeEl) {
      this.completeEl.classList.add('is-visible');
      
      setTimeout(() => {
        this.completeEl.classList.remove('is-visible');
        this.reset();
      }, 2500);
    } else {
      setTimeout(() => this.reset(), 2500);
    }
  }

  skip() {
    // Solve it instantly
    for (let i = 0; i < 15; i++) {
      this.tiles[i] = i + 1;
    }
    this.tiles[15] = 0;
    this.emptyIndex = 15;
    this.render();
    
    this.board.classList.add('is-solved');
    
    setTimeout(() => this.reset(), 1500);
  }

  reset() {
    this.isSolved = false;
    this.board.classList.remove('is-solved');
    
    // Next image
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    
    // Reload with new image
    this.loadImageAndStart();
  }

  destroy() {
    // Clean up
  }
}
