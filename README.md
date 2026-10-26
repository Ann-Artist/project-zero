# PROJECT ZERO — THE ENGINEER'S PLAYGROUND (2D EDITION)

> A clean, responsive 2D interactive engineering birthday game designed for engineers and creators who love **Chess**, **Go-Kart Racing**, **Drones**, **Jet Engines**, and **CAD Mechanical Design**.

---

## ⚡ Key Highlights of the 2D Edition
- **100% Clean 2D Canvas & Web Standards:** Zero heavy 3D engine overhead. Loads instantaneously and runs at silky smooth 60 FPS on any smartphone, tablet, or desktop.
- **Zero External Dependencies:** Built with pure Vanilla HTML5, CSS3, and modern JavaScript ES modules.
- **Procedural Web Audio Engine:** Realistic synthesized sound effects with zero 404s or audio file downloads.
- **Fully Responsive & Touch-Friendly:** On-screen controls for mobile devices and keyboard shortcuts for desktop.

---

## 🚀 Local Quickstart

Because this application uses modern ES modules, it runs through a local static HTTP server.

### Option 1: Built-in PowerShell Server (Windows)
```powershell
powershell -ExecutionPolicy Bypass -File server.ps1 -Port 8080
```
Then open your browser to:
👉 **`http://localhost:8080`**

### Option 2: Python (Cross-platform)
```bash
python -m http.server 8080
```
Then open: **`http://localhost:8080`**

### Option 3: Node / npx (Optional)
```bash
npx serve -l 8080 .
```

---


## 🕹️ The Five Engineering Challenges

### Room 1: Chess Protocol (2D)
* **Objective:** Force checkmate in 3 moves.
* **Puzzle:** Adams vs Torre Back-Rank Mate (`1. Qxf7+!`, `2. Re8+!`, `3. Rfxf8#`).
* **Controls:** Click/tap your White pieces to see glowing valid move markers. Click a target square to move.
* **Features:** Verified `chess.js` legal move validation, automated defensive responses, checkmate detection, move counter, hint button, and reload button.

### Room 2: Kart-X Racing Trial (2D Canvas)
* **Objective:** Win the race under **EITHER** of two victory conditions:
  1. **Speed Victory:** Finish in **1st Place (P1)** ahead of the other AI karts.
  2. **Endurance Victory:** Complete **3 full laps** around the circuit!
* **Controls:**
  * **Desktop:** `W` / `↑` (Gas), `S` / `↓` (Reverse), `A` / `←` (Steer Left), `D` / `→` (Steer Right), `Space` (Brake).
  * **Mobile:** Dedicated on-screen touch buttons for Steering (`◀` / `▶`), Gas (`⚡ GAS`), and Brake (`🛑 BRAKE`).
* **Features:** Top-down asphalt track, pre-race briefing modal, 3-2-1 countdown, real-time position tracker (`1ST / 3`), lap counter (`LAP 1 / 3`), on-canvas telemetry, mini-radar tracker, and tire smoke particle trails.

### Room 3: Drone Flight Test (2D Canvas)
* **Objective:** Pilot the quadcopter through all 4 holographic radar gates in sequence (`1 ➔ 2 ➔ 3 ➔ 4`), then touch down safely on the central landing pad (`H`).
* **Controls:**
  * **Desktop:** `W`/`S` (Forward/Backward), `A`/`D` (Left/Right) or Arrow keys, `Shift` or `E` (Ascend), `Space` or `Q` (Descend).
  * **Mobile:** Virtual D-pad for horizontal flight and dedicated `▲ UP` (Ascend) & `▼ DOWN` (Descend) buttons with pointer capture.
* **Features:** Responsive quadcopter flight dynamics, dynamic target guidance line, pulsing radar beacons on active gates, on-canvas flight telemetry, on-screen desktop controls hint, and soft landing touchdown detection.

### Room 4: Jet Engine Ignition (2D Blueprint)
* **Objective:** Arrange the 4 core engine components into the correct thermodynamic Brayton cycle order and initiate ignition.
* **Correct Sequence:**
  1. Compressor (Intake pressure rise)
  2. Combustion Chamber (Fuel injection & combustion)
  3. Turbine (Drives compressor shaft)
  4. Exhaust Nozzle (High-velocity thrust acceleration)
* **Controls:** Click or tap a component chip from the inventory tray, then tap the desired stage slot (or click directly on the blueprint canvas) to mount it. Press **INITIATE IGNITION**.
* **Features:** Interactive clickable blueprint cutaway, diagnostic feedback on incorrect configurations, high-RPM rotor spooling animation, combustion flame lighting, dynamic exhaust particle stream, and a live thrust gauge climbing to 120 kN.

### Room 5: CAD Assembly Workshop (2D Schematic)
* **Objective:** Complete the gearbox / bearing pillow block mechanical assembly inspired by SolidWorks.
* **Components:** Drive Shaft, Ball Bearing, Spur Gear, Mounting Bracket.
* **Controls:** Select a part to illuminate its mating datum axis on the blueprint. Click **SNAP & MATE COMPONENT** (or tap the part chip again / click the canvas) to mate with precision alignment sound.
* **Features:** SolidWorks-style mechanical mate constraints (Shaft must be installed before bearing/gear can slide onto it) and synchronized gear-mesh rotation upon verification.

### Room 6: Final Reward Vault & Trophy
* **Features:**
  * High-impact metallic 2D trophy illustration.
  * Falling celebratory confetti particle system.
  * Personalized Engineering Excellence Certificate with recipient's name, breakdown of challenge completion times and points, and birthday greeting.
  * Fullscreen Certificate Mode (clean print/screenshot friendly view).
  * Replay button to reset and replay the entire experience.

---

## 📂 Clean Project Structure

```
project-zero/
│
├── index.html                  # Main application structure & HUD overlays
├── server.ps1                  # Lightweight local static HTTP server (PowerShell)
├── README.md                   # Documentation & setup guide
│
├── css/
│   ├── style.css               # Core 2D styles, header, blast doors, toasts
│   └── games.css               # Challenge HUDs, canvases, cards, certificate
│
├── js/
│   ├── main.js                 # App entry point & animation loop
│   ├── config.js               # Personalized name, messages & room metadata
│   ├── gameState.js            # Progression state, scoring & timing tracker
│   ├── audio.js                # Procedural Web Audio synthesizer
│   ├── doors.js                # 2D animated mechanical blast door system
│   ├── ui.js                   # HUD manager, touch controls, certificate view
│   ├── gameManager.js          # Central orchestrator managing the five rooms
│   │
│   ├── games/
│   │   ├── chess.js            # Challenge 1: 2D Chess Protocol (Mate-in-3)
│   │   ├── racing.js           # Challenge 2: 2D Kart-X Racing Trial
│   │   ├── drone.js            # Challenge 3: 2D Drone Flight Test
│   │   ├── engine.js           # Challenge 4: 2D Jet Engine Ignition
│   │   └── cad.js              # Challenge 5: 2D CAD Assembly Workshop
│   │
│   ├── vault.js                # 2D Celebratory confetti particle simulator
│   └── vendor/
│       └── chess.module.js     # chess.js verified ES module
│
└── assets/                     # Clean assets directory
```
