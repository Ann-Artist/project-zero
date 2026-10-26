/**
 * PROJECT ZERO — 2D Mechanical Blast Door System
 * High-impact industrial sliding blast doors with animated locking bolts,
 * hydraulic audio effects, stencil signage, and dual-state status LEDs.
 */

import { audio } from './audio.js';

export class DoorSystem2D {
  constructor() {
    this.container = document.getElementById('blast-door-overlay');
    this.leftPanel = document.getElementById('door-panel-left');
    this.rightPanel = document.getElementById('door-panel-right');
    this.doorLabel = document.getElementById('door-label-text');
    this.leds = document.querySelectorAll('.door-status-led');
    this.bolts = document.querySelectorAll('.locking-bolt');
    this.skipBtn = document.getElementById('btn-door-skip');

    this.isAnimating = false;
    this.onCompleteCallback = null;

    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => this.skip());
    }
  }

  open(doorNumber, roomLabel, onComplete = null) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.onCompleteCallback = onComplete;

    // Reset panels to closed position
    this.container.classList.remove('hidden');
    this.container.classList.remove('opened');
    this.container.classList.remove('bolts-retracted');

    if (this.doorLabel) {
      this.doorLabel.textContent = `GATE ${doorNumber} // ${roomLabel.toUpperCase()}`;
    }

    // Set LEDs to locked red initially
    this.setLeds(false);

    // Phase 1: Unlock sequence (retract bolts, turn LEDs green)
    setTimeout(() => {
      this.setLeds(true);
      audio.playDoorUnlock();
      this.container.classList.add('bolts-retracted');

      // Phase 2: Slide panels open
      setTimeout(() => {
        audio.playDoorSlide();
        this.container.classList.add('opened');

        // Phase 3: Transition complete
        setTimeout(() => {
          this.finish();
        }, 900);
      }, 550);
    }, 250);
  }

  setLeds(unlocked) {
    this.leds.forEach(led => {
      if (unlocked) {
        led.classList.add('unlocked');
      } else {
        led.classList.remove('unlocked');
      }
    });
  }

  finish() {
    this.isAnimating = false;
    this.container.classList.add('hidden');
    if (this.onCompleteCallback) {
      const cb = this.onCompleteCallback;
      this.onCompleteCallback = null;
      cb();
    }
  }

  skip() {
    if (!this.isAnimating) return;
    this.finish();
  }

  reset() {
    this.isAnimating = false;
    this.container.classList.add('hidden');
    this.container.classList.remove('opened');
    this.container.classList.remove('bolts-retracted');
    this.setLeds(false);
  }
}
