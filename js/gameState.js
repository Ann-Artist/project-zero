/**
 * PROJECT ZERO — Game State Manager
 * Tracks room progress, challenge states, scores, times, and persistence.
 */

import { CONFIG } from './config.js';

export const STATES = {
  LOCKED: 'LOCKED',
  READY: 'READY',
  PLAYING: 'PLAYING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
};

class GameState {
  constructor() {
    this.currentRoom = 0; // 0 = entrance, 1..5 = challenges, 6 = reward
    this.status = STATES.READY;
    this.completedChallenges = new Set();
    this.scores = {
      chess: 0,
      racing: 0,
      drone: 0,
      engine: 0,
      cad: 0,
      total: 0
    };
    this.times = {
      chess: 0,
      racing: 0,
      drone: 0,
      engine: 0,
      cad: 0,
      total: 0
    };
    this.roomStartTime = 0;
    this.gameStartTime = 0;
    this.soundEnabled = this.loadSoundPreference();
    this.subscribers = [];
  }

  loadSoundPreference() {
    try {
      const saved = localStorage.getItem('project_zero_sound');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch (e) {}
    return CONFIG.audioEnabledByDefault;
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = !!enabled;
    try {
      localStorage.setItem('project_zero_sound', this.soundEnabled ? 'true' : 'false');
    } catch (e) {}
    this.notify('sound', this.soundEnabled);
  }

  toggleSound() {
    this.setSoundEnabled(!this.soundEnabled);
    return this.soundEnabled;
  }

  startRoomTimer() {
    this.roomStartTime = performance.now();
    if (!this.gameStartTime && this.currentRoom > 0) {
      this.gameStartTime = performance.now();
    }
  }

  getRoomElapsedSeconds() {
    if (!this.roomStartTime) return 0;
    return Math.floor((performance.now() - this.roomStartTime) / 1000);
  }

  getTotalElapsedSeconds() {
    if (!this.gameStartTime) return 0;
    return Math.floor((performance.now() - this.gameStartTime) / 1000);
  }

  completeChallenge(challengeKey, rawScore = CONFIG.pointsPerChallenge) {
    const elapsed = this.getRoomElapsedSeconds();
    this.times[challengeKey] = elapsed;
    
    // Speed bonus for quick completion
    const speedBonus = Math.max(0, Math.min(CONFIG.speedBonusMax, Math.floor((60 - elapsed) * 10)));
    const finalScore = rawScore + speedBonus;
    
    this.scores[challengeKey] = finalScore;
    this.scores.total = Object.keys(this.scores)
      .filter(k => k !== 'total')
      .reduce((acc, k) => acc + (this.scores[k] || 0), 0);

    this.completedChallenges.add(challengeKey);
    this.status = STATES.SUCCESS;

    this.notify('challengeComplete', {
      challengeKey,
      score: finalScore,
      elapsed,
      totalScore: this.scores.total
    });
  }

  setCurrentRoom(roomIndex) {
    this.currentRoom = roomIndex;
    this.status = STATES.READY;
    this.startRoomTimer();
    this.notify('roomChange', roomIndex);
  }

  resetAll() {
    this.currentRoom = 0;
    this.status = STATES.READY;
    this.completedChallenges.clear();
    Object.keys(this.scores).forEach(k => this.scores[k] = 0);
    Object.keys(this.times).forEach(k => this.times[k] = 0);
    this.roomStartTime = 0;
    this.gameStartTime = 0;
    this.notify('reset');
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify(event, data) {
    for (const cb of this.subscribers) {
      try {
        cb(event, data, this);
      } catch (err) {
        console.error('GameState subscriber error:', err);
      }
    }
  }
}

export const gameState = new GameState();
