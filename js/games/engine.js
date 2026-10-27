/**
 * PROJECT ZERO — Challenge 4: Jet Engine Ignition (2D)
 * 2D Technical engineering cutaway diagram with component arrangement puzzle,
 * Brayton cycle diagnostics, rotor spinning, flame combustion, and thrust readout.
 */

import { audio } from '../audio.js';
import { gameState } from '../gameState.js';

export class EngineGame2D {
  constructor(container, ui, onVictory) {
    this.container = container;
    this.ui = ui;
    this.onVictory = onVictory;

    this.slots = [null, null, null, null];
    this.correctOrder = ['compressor', 'combustion', 'turbine', 'exhaust'];

    this.isIgnited = false;
    this.isSpooling = false;
    this.spoolRpm = 0; // 0..1
    this.thrustPercent = 0; // 0..100
    this.flameParticles = [];

    this.initDOM();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="engine-room-box">
        <!-- Simple Gate 4 Instructions Banner -->
        <div class="gate-guide-banner">
          <div class="gate-guide-header">
            <span class="gate-guide-badge">GATE 04</span>
            <span class="gate-guide-title">🔥 JET ENGINE IGNITION</span>
            <span class="gate-guide-target">BRAYTON CYCLE ASSEMBLY</span>
          </div>
          <div class="gate-guide-body">
            <div class="guide-step-item">
              <span class="step-num">1</span>
              <span><b>Install the 4 components in order:</b> 1. Compressor ➔ 2. Combustion Chamber ➔ 3. Turbine ➔ 4. Exhaust Nozzle.</span>
            </div>
            <div class="guide-step-item">
              <span class="step-num">2</span>
              <span><b>Tap a component chip</b> below, then tap a slot (or tap the engine stage on the blueprint directly).</span>
            </div>
            <div class="guide-step-item">
              <span class="step-num">3</span>
              <span>When all 4 stages are mounted, tap <b>INITIATE IGNITION</b> to spool up to 100% thrust!</span>
            </div>
          </div>
        </div>

        <div class="engine-canvas-container">
          <canvas id="engine-canvas" width="760" height="340"></canvas>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#engine-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Click canvas stages directly to mount or unmount components
    this.canvas.addEventListener('click', (e) => {
      if (this.isIgnited) return;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = 760 / rect.width;
      const scaleY = 340 / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      const stages = [
        { x: 120, w: 100 },
        { x: 260, w: 100 },
        { x: 400, w: 100 },
        { x: 540, w: 100 }
      ];

      stages.forEach((st, idx) => {
        if (clickX >= st.x && clickX <= st.x + st.w && clickY >= 100 && clickY <= 240) {
          if (this.ui && this.ui.selectedEngineComponent) {
            this.setSlot(idx, this.ui.selectedEngineComponent);
            const active = document.querySelector('.engine-chip.active');
            if (active) active.classList.remove('active');
            this.ui.selectedEngineComponent = null;
          } else if (this.slots[idx]) {
            this.clearSlot(idx);
          }
        }
      });
    });

    this.renderBlueprint();
  }

  setSlot(slotIndex, componentId) {
    if (this.isIgnited) return;

    // Remove component from any other slot first
    for (let i = 0; i < 4; i++) {
      if (this.slots[i] === componentId && i !== slotIndex) {
        this.slots[i] = null;
      }
    }

    this.slots[slotIndex] = componentId;
    audio.playClick();
    this.ui.updateEngineSlots(this.slots);
    this.renderBlueprint();
  }

  clearSlot(slotIndex) {
    if (this.isIgnited) return;
    this.slots[slotIndex] = null;
    audio.playClick();
    this.ui.updateEngineSlots(this.slots);
    this.renderBlueprint();
  }

  initiateIgnition() {
    if (this.isIgnited) return;

    // Check completeness
    if (this.slots.some(s => s === null)) {
      this.ui.showToast('INCOMPLETE ASSEMBLY // ALL 4 STAGES REQUIRED', 'warning');
      return;
    }

    // Verify thermodynamic sequence
    const isCorrect = this.slots.every((s, i) => s === this.correctOrder[i]);

    if (!isCorrect) {
      let diagnostic = 'THERMODYNAMIC FAULT // ';
      if (this.slots[0] !== 'compressor') {
        diagnostic += 'Stage 1 must be Compressor (intake pressure rise required).';
      } else if (this.slots[1] !== 'combustion') {
        diagnostic += 'Stage 2 must be Combustion Chamber (fuel injection & ignition).';
      } else if (this.slots[2] !== 'turbine') {
        diagnostic += 'Stage 3 must be Turbine (drives the compressor shaft).';
      } else {
        diagnostic += 'Stage 4 must be Exhaust Nozzle (thrust acceleration).';
      }
      this.ui.showToast(diagnostic, 'warning');
      return;
    }

    // Correct! Ignite engine
    this.isIgnited = true;
    this.isSpooling = true;
    audio.playEngineIgnition();
    this.ui.showToast('IGNITION COMMENCED // SPOOLING TURBINE', 'info');
  }

  update(delta) {
    if (this.isSpooling) {
      this.spoolRpm = Math.min(1.0, this.spoolRpm + delta * 0.45);
      this.thrustPercent = Math.min(100, this.spoolRpm * 100);

      this.ui.updateEngineThrust(this.thrustPercent);

      // Add exhaust fire particles
      if (this.spoolRpm > 0.3) {
        for (let i = 0; i < 4; i++) {
          this.flameParticles.push({
            x: 640,
            y: 170 + (Math.random() - 0.5) * 35,
            vx: 8 + Math.random() * 10,
            vy: (Math.random() - 0.5) * 3,
            radius: 4 + Math.random() * 6,
            life: 1.0,
            color: Math.random() > 0.4 ? '#38bdf8' : '#ff9100' // blue core + orange flame
          });
        }
      }

      // Check victory condition
      if (this.thrustPercent >= 100 && !this.victoryTriggered) {
        this.victoryTriggered = true;
        audio.playFanfare(false);
        this.ui.showToast('ENGINE ONLINE // MAX THRUST 120 kN REACHED', 'success');
        gameState.completeChallenge('engine');

        setTimeout(() => {
          if (this.onVictory) this.onVictory();
        }, 1800);
      }
    }

    // Update flame particles
    for (let i = this.flameParticles.length - 1; i >= 0; i--) {
      const p = this.flameParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.radius *= 0.95;
      p.life -= 0.04;
      if (p.life <= 0) {
        this.flameParticles.splice(i, 1);
      }
    }

    this.renderBlueprint();
  }

  renderBlueprint() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 760, 340);

    // 1. Technical Blueprint Grid Background
    ctx.fillStyle = '#0d131d';
    ctx.fillRect(0, 0, 760, 340);

    ctx.strokeStyle = '#182232';
    ctx.lineWidth = 1;
    for (let x = 0; x < 760; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 340);
      ctx.stroke();
    }
    for (let y = 0; y < 340; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(760, y);
      ctx.stroke();
    }

    // 2. Nacelle Cowling Outer Profile
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Top cowl curve
    ctx.moveTo(80, 100);
    ctx.lineTo(600, 100);
    ctx.lineTo(640, 130);
    // Bottom cowl curve
    ctx.moveTo(80, 240);
    ctx.lineTo(600, 240);
    ctx.lineTo(640, 210);
    ctx.stroke();

    // Central Drive Shaft
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(80, 166, 520, 8);

    // 3. Four Stage Slots on Blueprint
    const stages = [
      { name: '1. COMPRESSOR', x: 120, w: 100 },
      { name: '2. COMBUSTION', x: 260, w: 100 },
      { name: '3. TURBINE',    x: 400, w: 100 },
      { name: '4. NOZZLE',     x: 540, w: 100 }
    ];

    stages.forEach((st, idx) => {
      const compId = this.slots[idx];

      ctx.save();
      ctx.strokeStyle = compId ? '#00e676' : '#334155';
      ctx.fillStyle = compId ? 'rgba(0, 230, 118, 0.08)' : 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = compId ? 2 : 1;
      ctx.setLineDash(compId ? [] : [6, 4]);

      ctx.fillRect(st.x, 110, st.w, 120);
      ctx.strokeRect(st.x, 110, st.w, 120);
      ctx.setLineDash([]);

      // Stage label
      ctx.font = '10px monospace';
      ctx.fillStyle = compId ? '#00e676' : '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(st.name, st.x + st.w / 2, 95);

      // Render installed component graphics
      if (compId === 'compressor') {
        // Multi-stage bladed rotor discs
        ctx.fillStyle = '#38bdf8';
        for (let i = 0; i < 4; i++) {
          const h = 90 - i * 14;
          ctx.fillRect(st.x + 15 + i * 20, 170 - h / 2, 8, h);
        }
      } else if (compId === 'combustion') {
        // Burner liner with flame holes
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(st.x + 10, 125, st.w - 20, 90);
        ctx.fillStyle = '#0d131d';
        ctx.beginPath();
        ctx.arc(st.x + 30, 170, 10, 0, Math.PI * 2);
        ctx.arc(st.x + 70, 170, 10, 0, Math.PI * 2);
        ctx.fill();
      } else if (compId === 'turbine') {
        // High-pressure turbine discs
        ctx.fillStyle = '#e2e8f0';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(st.x + 20 + i * 25, 125, 10, 90);
        }
      } else if (compId === 'exhaust') {
        // Convergent / divergent nozzle cone
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(st.x + 5, 115);
        ctx.lineTo(st.x + st.w - 5, 135);
        ctx.lineTo(st.x + st.w - 5, 205);
        ctx.lineTo(st.x + 5, 225);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = '#475569';
        ctx.fillText('[ EMPTY ]', st.x + st.w / 2, 175);
      }

      ctx.restore();
    });

    // 4. Exhaust Flame Particles
    this.flameParticles.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  reset() {
    this.slots = [null, null, null, null];
    this.isIgnited = false;
    this.isSpooling = false;
    this.spoolRpm = 0;
    this.thrustPercent = 0;
    this.flameParticles = [];
    this.victoryTriggered = false;

    this.ui.updateEngineSlots(this.slots);
    this.ui.updateEngineThrust(0);
    this.renderBlueprint();
  }

  destroy() {
    this.container.innerHTML = '';
  }
}
