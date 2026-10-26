/**
 * PROJECT ZERO — Challenge 2: Kart-X Racing Trial (2D Canvas)
 * High-visibility arcade racing with pre-race briefing, 3-2-1 countdown,
 * "YOU" indicator, track flow arrows, real-time minimap, and touch-first mobile controls.
 */

import { audio } from '../audio.js';
import { gameState } from '../gameState.js';

export class RacingGame2D {
  constructor(container, ui, onVictory) {
    this.container = container;
    this.ui = ui;
    this.onVictory = onVictory;

    this.isActive = false;
    this.isCountingDown = false;
    this.isRaceOver = false;
    this.countdownTimer = 3;

    this.input = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: false
    };

    // Track path definition
    this.trackPoints = [
      { x: 400, y: 520 }, // 0: Start / Finish Line
      { x: 620, y: 520 }, // 1: Turn 1 Entry
      { x: 710, y: 440 }, // 2: Turn 1 Apex
      { x: 710, y: 220 }, // 3: Right Straight
      { x: 620, y: 130 }, // 4: Turn 2 Entry
      { x: 400, y: 130 }, // 5: Top Straight
      { x: 200, y: 130 }, // 6: Turn 3 Entry
      { x: 100, y: 220 }, // 7: Turn 3 Apex
      { x: 100, y: 380 }, // 8: Left Straight
      { x: 190, y: 480 }, // 9: Chicane
      { x: 280, y: 480 }, // 10: Chicane Exit
      { x: 330, y: 520 }  // 11: Final Straight to Line
    ];

    this.initDOM();
    this.initKarts();
    this.setupControls();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="racing-room-box">
        <!-- Interactive Canvas Area -->
        <div class="racing-canvas-wrapper">
          <canvas id="racing-canvas" width="800" height="600"></canvas>

          <!-- Pre-Race Briefing Modal -->
          <div id="race-briefing-modal" class="race-briefing-overlay">
            <div class="briefing-card">
              <div class="briefing-tag">CHALLENGE 02 // DYNAMICS &amp; TRACTION</div>
              <h2 class="briefing-title">🏎️ KART-X RACING TRIAL</h2>
              
              <div class="briefing-goal">
                <div class="briefing-win-rule">
                  <span class="win-rule-badge">WIN CONDITION 1</span>
                  <b>🏁 BEAT THE KARTS:</b> Finish in <b>1ST PLACE (P1)</b> ahead of the AI opponents!
                </div>
                <div class="briefing-win-divider">— OR —</div>
                <div class="briefing-win-rule">
                  <span class="win-rule-badge alt">WIN CONDITION 2</span>
                  <b>⏱️ ENDURANCE:</b> Complete <b>3 FULL LAPS</b> around the circuit!
                </div>
              </div>

              <div class="briefing-controls-grid">
                <div class="control-col">
                  <div class="control-lbl">💻 DESKTOP CONTROLS</div>
                  <div class="key-pill"><b>[W]</b> or <b>[↑]</b> Accelerate (Gas)</div>
                  <div class="key-pill"><b>[A] / [D]</b> or <b>[←] / [→]</b> Steer</div>
                  <div class="key-pill"><b>[S]</b> or <b>[SPACE]</b> Brake</div>
                </div>

                <div class="control-col">
                  <div class="control-lbl">📱 MOBILE CONTROLS</div>
                  <div class="key-pill">Left Thumb: <b>◀ LEFT / RIGHT ▶</b></div>
                  <div class="key-pill">Right Thumb: <b>🟢 GAS</b> &amp; <b>🔴 BRAKE</b></div>
                  <div class="key-pill">Hold button down to steer / drive</div>
                </div>
              </div>

              <button id="btn-start-countdown" class="tech-btn primary btn-start-race">
                🏁 START RACE (3-2-1)
              </button>
            </div>
          </div>

          <!-- 3-2-1 Countdown Overlay -->
          <div id="race-countdown-overlay" class="race-countdown-overlay hidden">
            <div id="countdown-text" class="countdown-text">3</div>
          </div>

          <!-- On-screen Desktop Controls Badge -->
          <div class="desktop-controls-hint">
            <span>[W] GAS</span>
            <span>[A] [D] STEER</span>
            <span>[SPACE] BRAKE</span>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#racing-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.briefingModal = this.container.querySelector('#race-briefing-modal');
    this.countdownOverlay = this.container.querySelector('#race-countdown-overlay');
    this.countdownText = this.container.querySelector('#countdown-text');
    this.btnStartRace = this.container.querySelector('#btn-start-countdown');

    this.particles = [];

    this.btnStartRace.addEventListener('click', () => {
      this.beginCountdown();
    });
  }

  initKarts() {
    // Player Kart (Lime Green #01)
    this.player = {
      x: 370,
      y: 520,
      angle: 0,
      speed: 0,
      maxSpeed: 7.2,
      accel: 0.2,
      drag: 0.05,
      steerSpeed: 0.055,
      lapProgress: 0,
      lapCount: 0,
      halfwayPassed: false,
      color: '#00e676',
      number: '01'
    };

    // AI Kart 1 (Cobalt Blue #02)
    this.ai1 = {
      x: 350,
      y: 505,
      angle: 0,
      speed: 5.4,
      wpIdx: 1,
      lapCount: 0,
      color: '#2979ff',
      number: '02'
    };

    // AI Kart 2 (Hazard Orange #03)
    this.ai2 = {
      x: 330,
      y: 535,
      angle: 0,
      speed: 5.6,
      wpIdx: 1,
      lapCount: 0,
      color: '#ff9100',
      number: '03'
    };

    this.render();
  }

  setupControls() {
    window.addEventListener('keydown', (e) => {
      if (!this.isActive) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { this.input.forward = true; e.preventDefault(); }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { this.input.backward = true; e.preventDefault(); }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { this.input.left = true; e.preventDefault(); }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { this.input.right = true; e.preventDefault(); }
      if (e.key === ' ') { this.input.brake = true; e.preventDefault(); }
    });

    window.addEventListener('keyup', (e) => {
      if (!this.isActive) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.input.forward = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.input.backward = false;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.input.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.input.right = false;
      if (e.key === ' ') this.input.brake = false;
    });
  }

  beginCountdown() {
    this.briefingModal.classList.add('hidden');
    this.countdownOverlay.classList.remove('hidden');
    this.isCountingDown = true;
    this.isRaceOver = false;

    // Reset grid positions cleanly
    this.player.x = 370;
    this.player.y = 520;
    this.player.angle = 0;
    this.player.speed = 0;
    this.player.lapCount = 0;
    this.player.lapProgress = 0;
    this.player.halfwayPassed = false;

    this.ai1.x = 350;
    this.ai1.y = 505;
    this.ai1.angle = 0;
    this.ai1.wpIdx = 1;
    this.ai1.lapCount = 0;

    this.ai2.x = 330;
    this.ai2.y = 535;
    this.ai2.angle = 0;
    this.ai2.wpIdx = 1;
    this.ai2.lapCount = 0;

    this.render();

    let count = 3;
    this.countdownText.textContent = count;
    this.countdownText.style.color = '#ffb300';
    audio.playClick();

    if (this.countdownInterval) clearInterval(this.countdownInterval);

    this.countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        this.countdownText.textContent = count;
        audio.playClick();
      } else if (count === 0) {
        this.countdownText.textContent = 'GO!';
        this.countdownText.style.color = '#00e676';
        audio.playRaceStart();
      } else {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        this.countdownOverlay.classList.add('hidden');
        this.isCountingDown = false;
        this.startRace();
      }
    }, 800);
  }

  startRace() {
    this.isActive = true;
    this.isRaceOver = false;
    this.player.x = 370;
    this.player.y = 520;
    this.player.angle = 0;
    this.player.speed = 0;
    this.player.lapCount = 0;
    this.player.lapProgress = 0;
    this.player.halfwayPassed = false;

    this.ai1.x = 350;
    this.ai1.y = 505;
    this.ai1.angle = 0;
    this.ai1.wpIdx = 1;
    this.ai1.lapCount = 0;

    this.ai2.x = 330;
    this.ai2.y = 535;
    this.ai2.angle = 0;
    this.ai2.wpIdx = 1;
    this.ai2.lapCount = 0;

    this.ui.updateRacingHUD(1, 3, 0, 1, 3);
    audio.startKartEngine();
  }

  stopRace() {
    this.isActive = false;
    audio.stopKartEngine();
  }

  update(delta) {
    if (!this.isActive || this.isRaceOver) {
      this.render();
      return;
    }

    // 1. Player Kart Physics
    if (this.input.forward) {
      this.player.speed = Math.min(this.player.maxSpeed, this.player.speed + this.player.accel);
    } else if (this.input.backward) {
      this.player.speed = Math.max(-2.5, this.player.speed - this.player.accel);
    } else {
      if (this.player.speed > 0) this.player.speed = Math.max(0, this.player.speed - this.player.drag);
      else if (this.player.speed < 0) this.player.speed = Math.min(0, this.player.speed + this.player.drag);
    }

    if (this.input.brake && this.player.speed > 0) {
      this.player.speed = Math.max(0, this.player.speed - 0.35);
    }

    // Steering
    const dir = this.player.speed >= 0 ? 1 : -1;
    if (this.input.left) this.player.angle -= this.player.steerSpeed * dir;
    if (this.input.right) this.player.angle += this.player.steerSpeed * dir;

    // Velocity update
    this.player.x += Math.cos(this.player.angle) * this.player.speed;
    this.player.y += Math.sin(this.player.angle) * this.player.speed;

    // Keep on track boundaries
    this.player.x = Math.max(40, Math.min(760, this.player.x));
    this.player.y = Math.max(40, Math.min(560, this.player.y));

    // Audio pitch
    const rpmRatio = Math.abs(this.player.speed) / this.player.maxSpeed;
    audio.updateKartEngine(rpmRatio);

    // Tire smoke particles when turning fast
    if (Math.abs(this.player.speed) > 4.5 && (this.input.left || this.input.right)) {
      this.particles.push({
        x: this.player.x - Math.cos(this.player.angle) * 12,
        y: this.player.y - Math.sin(this.player.angle) * 12,
        radius: 4,
        alpha: 0.6
      });
    }

    // 2. Update AI Karts
    this.updateAIKart(this.ai1);
    this.updateAIKart(this.ai2);

    // 3. Lap Progression & Race Position
    this.checkLapProgression();

    // 4. Render
    this.render();
  }

  updateAIKart(ai) {
    const targetWp = this.trackPoints[ai.wpIdx];
    const dx = targetWp.x - ai.x;
    const dy = targetWp.y - ai.y;
    const targetAngle = Math.atan2(dy, dx);

    let angleDiff = targetAngle - ai.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    ai.angle += angleDiff * 0.08;

    ai.x += Math.cos(ai.angle) * ai.speed;
    ai.y += Math.sin(ai.angle) * ai.speed;

    const distToWp = Math.hypot(dx, dy);
    if (distToWp < 40) {
      ai.wpIdx = (ai.wpIdx + 1) % this.trackPoints.length;
      if (ai.wpIdx === 0) {
        ai.lapCount++;
      }
    }
  }

  calculatePosition() {
    const playerProgress = this.player.lapCount * 12 + this.player.lapProgress;
    const ai1Progress = this.ai1.lapCount * 12 + this.ai1.wpIdx;
    const ai2Progress = this.ai2.lapCount * 12 + this.ai2.wpIdx;

    let pos = 1;
    if (ai1Progress > playerProgress) pos++;
    if (ai2Progress > playerProgress) pos++;
    return pos;
  }

  checkLapProgression() {
    let closestDist = Infinity;
    let closestIdx = 0;
    this.trackPoints.forEach((wp, idx) => {
      const d = Math.hypot(this.player.x - wp.x, this.player.y - wp.y);
      if (d < closestDist) {
        closestDist = d;
        closestIdx = idx;
      }
    });

    const prevIdx = this.player.lapProgress;
    this.player.lapProgress = closestIdx;

    // Track halfway point (waypoints 4..8) to avoid reverse cheating
    if (closestIdx >= 4 && closestIdx <= 8) {
      this.player.halfwayPassed = true;
    }

    // Crossing finish line from final sector to start line with halfway verified
    if (this.player.halfwayPassed && prevIdx >= this.trackPoints.length - 2 && (closestIdx === 0 || closestIdx === 1)) {
      this.player.lapCount++;
      this.player.halfwayPassed = false;

      const currentPos = this.calculatePosition();

      // WIN CONDITION 1: Win against other karts (crosses finish line in 1st place)
      if (currentPos === 1) {
        this.finishRace(true, '🏆 P1 VICTORY! YOU BEAT THE OTHER KARTS!');
        return;
      }

      // WIN CONDITION 2: Complete 3 full laps around the circuit
      if (this.player.lapCount >= 3) {
        const posText = currentPos === 2 ? 'P2' : 'P3';
        this.finishRace(true, `🏆 3 LAPS COMPLETED // ENDURANCE TRIAL PASSED (${posText})!`);
        return;
      }

      // Neither condition met yet: Lap completed, continue race!
      audio.playClick();
      const posText = currentPos === 2 ? 'P2' : 'P3';
      this.ui.showToast(`🏁 LAP ${this.player.lapCount} / 3 COMPLETED // ${posText} — OVERTAKE FOR P1 OR COMPLETE 3 LAPS!`, 'info');
    }

    // Real-time HUD update
    const pos = this.calculatePosition();
    const currentDisplayLap = Math.min(this.player.lapCount + 1, 3);
    this.ui.updateRacingHUD(pos, 3, Math.round(this.player.speed * 18), currentDisplayLap, 3);
  }

  finishRace(isVictory, message) {
    if (this.isRaceOver) return;
    this.isRaceOver = true;
    this.isActive = false;
    audio.stopKartEngine();

    if (isVictory) {
      audio.playFanfare(false);
      this.ui.showToast(message, 'success');
      gameState.completeChallenge('racing');
      setTimeout(() => {
        if (this.onVictory) this.onVictory();
      }, 1800);
    } else {
      this.ui.showToast('TRY AGAIN — BEAT THE OTHER KARTS OR COMPLETE 3 LAPS!', 'warning');
      setTimeout(() => {
        this.retry();
      }, 2000);
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 800, 600);

    // 1. Dark Asphalt Background
    ctx.fillStyle = '#0f141c';
    ctx.fillRect(0, 0, 800, 600);

    // Grid Floor
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

    // 2. Track Ribbon
    ctx.beginPath();
    this.trackPoints.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();

    // Red & White Kerbs Outer
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 84;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Asphalt surface
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 68;
    ctx.stroke();

    // Track centerline dashed
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 12]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Glowing Track Flow Direction Chevrons
    const arrowSegments = [1, 3, 5, 7, 9, 11];
    arrowSegments.forEach(idx => {
      const p = this.trackPoints[idx];
      const nextP = this.trackPoints[(idx + 1) % this.trackPoints.length];
      const ang = Math.atan2(nextP.y - p.y, nextP.x - p.x);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(ang);
      ctx.strokeStyle = 'rgba(0, 230, 118, 0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-10, -8);
      ctx.lineTo(4, 0);
      ctx.lineTo(-10, 8);
      ctx.stroke();
      ctx.restore();
    });

    // 4. Start / Finish Line Checkered
    ctx.save();
    ctx.translate(400, 520);
    ctx.rotate(Math.PI / 2);
    for (let i = -34; i < 34; i += 10) {
      for (let j = -6; j < 6; j += 6) {
        ctx.fillStyle = (i / 10 + j / 6) % 2 === 0 ? '#ffffff' : '#111827';
        ctx.fillRect(i, j, 10, 6);
      }
    }
    ctx.restore();

    // 5. Tire smoke particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.radius += 0.25;
      p.alpha -= 0.02;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Draw AI Karts
    this.drawKart(this.ai1.x, this.ai1.y, this.ai1.angle, this.ai1.color, '02', 'ALPHA');
    this.drawKart(this.ai2.x, this.ai2.y, this.ai2.angle, this.ai2.color, '03', 'BETA');

    // 7. Draw Player Kart with Headlights & "YOU" Marker
    this.drawPlayerKart(this.player.x, this.player.y, this.player.angle);

    // 8. Mini-radar in top-right corner
    this.drawMinimap();

    // 9. On-canvas Digital Telemetry (POS & LAP)
    const pos = this.calculatePosition();
    const suffix = pos === 1 ? 'ST' : pos === 2 ? 'ND' : 'RD';
    const currentLapDisplay = Math.min(this.player.lapCount + 1, 3);

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.fillRect(520, 20, 150, 48);
    ctx.strokeRect(520, 20, 150, 48);

    ctx.fillStyle = pos === 1 ? '#00e676' : '#38bdf8';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`POS: ${pos}${suffix} / 3`, 532, 40);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`LAP ${currentLapDisplay} / 3`, 532, 58);
    ctx.restore();
  }

  drawPlayerKart(x, y, angle) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Headlights Beam Projection
    ctx.save();
    ctx.rotate(angle);
    const grad = ctx.createRadialGradient(25, 0, 5, 75, 0, 35);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(15, -6);
    ctx.lineTo(85, -28);
    ctx.lineTo(85, 28);
    ctx.lineTo(15, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Kart Body
    ctx.rotate(angle);
    // 4 Wheels
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-14, -14, 8, 5);
    ctx.fillRect(8, -14, 8, 5);
    ctx.fillRect(-14, 9, 8, 5);
    ctx.fillRect(8, 9, 8, 5);

    // Lime Green Chassis
    ctx.fillStyle = '#00e676';
    ctx.fillRect(-12, -9, 28, 18);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(-12, -9, 28, 18);

    // Nosecone
    ctx.fillStyle = '#111827';
    ctx.fillRect(16, -7, 6, 14);

    // Rear wing
    ctx.fillStyle = '#111827';
    ctx.fillRect(-16, -11, 4, 22);

    // Driver helmet (Gold/White)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Floating Animated "YOU" Indicator Arrow
    ctx.save();
    const bob = Math.sin(performance.now() * 0.006) * 3;
    ctx.translate(x, y - 28 + bob);
    ctx.fillStyle = '#00e676';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('▼ YOU', 0, 0);
    ctx.restore();
  }

  drawKart(x, y, angle, color, num, label) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Floating label
    ctx.save();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, 0, -20);
    ctx.restore();

    ctx.rotate(angle);
    // Wheels
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-14, -13, 8, 5);
    ctx.fillRect(8, -13, 8, 5);
    ctx.fillRect(-14, 8, 8, 5);
    ctx.fillRect(8, 8, 8, 5);

    // Chassis
    ctx.fillStyle = color;
    ctx.fillRect(-12, -8, 26, 16);

    // Nose
    ctx.fillStyle = '#111827';
    ctx.fillRect(14, -6, 6, 12);

    // Spoiler
    ctx.fillStyle = '#111827';
    ctx.fillRect(-15, -10, 4, 20);

    // Helmet
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawMinimap() {
    const ctx = this.ctx;
    const mx = 680;
    const my = 20;
    const mw = 100;
    const mh = 75;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeRect(mx, my, mw, mh);

    // Track path scaled
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    this.trackPoints.forEach((p, idx) => {
      const sx = mx + (p.x / 800) * mw;
      const sy = my + (p.y / 600) * mh;
      if (idx === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    });
    ctx.closePath();
    ctx.stroke();

    // AI 1 dot
    ctx.fillStyle = '#2979ff';
    ctx.beginPath();
    ctx.arc(mx + (this.ai1.x / 800) * mw, my + (this.ai1.y / 600) * mh, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // AI 2 dot
    ctx.fillStyle = '#ff9100';
    ctx.beginPath();
    ctx.arc(mx + (this.ai2.x / 800) * mw, my + (this.ai2.y / 600) * mh, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Player dot
    ctx.fillStyle = '#00e676';
    ctx.beginPath();
    ctx.arc(mx + (this.player.x / 800) * mw, my + (this.player.y / 600) * mh, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  retry() {
    this.stopRace();
    this.beginCountdown();
  }

  destroy() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.stopRace();
    this.container.innerHTML = '';
  }
}
