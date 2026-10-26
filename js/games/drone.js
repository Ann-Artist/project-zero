/**
 * PROJECT ZERO — Challenge 3: Drone Flight Test (2D Canvas)
 * Responsive 2D quadcopter navigation challenge with spinning rotors,
 * sequential radar checkpoints, target guidance, altitude control,
 * and reliable soft landing pad touchdown verification.
 */

import { audio } from '../audio.js';
import { gameState } from '../gameState.js';

export class DroneGame2D {
  constructor(container, ui, onVictory) {
    this.container = container;
    this.ui = ui;
    this.onVictory = onVictory;

    this.isActive = false;
    this.isComplete = false;

    this.drone = {
      x: 120,
      y: 440,
      vx: 0,
      vy: 0,
      altitude: 2.5, // Cruising altitude (0.2 .. 8.0 meters)
      tilt: 0,
      rotorAngle: 0
    };

    this.input = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false
    };

    // 4 Sequential Checkpoint Gates
    this.checkpoints = [
      { x: 260, y: 360, radius: 52, cleared: false, label: 'GATE 1' },
      { x: 550, y: 380, radius: 52, cleared: false, label: 'GATE 2' },
      { x: 620, y: 180, radius: 52, cleared: false, label: 'GATE 3' },
      { x: 300, y: 180, radius: 52, cleared: false, label: 'GATE 4' }
    ];
    this.currentCpIdx = 0;

    // Central Landing Pad (H)
    this.landingPad = { x: 420, y: 440, radius: 55 };

    this.initDOM();
    this.setupControls();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="drone-canvas-wrapper">
        <canvas id="drone-canvas" width="800" height="600"></canvas>

        <!-- On-screen Desktop Controls Hint -->
        <div class="desktop-controls-hint">
          <span>[W/A/S/D] or [ARROWS] FLY</span>
          <span>[SHIFT/E] ASCEND</span>
          <span>[SPACE/Q] DESCEND</span>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#drone-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.render();
  }

  setupControls() {
    this.boundKeyDown = (e) => {
      if (!this.isActive) return;
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') { this.input.forward = true; e.preventDefault(); }
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') { this.input.backward = true; e.preventDefault(); }
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') { this.input.left = true; e.preventDefault(); }
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') { this.input.right = true; e.preventDefault(); }
      if (e.key === 'Shift' || e.key === 'e' || e.key === 'E') { this.input.up = true; e.preventDefault(); }
      if (e.key === ' ' || e.key === 'q' || e.key === 'Q') { this.input.down = true; e.preventDefault(); }
    };

    this.boundKeyUp = (e) => {
      if (!this.isActive) return;
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') this.input.forward = false;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') this.input.backward = false;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') this.input.left = false;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') this.input.right = false;
      if (e.key === 'Shift' || e.key === 'e' || e.key === 'E') this.input.up = false;
      if (e.key === ' ' || e.key === 'q' || e.key === 'Q') this.input.down = false;
    };

    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
  }

  startFlight() {
    this.isActive = true;
    this.isComplete = false;
    this.drone.x = 120;
    this.drone.y = 440;
    this.drone.vx = 0;
    this.drone.vy = 0;
    this.drone.altitude = 2.5;
    this.currentCpIdx = 0;
    this.checkpoints.forEach(cp => cp.cleared = false);

    this.ui.updateDroneHUD(0, this.checkpoints.length, this.drone.altitude, false);
    audio.startDroneRotor();
  }

  stopFlight() {
    this.isActive = false;
    audio.stopDroneRotor();
  }

  update(delta) {
    if (!this.isActive || this.isComplete) {
      this.render();
      return;
    }

    // 1. Flight Dynamics & Acceleration (Responsive quadcopter handling)
    const accel = 0.32;
    const drag = 0.08;
    const maxSpeed = 6.0;

    if (this.input.forward) this.drone.vy -= accel;
    if (this.input.backward) this.drone.vy += accel;
    if (this.input.left) this.drone.vx -= accel;
    if (this.input.right) this.drone.vx += accel;

    // Natural air resistance
    this.drone.vx *= (1 - drag);
    this.drone.vy *= (1 - drag);

    // Altitude adjustments
    if (this.input.up) this.drone.altitude = Math.min(8.0, this.drone.altitude + 0.10);
    if (this.input.down) this.drone.altitude = Math.max(0.2, this.drone.altitude - 0.10);

    // Update position
    this.drone.x += this.drone.vx;
    this.drone.y += this.drone.vy;

    // Boundary protection
    this.drone.x = Math.max(50, Math.min(750, this.drone.x));
    this.drone.y = Math.max(50, Math.min(550, this.drone.y));

    // Rotor spinning
    this.drone.rotorAngle += 0.8;

    // Dynamic pitch audio
    const speedRatio = Math.hypot(this.drone.vx, this.drone.vy) / maxSpeed;
    const throttle = speedRatio * 0.6 + (this.drone.altitude / 8.0) * 0.4;
    audio.updateDroneRotor(Math.min(1.0, Math.max(0.2, throttle)));

    // 2. Checkpoints Hit Testing
    this.checkCheckpoints();

    // 3. Landing Pad Hit Testing
    this.checkLanding();

    // HUD Update
    const allCleared = this.currentCpIdx >= this.checkpoints.length;
    this.ui.updateDroneHUD(this.currentCpIdx, this.checkpoints.length, this.drone.altitude, allCleared);

    // 4. Render
    this.render();
  }

  checkCheckpoints() {
    if (this.currentCpIdx >= this.checkpoints.length) return;

    const target = this.checkpoints[this.currentCpIdx];
    const dist = Math.hypot(this.drone.x - target.x, this.drone.y - target.y);

    // Reliable gate passing condition
    if (dist < target.radius + 12) {
      target.cleared = true;
      audio.playCheckpoint();
      this.currentCpIdx++;

      if (this.currentCpIdx < this.checkpoints.length) {
        this.ui.showToast(`✅ GATE ${this.currentCpIdx} CLEARED // PROCEED TO GATE ${this.currentCpIdx + 1}`, 'info');
      } else {
        this.ui.showToast('🎯 ALL GATES CLEARED // DESCEND TO LAND ON PAD [H]', 'success');
      }
    }
  }

  checkLanding() {
    if (this.currentCpIdx < this.checkpoints.length) return;

    const distToPad = Math.hypot(this.drone.x - this.landingPad.x, this.drone.y - this.landingPad.y);
    const speed = Math.hypot(this.drone.vx, this.drone.vy);

    // If positioned over landing pad
    if (distToPad < this.landingPad.radius + 15) {
      // Touchdown condition: controlled altitude and speed
      if (this.drone.altitude <= 0.6 && speed < 2.5) {
        this.isComplete = true;
        this.isActive = false;

        // Settle drone onto pad center
        this.drone.x = this.landingPad.x;
        this.drone.y = this.landingPad.y;
        this.drone.altitude = 0.2;
        this.drone.vx = 0;
        this.drone.vy = 0;

        audio.stopDroneRotor();
        audio.playFanfare(false);

        this.ui.showToast('🏆 FLIGHT TEST PASSED // SOFT LANDING CONFIRMED', 'success');
        gameState.completeChallenge('drone');

        setTimeout(() => {
          if (this.onVictory) this.onVictory();
        }, 1800);
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 800, 600);

    // 1. Hangar Grid Floor
    ctx.fillStyle = '#0f141c';
    ctx.fillRect(0, 0, 800, 600);

    ctx.strokeStyle = '#1a2230';
    ctx.lineWidth = 1;
    for (let x = 0; x < 800; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }
    for (let y = 0; y < 600; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }

    const allGatesCleared = this.currentCpIdx >= this.checkpoints.length;
    const now = performance.now();

    // 2. Guidance Line to Target
    let targetX = 0, targetY = 0;
    if (!allGatesCleared) {
      const activeCp = this.checkpoints[this.currentCpIdx];
      targetX = activeCp.x;
      targetY = activeCp.y;
    } else {
      targetX = this.landingPad.x;
      targetY = this.landingPad.y;
    }

    ctx.save();
    ctx.strokeStyle = allGatesCleared ? 'rgba(0, 230, 118, 0.35)' : 'rgba(255, 179, 0, 0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(this.drone.x, this.drone.y);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 3. Central Landing Pad (H)
    ctx.save();
    ctx.translate(this.landingPad.x, this.landingPad.y);

    ctx.fillStyle = '#161e2b';
    ctx.beginPath();
    ctx.arc(0, 0, this.landingPad.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = allGatesCleared ? '#00e676' : '#374151';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pulsing outer ring when landing is active
    if (allGatesCleared) {
      const pulseR = this.landingPad.radius + (Math.sin(now * 0.006) + 1) * 6;
      ctx.strokeStyle = 'rgba(0, 230, 118, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = allGatesCleared ? '#00e676' : '#4b5563';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('H', 0, 0);

    // Label below pad
    ctx.font = '10px monospace';
    ctx.fillStyle = allGatesCleared ? '#00e676' : '#64748b';
    ctx.fillText(allGatesCleared ? 'LAND HERE' : 'PAD LOCKED', 0, 36);

    ctx.restore();

    // 4. Holographic Checkpoint Gates
    this.checkpoints.forEach((cp, idx) => {
      ctx.save();
      ctx.translate(cp.x, cp.y);

      const isActive = idx === this.currentCpIdx;
      const isCleared = cp.cleared;

      ctx.beginPath();
      ctx.arc(0, 0, cp.radius, 0, Math.PI * 2);

      if (isCleared) {
        ctx.fillStyle = 'rgba(0, 230, 118, 0.12)';
        ctx.fill();
        ctx.strokeStyle = '#00e676';
        ctx.lineWidth = 2;
      } else if (isActive) {
        // Pulsing active gate beacon
        const pulse = Math.sin(now * 0.007) * 4;
        ctx.fillStyle = 'rgba(255, 179, 0, 0.18)';
        ctx.fill();
        ctx.strokeStyle = '#ffb300';
        ctx.lineWidth = 3.5;

        // Outer beacon wave
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 179, 0, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, cp.radius + 8 + pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1.5;
      }
      ctx.stroke();

      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = isCleared ? '#00e676' : (isActive ? '#ffb300' : '#4b5563');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cp.label, 0, 0);

      ctx.restore();
    });

    // 5. Draw Quadcopter Drone
    this.drawDrone(this.drone.x, this.drone.y, this.drone.altitude, this.drone.rotorAngle);

    // 6. On-canvas Digital Telemetry Overlay
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.fillRect(520, 20, 170, 52);
    ctx.strokeRect(520, 20, 170, 52);

    ctx.fillStyle = allGatesCleared ? '#00e676' : '#ffb300';
    ctx.font = 'bold 13px monospace';
    const statusText = allGatesCleared ? 'TARGET: LAND PAD [H]' : `TARGET: GATE ${this.currentCpIdx + 1} / 4`;
    ctx.fillText(statusText, 532, 40);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`ALT: ${this.drone.altitude.toFixed(1)} M`, 532, 60);
    ctx.restore();
  }

  drawDrone(x, y, alt, rotorAngle) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Altitude drop shadow (grows further with altitude)
    const shadowDist = alt * 5;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.arc(shadowDist, shadowDist, 18 + alt, 0, Math.PI * 2);
    ctx.fill();

    // 4 Carbon Arms
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-24, -24);
    ctx.lineTo(24, 24);
    ctx.moveTo(-24, 24);
    ctx.lineTo(24, -24);
    ctx.stroke();

    // Fuselage Central Body (Technical Carbon)
    ctx.fillStyle = '#111827';
    ctx.fillRect(-14, -14, 28, 28);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-14, -14, 28, 28);

    // FPV Camera lens (front facing green dot)
    ctx.fillStyle = '#00e676';
    ctx.beginPath();
    ctx.arc(0, -12, 4, 0, Math.PI * 2);
    ctx.fill();

    // Battery / Avionics Bay
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-4, -6, 8, 12);

    // 4 Motors & Propellers
    const motorPos = [
      { x: -24, y: -24 },
      { x: 24, y: -24 },
      { x: -24, y: 24 },
      { x: 24, y: 24 }
    ];

    motorPos.forEach((m, idx) => {
      // Motor mount
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(m.x, m.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Spinning propeller blur disk
      ctx.fillStyle = 'rgba(209, 213, 219, 0.55)';
      ctx.beginPath();
      ctx.arc(m.x, m.y, 16, 0, Math.PI * 2);
      ctx.fill();

      // Propeller line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(rotorAngle * (idx % 2 === 0 ? 1 : -1));
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(16, 0);
      ctx.stroke();
      ctx.restore();
    });

    // Floating Altitude tag above drone
    ctx.save();
    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${alt.toFixed(1)}m`, 0, -32);
    ctx.restore();

    ctx.restore();
  }

  retry() {
    this.startFlight();
  }

  destroy() {
    if (this.boundKeyDown) window.removeEventListener('keydown', this.boundKeyDown);
    if (this.boundKeyUp) window.removeEventListener('keyup', this.boundKeyUp);
    this.stopFlight();
    this.container.innerHTML = '';
  }
}
