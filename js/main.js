/**
 * PROJECT ZERO — Application Entry Point (2D)
 * Lightweight, clean, responsive bootstrap for 2D engineering challenges.
 */

import { UIController } from './ui.js';
import { GameManager2D } from './gameManager.js';

class App2D {
  constructor() {
    this.ui = new UIController();
    this.gameManager = new GameManager2D(this.ui);

    this.confettiCanvas = document.getElementById('confetti-canvas');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.lastTime = performance.now();
    this.startLoop();
  }

  resizeCanvas() {
    if (this.confettiCanvas) {
      this.confettiCanvas.width = window.innerWidth;
      this.confettiCanvas.height = window.innerHeight;
    }
  }

  startLoop() {
    const loop = (currentTime) => {
      requestAnimationFrame(loop);
      const delta = Math.min(0.1, (currentTime - this.lastTime) / 1000);
      this.lastTime = currentTime;

      this.gameManager.update(delta);
    };

    requestAnimationFrame(loop);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App2D();
});
