/**
 * PROJECT ZERO — Procedural Web Audio Engine
 * High-fidelity synthesized sound effects for industrial doors, engines, chess, drone, CAD, and fanfare.
 * Works 100% offline without external audio files.
 */

import { gameState } from './gameState.js';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isInitialized = false;
    this.ambienceSource = null;
    this.ambienceGain = null;
    this.kartEngineGain = null;
    this.kartOsc = null;
    this.droneEngineGain = null;
    this.droneOsc = null;

    // Listen to state changes
    gameState.subscribe((event, data) => {
      if (event === 'sound') {
        this.updateMasterMute(data);
      }
    });
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = gameState.soundEnabled ? 0.8 : 0.0;
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;

      if (this.ctx.state === 'suspended') {
        const unlock = () => {
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
          }
          window.removeEventListener('pointerdown', unlock);
          window.removeEventListener('keydown', unlock);
        };
        window.addEventListener('pointerdown', unlock);
        window.addEventListener('keydown', unlock);
      }
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  ensureContext() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  updateMasterMute(enabled) {
    if (!this.masterGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(enabled ? 0.8 : 0.0, now + 0.05);
  }

  // Industrial Ambient Hum
  startAmbience() {
    this.ensureContext();
    if (!this.ctx || this.ambienceSource) return;

    // Low rumble drone
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    this.ambienceGain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(55.8, this.ctx.currentTime); // Slight detune for pulsing hum

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);

    this.ambienceGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(this.ambienceGain);
    this.ambienceGain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    this.ambienceSource = { osc1, osc2, filter };
  }

  // Door Unlock: Pneumatic hiss + metallic bolt release
  playDoorUnlock() {
    this.ensureContext();
    if (!this.ctx || !gameState.soundEnabled) return;
    const now = this.ctx.currentTime;

    // Pneumatic air hiss (filtered white noise)
    const bufferSize = this.ctx.sampleRate * 0.4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1800, now);
    noiseFilter.Q.setValueAtTime(3, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    whiteNoise.start(now);

    // Heavy metallic clank
    const clankOsc = this.ctx.createOscillator();
    const clankGain = this.ctx.createGain();
    clankOsc.type = 'triangle';
    clankOsc.frequency.setValueAtTime(280, now + 0.05);
    clankOsc.frequency.exponentialRampToValueAtTime(60, now + 0.25);

    clankGain.gain.setValueAtTime(0.4, now + 0.05);
    clankGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    clankOsc.connect(clankGain);
    clankGain.connect(this.masterGain);

    clankOsc.start(now + 0.05);
    clankOsc.stop(now + 0.35);
  }

  // Door Slide: Heavy hydraulic motor slide
  playDoorSlide() {
    this.ensureContext();
    if (!this.ctx || !gameState.soundEnabled) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(115, now + 0.8);
    osc.frequency.linearRampToValueAtTime(80, now + 1.4);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.55);
  }

  // Chess Move: Crisp wood/ceramic tactile clack
  playChessMove() {
    this.ensureContext();
    if (!this.ctx || !gameState.soundEnabled) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Chess Alert: High tactical alert chime
  playChessCheck() {
    this.ensureContext();
    if (!this.ctx || !gameState.soundEnabled) return;
    const now = this.ctx.currentTime;

    [880, 1320].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.2, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  }

  // Racing sound effects
  playRaceStart() {
    this.ensureContext();
    if (!this.ctx || !gameState.soundEnabled) return;
    const now = this.ctx.currentTime;

    // Three beeps then GO tone
    [440, 440, 440, 880].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = now + idx * 0.3;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(idx === 3 ? 0.35 : 0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + (idx === 3 ? 0.4 : 0.15));

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.45);
    });
  }

  // Kart Engine continuous loop with RPM pitch scaling
  startKartEngine() {
    this.ensureContext();
    if (!this.ctx || this.kartOsc) return;

    this.kartOsc = this.ctx.createOscillator();
    this.kartFilter = this.ctx.createBiquadFilter();
    this.kartEngineGain = this.ctx.createGain();

    this.kartOsc.type = 'sawtooth';
    this.kartOsc.frequency.setValueAtTime(80, this.ctx.currentTime);

    this.kartFilter.type = 'lowpass';
    this.kartFilter.frequency.setValueAtTime(400, this.ctx.currentTime);

    this.kartEngineGain.gain.setValueAtTime(gameState.soundEnabled ? 0.12 : 0, this.ctx.currentTime);

    this.kartOsc.connect(this.kartFilter);
    this.kartFilter.connect(this.kartEngineGain);
    this.kartEngineGain.connect(this.masterGain);

    this.kartOsc.start();
  }

  updateKartEngine(rpmRatio) {
    if (!this.kartOsc || !this.ctx) return;
    const now = this.ctx.currentTime;
    const targetFreq = 70 + rpmRatio * 180;
    this.kartOsc.frequency.cancelScheduledValues(now);
    this.kartOsc.frequency.linearRampToValueAtTime(targetFreq, now + 0.05);

    if (this.kartFilter) {
      this.kartFilter.frequency.setValueAtTime(300 + rpmRatio * 600, now);
    }
  }

  stopKartEngine() {
    if (this.kartOsc) {
      try {
        this.kartOsc.stop();
        this.kartOsc.disconnect();
      } catch (e) {}
      this.kartOsc = null;
      this.kartEngineGain = null;
    }
  }

  // Drone rotor audio
  startDroneRotor() {
    this.ensureContext();
    if (!this.ctx || this.droneOsc) return;

    this.droneOsc = this.ctx.createOscillator();
    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneEngineGain = this.ctx.createGain();

    this.droneOsc.type = 'triangle';
    this.droneOsc.frequency.setValueAtTime(220, this.ctx.currentTime);

    this.droneFilter.type = 'bandpass';
    this.droneFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
    this.droneFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    this.droneEngineGain.gain.setValueAtTime(gameState.soundEnabled ? 0.14 : 0, this.ctx.currentTime);

    this.droneOsc.connect(this.droneFilter);
    this.droneFilter.connect(this.droneEngineGain);
    this.droneEngineGain.connect(this.masterGain);

    this.droneOsc.start();
  }

  updateDroneRotor(throttle) {
    if (!this.droneOsc || !this.ctx) return;
    const now = this.ctx.currentTime;
    const freq = 200 + throttle * 120;
    this.droneOsc.frequency.linearRampToValueAtTime(freq, now + 0.05);
  }

  stopDroneRotor() {
    if (this.droneOsc) {
      try {
        this.droneOsc.stop();
        this.droneOsc.disconnect();
      } catch (e) {}
      this.droneOsc = null;
      this.droneEngineGain = null;
    }
  }

  // Checkpoint Chime
  playCheckpoint() {
    this.ensureContext();
    if (!this.ctx || !gameState.soundEnabled) return;
    const now = this.ctx.currentTime;

    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0.2, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.4);
    });
  }

  // Jet Engine Ignition: High turbine spool -> burner ignition roar
  playEngineIgnition() {
    this.ensureContext();
    if (!this.ctx || !gameState.soundEnabled) return;
    const now = this.ctx.currentTime;

    // Turbine whine spool up
    const spool = this.ctx.createOscillator();
    const spoolGain = this.ctx.createGain();
    spool.type = 'sine';
    spool.frequency.setValueAtTime(120, now);
    spool.frequency.exponentialRampToValueAtTime(1800, now + 1.8);

    spoolGain.gain.setValueAtTime(0.05, now);
    spoolGain.gain.linearRampToValueAtTime(0.25, now + 1.6);
    spoolGain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

    spool.connect(spoolGain);
    spoolGain.connect(this.masterGain);

    spool.start(now);
    spool.stop(now + 3.3);

    // Ignition combustion blast (filtered noise)
    const bufferSize = this.ctx.sampleRate * 2.5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const blastNoise = this.ctx.createBufferSource();
    blastNoise.buffer = noiseBuffer;

    const blastFilter = this.ctx.createBiquadFilter();
    blastFilter.type = 'lowpass';
    blastFilter.frequency.setValueAtTime(300, now + 1.2);
    blastFilter.frequency.linearRampToValueAtTime(800, now + 2.0);

    const blastGain = this.ctx.createGain();
    blastGain.gain.setValueAtTime(0.001, now + 1.1);
    blastGain.gain.linearRampToValueAtTime(0.45, now + 1.5);
    blastGain.gain.exponentialRampToValueAtTime(0.01, now + 3.4);

    blastNoise.connect(blastFilter);
    blastFilter.connect(blastGain);
    blastGain.connect(this.masterGain);

    blastNoise.start(now + 1.1);
  }

  // CAD Snap: SolidWorks-style mechanical mate snap
  playCadSnap() {
    this.ensureContext();
    if (!this.ctx || !gameState.soundEnabled) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(750, now);
    osc1.frequency.exponentialRampToValueAtTime(180, now + 0.06);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1100, now);
    osc2.frequency.exponentialRampToValueAtTime(320, now + 0.08);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.12);
    osc2.stop(now + 0.12);
  }

  // Victory Fanfare (Challenge completion / Final vault reveal)
  playFanfare(isFinal = false) {
    this.ensureContext();
    if (!this.ctx || !gameState.soundEnabled) return;
    const now = this.ctx.currentTime;

    const notes = isFinal 
      ? [523.25, 659.25, 783.99, 1046.50, 1318.51] // C5, E5, G5, C6, E6
      : [440, 554.37, 659.25, 880];               // A4, C#5, E5, A5

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = now + idx * 0.12;

      osc.type = isFinal ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.28, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + (idx === notes.length - 1 ? 0.8 : 0.25));

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + (idx === notes.length - 1 ? 0.9 : 0.3));
    });
  }

  // UI Button Click
  playClick() {
    this.ensureContext();
    if (!this.ctx || !gameState.soundEnabled) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const audio = new AudioManager();
