/**
 * PROJECT ZERO — Challenge 5: CAD Assembly Workshop (2D)
 * SolidWorks-inspired 2D mechanical CAD schematic with component mating constraints,
 * datum axis alignment, snap-to-position mechanics, and animated gear-mesh rotation.
 */

import { audio } from '../audio.js';
import { gameState } from '../gameState.js';

export class CadGame2D {
  constructor(container, ui, onVictory) {
    this.container = container;
    this.ui = ui;
    this.onVictory = onVictory;

    this.isComplete = false;
    this.selectedPartId = null;
    this.gearRotation = 0;

    // 4 Precision components
    this.parts = {
      shaft:   { id: 'shaft',   name: 'Drive Shaft',      assembled: false, socketX: 380, socketY: 170 },
      bearing: { id: 'bearing', name: 'Ball Bearing',     assembled: false, socketX: 280, socketY: 170 },
      gear:    { id: 'gear',    name: 'Spur Gear',        assembled: false, socketX: 480, socketY: 170 },
      bracket: { id: 'bracket', name: 'Mounting Bracket', assembled: false, socketX: 180, socketY: 170 }
    };

    this.initDOM();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="cad-room-box">
        <div class="cad-canvas-container">
          <canvas id="cad-canvas" width="760" height="340"></canvas>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#cad-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Click canvas to mate selected part
    this.canvas.addEventListener('click', () => {
      if (this.selectedPartId) {
        this.assembleSelectedPart();
      }
    });

    this.renderCAD();
  }

  selectPart(partId) {
    if (this.isComplete) return;
    this.selectedPartId = partId;
    audio.playClick();
    this.ui.updateCadSelectedPart(partId);
    this.renderCAD();
  }

  assembleSelectedPart(partId = this.selectedPartId) {
    if (!partId || this.isComplete) return;
    const part = this.parts[partId];
    if (!part || part.assembled) return;

    // SolidWorks Constraint: Shaft must be installed into housing first!
    if (partId !== 'shaft' && !this.parts['shaft'].assembled) {
      this.ui.showToast('MATE CONSTRAINT // DRIVE SHAFT MUST BE INSTALLED FIRST', 'warning');
      return;
    }

    // Snap part into place
    part.assembled = true;
    audio.playCadSnap();

    this.selectedPartId = null;
    this.ui.updateCadChecklist(this.parts);
    this.renderCAD();

    // Check if entire mechanism is assembled
    const allDone = Object.values(this.parts).every(p => p.assembled);
    if (allDone) {
      this.completeAssembly();
    }
  }

  completeAssembly() {
    this.isComplete = true;
    audio.playFanfare(false);

    this.ui.showToast('ASSEMBLY VERIFIED // GEAR TRAIN FUNCTIONAL', 'success');
    gameState.completeChallenge('cad');

    setTimeout(() => {
      if (this.onVictory) this.onVictory();
    }, 2200);
  }

  update(delta) {
    if (this.isComplete) {
      this.gearRotation += 3.5 * delta;
      this.renderCAD();
    }
  }

  renderCAD() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 760, 340);

    // 1. Engineering Blueprint Dark Blue Background
    ctx.fillStyle = '#0a101d';
    ctx.fillRect(0, 0, 760, 340);

    // CAD Grid Lines
    ctx.strokeStyle = '#152138';
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

    // Title Block Header
    ctx.font = '10px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('SOLIDWORKS 2D MATE SCHEMATIC // DATUM CL-01', 30, 30);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 15, 720, 310);

    // 2. Cast Housing / Base Pedestal
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.fillRect(140, 230, 480, 40);
    ctx.strokeRect(140, 230, 480, 40);

    // Left Bearing Pedestal & Right Bearing Pedestal
    ctx.fillRect(240, 140, 60, 90);
    ctx.strokeRect(240, 140, 60, 90);
    ctx.fillRect(460, 140, 60, 90);
    ctx.strokeRect(460, 140, 60, 90);

    // Centerline Datum Axis (Dashed Cyan)
    ctx.strokeStyle = '#00e676';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(100, 170);
    ctx.lineTo(660, 170);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Highlight Target Sockets if part selected
    if (this.selectedPartId && !this.parts[this.selectedPartId].assembled) {
      const p = this.parts[this.selectedPartId];
      ctx.save();
      ctx.strokeStyle = '#00e676';
      ctx.fillStyle = 'rgba(0, 230, 118, 0.15)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.arc(p.socketX, p.socketY, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '11px monospace';
      ctx.fillStyle = '#00e676';
      ctx.textAlign = 'center';
      ctx.fillText(`MATE DATUM: ${p.name.toUpperCase()}`, p.socketX, p.socketY - 45);
      ctx.restore();
    }

    // 4. Render Components (Assembled vs In Tray)

    // Component 1: Drive Shaft (Precision steel shaft)
    if (this.parts.shaft.assembled) {
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.fillRect(160, 160, 440, 20);
      ctx.strokeRect(160, 160, 440, 20);
      // Keyway groove
      ctx.fillStyle = '#0a101d';
      ctx.fillRect(470, 162, 20, 4);
    }

    // Component 2: Ball Bearing (Deep groove bearing)
    if (this.parts.bearing.assembled) {
      ctx.save();
      ctx.translate(270, 170);
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0a101d';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      // Chrome balls
      ctx.fillStyle = '#f8fafc';
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 20, Math.sin(a) * 20, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Component 3: Spur Gear (with teeth)
    if (this.parts.gear.assembled) {
      ctx.save();
      ctx.translate(480, 170);
      ctx.rotate(this.gearRotation);

      ctx.fillStyle = '#d97706'; // brass/bronze gear
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;

      // Gear teeth
      const teeth = 16;
      for (let i = 0; i < teeth; i++) {
        const a = (i * Math.PI * 2) / teeth;
        ctx.fillRect(Math.cos(a) * 44 - 4, Math.sin(a) * 44 - 4, 8, 8);
      }

      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Bore
      ctx.fillStyle = '#0a101d';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Component 4: Mounting Bracket (Retaining Flange)
    if (this.parts.bracket.assembled) {
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 2;
      ctx.fillRect(170, 130, 20, 80);
      ctx.strokeRect(170, 130, 20, 80);

      // Bolts
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(175, 140, 10, 8);
      ctx.fillRect(175, 192, 10, 8);
    }
  }

  reset() {
    this.isComplete = false;
    this.selectedPartId = null;
    this.gearRotation = 0;
    Object.values(this.parts).forEach(p => p.assembled = false);
    this.ui.updateCadChecklist(this.parts);
    this.renderCAD();
  }

  destroy() {
    this.container.innerHTML = '';
  }
}
