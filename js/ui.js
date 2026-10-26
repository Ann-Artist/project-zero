/**
 * PROJECT ZERO — UI Controller (2D)
 * Manages DOM overlays, HUD stats, mobile touch controls, toasts,
 * component selectors, and personalized birthday certificate modal.
 */

import { CONFIG } from './config.js';
import { gameState } from './gameState.js';
import { audio } from './audio.js';

export class UIController {
  constructor() {
    this.container = document.getElementById('ui-layer');

    this.cacheDOMElements();
    this.setupEventListeners();
    this.setupStateSubscriptions();

    this.onEnterFacility = null;
    this.onChessHint = null;
    this.onChessReset = null;
    this.onRacingRetry = null;
    this.onDroneReset = null;
    this.onEngineIgnite = null;
    this.onEngineSlotSelect = null;
    this.onCadPartSelect = null;
    this.onCadAssemble = null;
    this.onReplay = null;
  }

  cacheDOMElements() {
    // Header
    this.headerBar = document.getElementById('header-bar');
    this.roomTitleEl = document.getElementById('hud-room-title');
    this.objectiveEl = document.getElementById('hud-objective');
    this.scoreEl = document.getElementById('hud-score');
    this.timerEl = document.getElementById('hud-timer');
    this.soundToggleBtn = document.getElementById('btn-sound-toggle');
    this.soundIcon = document.getElementById('sound-icon');

    // Overlays
    this.screenOpening = document.getElementById('screen-opening');
    this.btnEnterFacility = document.getElementById('btn-enter-facility');
    this.toastContainer = document.getElementById('toast-container');

    // Game Specific HUDs
    this.hudChess = document.getElementById('hud-chess');
    this.chessMoveCountEl = document.getElementById('chess-move-count');
    this.btnChessHint = document.getElementById('btn-chess-hint');
    this.btnChessReset = document.getElementById('btn-chess-reset');

    this.hudRacing = document.getElementById('hud-racing');
    this.racingPosEl = document.getElementById('racing-position');
    this.racingLapEl = document.getElementById('racing-lap');
    this.racingSpeedEl = document.getElementById('racing-speed');
    this.btnRacingRetry = document.getElementById('btn-racing-retry');

    this.hudDrone = document.getElementById('hud-drone');
    this.droneCpEl = document.getElementById('drone-checkpoint-count');
    this.droneAltEl = document.getElementById('drone-altitude');
    this.btnDroneReset = document.getElementById('btn-drone-reset');

    this.hudEngine = document.getElementById('hud-engine');
    this.engineThrustBar = document.getElementById('engine-thrust-bar');
    this.engineThrustVal = document.getElementById('engine-thrust-val');
    this.btnEngineIgnite = document.getElementById('btn-engine-ignite');
    this.engineSlotsContainer = document.getElementById('engine-slots');
    this.engineTrayContainer = document.getElementById('engine-tray');

    this.hudCad = document.getElementById('hud-cad');
    this.cadPartsContainer = document.getElementById('cad-parts-tray');
    this.btnCadAssemble = document.getElementById('btn-cad-assemble');

    // Final Certificate & Victory Overlay
    this.screenReward = document.getElementById('screen-reward');
    this.certRecipientName = document.getElementById('cert-recipient-name');
    this.certScoreBreakdown = document.getElementById('cert-score-breakdown');
    this.certTotalScore = document.getElementById('cert-total-score');
    this.certTotalTime = document.getElementById('cert-total-time');
    this.btnReplay = document.getElementById('btn-replay');
    this.btnToggleCertView = document.getElementById('btn-toggle-cert-view');
  }

  setupEventListeners() {
    // Sound Toggle
    this.soundToggleBtn.addEventListener('click', () => {
      const isMuted = !gameState.soundEnabled;
      gameState.setSoundEnabled(isMuted);
      audio.ensureContext();
      audio.playClick();
    });

    // Enter Facility Button
    this.btnEnterFacility.addEventListener('click', () => {
      audio.init();
      audio.startAmbience();
      audio.playClick();
      if (this.onEnterFacility) this.onEnterFacility();
    });

    // Chess Controls
    this.btnChessHint.addEventListener('click', () => {
      audio.playClick();
      if (this.onChessHint) this.onChessHint();
    });
    this.btnChessReset.addEventListener('click', () => {
      audio.playClick();
      if (this.onChessReset) this.onChessReset();
    });

    // Racing Controls
    this.btnRacingRetry.addEventListener('click', () => {
      audio.playClick();
      if (this.onRacingRetry) this.onRacingRetry();
    });

    // Drone Controls
    this.btnDroneReset.addEventListener('click', () => {
      audio.playClick();
      if (this.onDroneReset) this.onDroneReset();
    });

    // Engine Controls
    this.btnEngineIgnite.addEventListener('click', () => {
      if (this.onEngineIgnite) this.onEngineIgnite();
    });

    // CAD Controls
    this.btnCadAssemble.addEventListener('click', () => {
      if (this.onCadAssemble) this.onCadAssemble();
    });

    // Replay
    this.btnReplay.addEventListener('click', () => {
      audio.playClick();
      if (this.onReplay) this.onReplay();
    });

    // Toggle full certificate mode
    this.btnToggleCertView.addEventListener('click', () => {
      this.screenReward.classList.toggle('certificate-fullscreen-mode');
    });

    this.setupMobileTouchControls();
  }

  setupMobileTouchControls() {
    const bindTouch = (elemId, onPress, onRelease) => {
      const el = document.getElementById(elemId);
      if (!el) return;
      const down = (e) => {
        e.preventDefault();
        if (el.setPointerCapture && e.pointerId !== undefined) {
          try { el.setPointerCapture(e.pointerId); } catch (_) {}
        }
        onPress();
      };
      const up = (e) => {
        e.preventDefault();
        if (el.releasePointerCapture && e.pointerId !== undefined) {
          try { el.releasePointerCapture(e.pointerId); } catch (_) {}
        }
        onRelease();
      };
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    };

    // Racing Touch
    bindTouch('btn-kart-left',  () => { if (this.racingInput) this.racingInput.left = true; },  () => { if (this.racingInput) this.racingInput.left = false; });
    bindTouch('btn-kart-right', () => { if (this.racingInput) this.racingInput.right = true; }, () => { if (this.racingInput) this.racingInput.right = false; });
    bindTouch('btn-kart-gas',   () => { if (this.racingInput) this.racingInput.forward = true; }, () => { if (this.racingInput) this.racingInput.forward = false; });
    bindTouch('btn-kart-brake', () => { if (this.racingInput) this.racingInput.brake = true; },   () => { if (this.racingInput) this.racingInput.brake = false; });

    // Drone Touch
    bindTouch('btn-drone-up',    () => { if (this.droneInput) this.droneInput.up = true; },       () => { if (this.droneInput) this.droneInput.up = false; });
    bindTouch('btn-drone-down',  () => { if (this.droneInput) this.droneInput.down = true; },     () => { if (this.droneInput) this.droneInput.down = false; });
    bindTouch('btn-drone-fwd',   () => { if (this.droneInput) this.droneInput.forward = true; },  () => { if (this.droneInput) this.droneInput.forward = false; });
    bindTouch('btn-drone-back',  () => { if (this.droneInput) this.droneInput.backward = true; }, () => { if (this.droneInput) this.droneInput.backward = false; });
    bindTouch('btn-drone-left',  () => { if (this.droneInput) this.droneInput.left = true; },     () => { if (this.droneInput) this.droneInput.left = false; });
    bindTouch('btn-drone-right', () => { if (this.droneInput) this.droneInput.right = true; },    () => { if (this.droneInput) this.droneInput.right = false; });
  }

  setupStateSubscriptions() {
    gameState.subscribe((event, data) => {
      if (event === 'sound') {
        this.updateSoundIcon(data);
      } else if (event === 'roomChange') {
        this.updateActiveRoomUI(data);
      } else if (event === 'challengeComplete') {
        this.scoreEl.textContent = gameState.scores.total.toString().padStart(5, '0');
      }
    });

    this.updateSoundIcon(gameState.soundEnabled);
  }

  updateSoundIcon(enabled) {
    if (enabled) {
      this.soundIcon.textContent = '🔊';
      this.soundToggleBtn.setAttribute('title', 'Mute Sound');
      this.soundToggleBtn.classList.remove('muted');
    } else {
      this.soundIcon.textContent = '🔇';
      this.soundToggleBtn.setAttribute('title', 'Unmute Sound');
      this.soundToggleBtn.classList.add('muted');
    }
  }

  updateActiveRoomUI(roomIndex) {
    this.hudChess.classList.add('hidden');
    this.hudRacing.classList.add('hidden');
    this.hudDrone.classList.add('hidden');
    this.hudEngine.classList.add('hidden');
    this.hudCad.classList.add('hidden');
    this.screenOpening.classList.add('hidden');
    this.screenReward.classList.add('hidden');

    const roomInfo = CONFIG.rooms[roomIndex];
    if (roomInfo) {
      this.roomTitleEl.textContent = `ROOM 0${roomIndex} // ${roomInfo.name}`;
      this.headerBar.classList.remove('hidden');
    }

    if (roomIndex === 0) {
      this.screenOpening.classList.remove('hidden');
      this.objectiveEl.textContent = 'OBJECTIVE: ENTER FACILITY';
    } else if (roomIndex === 1) {
      this.hudChess.classList.remove('hidden');
      this.objectiveEl.textContent = 'OBJECTIVE: FORCE CHECKMATE IN 3 MOVES';
      this.updateChessMoves(0, 3);
    } else if (roomIndex === 2) {
      this.hudRacing.classList.remove('hidden');
      this.objectiveEl.textContent = 'OBJECTIVE: WIN IN P1 OR COMPLETE 3 LAPS';
      this.updateRacingHUD(1, 3, 0, 1, 3);
    } else if (roomIndex === 3) {
      this.hudDrone.classList.remove('hidden');
      this.objectiveEl.textContent = 'OBJECTIVE: PASS ALL CHECKPOINTS AND LAND SAFELY';
      this.updateDroneHUD(0, 4, 0.4, false);
    } else if (roomIndex === 4) {
      this.hudEngine.classList.remove('hidden');
      this.objectiveEl.textContent = 'OBJECTIVE: RESTORE ENGINE OPERATION';
      this.updateEngineSlots([null, null, null, null]);
    } else if (roomIndex === 5) {
      this.hudCad.classList.remove('hidden');
      this.objectiveEl.textContent = 'OBJECTIVE: COMPLETE THE ASSEMBLY';
    } else if (roomIndex === 6) {
      this.screenReward.classList.remove('hidden');
      this.objectiveEl.textContent = 'FINAL STATUS: ENGINEER UNLOCKED';
      this.renderCertificate();
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-indicator"></span><span>${message}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('toast-show'), 10);
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  }

  updateChessMoves(current, target) {
    this.chessMoveCountEl.textContent = `MOVE ${current} / ${target}`;
  }

  updateRacingHUD(pos, totalKarts, speedKmh, currentLap = 1, totalLaps = 3) {
    const suffix = pos === 1 ? 'ST' : pos === 2 ? 'ND' : 'RD';
    if (this.racingPosEl) this.racingPosEl.textContent = `${pos}${suffix} / ${totalKarts}`;
    if (this.racingLapEl) this.racingLapEl.textContent = `LAP ${Math.min(currentLap, totalLaps)} / ${totalLaps}`;
    if (this.racingSpeedEl) this.racingSpeedEl.textContent = `${speedKmh} KM/H`;
  }

  updateDroneHUD(cleared, total, altitude, allCleared) {
    this.droneCpEl.textContent = allCleared ? 'LANDING ACTIVE' : `GATE ${cleared + 1} / ${total}`;
    this.droneAltEl.textContent = `ALT: ${altitude.toFixed(1)} M`;
  }

  setupEngineUI(onSlotSelect, onIgnite) {
    this.onEngineSlotSelect = onSlotSelect;
    this.onEngineIgnite = onIgnite;

    const components = [
      { id: 'compressor', label: '1. Compressor' },
      { id: 'combustion', label: '2. Combustion Chamber' },
      { id: 'turbine',    label: '3. Turbine' },
      { id: 'exhaust',    label: '4. Exhaust Nozzle' }
    ];

    this.engineTrayContainer.innerHTML = '';
    components.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'engine-chip';
      btn.textContent = c.label;
      btn.dataset.componentId = c.id;
      btn.addEventListener('click', () => {
        const currentlySelected = this.engineTrayContainer.querySelector('.engine-chip.active');
        if (currentlySelected === btn) {
          btn.classList.remove('active');
          this.selectedEngineComponent = null;
        } else {
          if (currentlySelected) currentlySelected.classList.remove('active');
          btn.classList.add('active');
          this.selectedEngineComponent = c.id;
          audio.playClick();
        }
      });
      this.engineTrayContainer.appendChild(btn);
    });

    this.engineSlotsContainer.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const slot = document.createElement('div');
      slot.className = 'engine-slot';
      slot.dataset.slotIndex = i;
      slot.innerHTML = `
        <span class="slot-num">STAGE ${i + 1}</span>
        <span class="slot-val">EMPTY</span>
      `;
      slot.addEventListener('click', () => {
        if (this.selectedEngineComponent) {
          if (this.onEngineSlotSelect) {
            this.onEngineSlotSelect(i, this.selectedEngineComponent);
          }
          const active = this.engineTrayContainer.querySelector('.engine-chip.active');
          if (active) active.classList.remove('active');
          this.selectedEngineComponent = null;
        } else {
          if (this.onEngineSlotSelect) {
            this.onEngineSlotSelect(i, null);
          }
        }
      });
      this.engineSlotsContainer.appendChild(slot);
    }
  }

  updateEngineSlots(slots) {
    const slotElements = this.engineSlotsContainer.querySelectorAll('.engine-slot');
    slotElements.forEach((el, idx) => {
      const compId = slots[idx];
      const valEl = el.querySelector('.slot-val');
      if (compId) {
        valEl.textContent = compId.toUpperCase();
        el.classList.add('filled');
      } else {
        valEl.textContent = 'EMPTY';
        el.classList.remove('filled');
      }
    });
  }

  updateEngineThrust(percent) {
    this.engineThrustBar.style.width = `${percent}%`;
    this.engineThrustVal.textContent = `${Math.round(percent)}% (${Math.round(percent * 1.2)} kN)`;
  }

  setupCadUI(onPartSelect, onAssemble) {
    this.onCadPartSelect = onPartSelect;
    this.onCadAssemble = onAssemble;

    const parts = [
      { id: 'shaft',   label: 'Drive Shaft' },
      { id: 'bearing', label: 'Ball Bearing' },
      { id: 'gear',    label: 'Spur Gear' },
      { id: 'bracket', label: 'Mounting Bracket' }
    ];

    this.cadPartsContainer.innerHTML = '';
    parts.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'cad-part-btn';
      btn.dataset.partId = p.id;
      btn.innerHTML = `<span class="cad-part-dot"></span><span>${p.label}</span>`;
      btn.addEventListener('click', () => {
        if (this.selectedCadPart === p.id) {
          if (this.onCadAssemble) {
            this.onCadAssemble();
          }
        } else {
          this.selectedCadPart = p.id;
          if (this.onCadPartSelect) {
            this.onCadPartSelect(p.id);
          }
        }
      });
      this.cadPartsContainer.appendChild(btn);
    });
  }

  updateCadSelectedPart(partId) {
    const btns = this.cadPartsContainer.querySelectorAll('.cad-part-btn');
    btns.forEach(b => {
      if (b.dataset.partId === partId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
  }

  updateCadChecklist(parts) {
    this.selectedCadPart = null;
    const btns = this.cadPartsContainer.querySelectorAll('.cad-part-btn');
    btns.forEach(b => {
      const p = parts[b.dataset.partId];
      if (p && p.assembled) {
        b.classList.add('assembled');
        b.classList.remove('active');
        b.querySelector('.cad-part-dot').style.backgroundColor = '#00e676';
      }
    });
  }

  renderCertificate() {
    this.certRecipientName.textContent = CONFIG.friendName;
    this.certTotalScore.textContent = `${gameState.scores.total} PTS`;
    this.certTotalTime.textContent = `${gameState.getTotalElapsedSeconds()}s`;

    const challenges = [
      { key: 'chess',  name: 'Chess Protocol' },
      { key: 'racing', name: 'Kart-X Racing' },
      { key: 'drone',  name: 'Drone Flight Test' },
      { key: 'engine', name: 'Jet Engine Ignition' },
      { key: 'cad',    name: 'CAD Assembly Workshop' }
    ];

    this.certScoreBreakdown.innerHTML = challenges.map(c => `
      <div class="cert-breakdown-row">
        <span class="breakdown-name">${c.name}</span>
        <span class="breakdown-time">${gameState.times[c.key] || 0}s</span>
        <span class="breakdown-score">+${gameState.scores[c.key] || 0} pts</span>
      </div>
    `).join('');
  }

  updateHUDLoop() {
    const totalSecs = gameState.getTotalElapsedSeconds();
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    this.timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
