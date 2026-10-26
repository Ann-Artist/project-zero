/**
 * PROJECT ZERO — Central Game Manager (2D)
 * Coordinates the 5 engineering challenges, animated 2D blast doors,
 * room transitions, sound triggers, and final birthday reward ceremony.
 */

import { gameState } from './gameState.js';
import { audio } from './audio.js';
import { DoorSystem2D } from './doors.js';
import { ChessGame2D } from './games/chess.js';
import { RacingGame2D } from './games/racing.js';
import { DroneGame2D } from './games/drone.js';
import { EngineGame2D } from './games/engine.js';
import { CadGame2D } from './games/cad.js';
import { VaultRoom2D } from './vault.js';
import { CONFIG } from './config.js';

export class GameManager2D {
  constructor(ui) {
    this.ui = ui;
    this.doors = new DoorSystem2D();

    // Game view containers
    this.roomContainer = document.getElementById('room-viewport');
    this.vaultCanvas = document.getElementById('confetti-canvas');
    this.vault = new VaultRoom2D(this.vaultCanvas);

    this.games = {
      chess: null,
      racing: null,
      drone: null,
      engine: null,
      cad: null
    };

    this.bindUIHooks();
  }

  bindUIHooks() {
    // Opening Sequence: ENTER FACILITY
    this.ui.onEnterFacility = () => {
      this.doors.open('01', 'CHESS PROTOCOL', () => {
        this.loadRoom(1);
      });
    };

    // Chess UI buttons
    this.ui.onChessHint = () => { if (this.games.chess) this.games.chess.giveHint(); };
    this.ui.onChessReset = () => { if (this.games.chess) this.games.chess.resetPuzzle(); };

    // Racing UI buttons
    this.ui.onRacingRetry = () => { if (this.games.racing) this.games.racing.retry(); };

    // Drone UI buttons
    this.ui.onDroneReset = () => { if (this.games.drone) this.games.drone.retry(); };

    // Engine UI slots & ignition
    this.ui.setupEngineUI(
      (slotIdx, compId) => {
        if (!this.games.engine) return;
        if (compId) this.games.engine.setSlot(slotIdx, compId);
        else this.games.engine.clearSlot(slotIdx);
      },
      () => { if (this.games.engine) this.games.engine.initiateIgnition(); }
    );

    // CAD UI parts & assemble
    this.ui.setupCadUI(
      (partId) => { if (this.games.cad) this.games.cad.selectPart(partId); },
      () => { if (this.games.cad) this.games.cad.assembleSelectedPart(); }
    );

    // Replay Game
    this.ui.onReplay = () => {
      this.replayAll();
    };
  }

  loadRoom(roomIndex) {
    // Clear previous room DOM and stop running loops
    this.roomContainer.innerHTML = '';
    if (this.games.racing) this.games.racing.stopRace();
    if (this.games.drone) this.games.drone.stopFlight();
    if (this.vault) this.vault.stop();

    gameState.setCurrentRoom(roomIndex);

    if (roomIndex === 1) {
      // Room 1: Chess Protocol
      this.games.chess = new ChessGame2D(
        this.roomContainer,
        this.ui,
        () => this.onChallengeWon(1, 2)
      );
    } else if (roomIndex === 2) {
      // Room 2: Kart-X Racing Trial
      this.games.racing = new RacingGame2D(
        this.roomContainer,
        this.ui,
        () => this.onChallengeWon(2, 3)
      );
      this.ui.racingInput = this.games.racing.input;
    } else if (roomIndex === 3) {
      // Room 3: Drone Flight Test
      this.games.drone = new DroneGame2D(
        this.roomContainer,
        this.ui,
        () => this.onChallengeWon(3, 4)
      );
      this.ui.droneInput = this.games.drone.input;
      this.games.drone.startFlight();
    } else if (roomIndex === 4) {
      // Room 4: Jet Engine Ignition
      this.games.engine = new EngineGame2D(
        this.roomContainer,
        this.ui,
        () => this.onChallengeWon(4, 5)
      );
    } else if (roomIndex === 5) {
      // Room 5: CAD Assembly Workshop
      this.games.cad = new CadGame2D(
        this.roomContainer,
        this.ui,
        () => this.onChallengeWon(5, 6)
      );
    } else if (roomIndex === 6) {
      // Room 6: Birthday Reward Vault
      audio.playFanfare(true);
      this.vault.start();
    }
  }

  onChallengeWon(completedRoomIndex, nextRoomIndex) {
    if (completedRoomIndex === 2 && this.games.racing) {
      this.games.racing.stopRace();
    } else if (completedRoomIndex === 3 && this.games.drone) {
      this.games.drone.stopFlight();
    }

    const nextRoomInfo = CONFIG.rooms[nextRoomIndex];
    const doorNum = nextRoomInfo ? nextRoomInfo.doorNum : `0${nextRoomIndex}`;
    const roomName = nextRoomInfo ? nextRoomInfo.name : 'NEXT ROOM';

    setTimeout(() => {
      this.doors.open(doorNum, roomName, () => {
        this.loadRoom(nextRoomIndex);
      });
    }, 600);
  }

  replayAll() {
    gameState.resetAll();
    this.doors.reset();
    if (this.vault) this.vault.stop();
    this.loadRoom(0);
  }

  update(delta) {
    this.ui.updateHUDLoop();

    const currentRoom = gameState.currentRoom;
    if (currentRoom === 2 && this.games.racing) {
      this.games.racing.update(delta);
    } else if (currentRoom === 3 && this.games.drone) {
      this.games.drone.update(delta);
    } else if (currentRoom === 4 && this.games.engine) {
      this.games.engine.update(delta);
    } else if (currentRoom === 5 && this.games.cad) {
      this.games.cad.update(delta);
    } else if (currentRoom === 6 && this.vault) {
      this.vault.update(delta);
    }
  }
}
