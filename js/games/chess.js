/**
 * PROJECT ZERO — Challenge 1: Chess Protocol (2D)
 * Standard Staunton pieces, rank/file coordinates, interactive selection,
 * mate-in-3 puzzle validation with chess.js, and beginner-friendly instructions.
 */

import { Chess } from '../vendor/chess.module.js';
import { audio } from '../audio.js';
import { gameState } from '../gameState.js';

// Standard Staunton Chess Piece Vector Graphics (Universally recognized)
const STAUNTON_SVGS = {
  // White Pieces
  'w_k': `<svg viewBox="0 0 45 45">
    <g fill="#ffffff" stroke="#111827" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22.5 11.63V6M20 8h5" stroke-width="2"/>
      <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/>
      <path d="M12.5 37c5.5 3.5 14.5 3.5 20 0v-5c0-4-3-4-5-5-2-1-3-1-5-1s-3 0-5 1c-2 1-5 1-5 5v5z"/>
      <circle cx="15.5" cy="27.5" r="1.5" fill="#f59e0b"/>
      <circle cx="22.5" cy="25" r="1.5" fill="#f59e0b"/>
      <circle cx="29.5" cy="27.5" r="1.5" fill="#f59e0b"/>
      <path d="M12.5 37h20M11 40h23" stroke-width="2"/>
    </g>
  </svg>`,

  'w_q': `<svg viewBox="0 0 45 45">
    <g fill="#ffffff" stroke="#111827" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="6" cy="12" r="2.5" fill="#f59e0b"/>
      <circle cx="14" cy="9" r="2.5" fill="#f59e0b"/>
      <circle cx="22.5" cy="8" r="2.5" fill="#f59e0b"/>
      <circle cx="31" cy="9" r="2.5" fill="#f59e0b"/>
      <circle cx="39" cy="12" r="2.5" fill="#f59e0b"/>
      <path d="M9 26c8.5-1.5 18.5-1.5 27 0l2.5-12.5L31 22l-8.5-13-8.5 13-7.5-8.5L9 26z"/>
      <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4"/>
      <path d="M11 38h23M10 41h25" stroke-width="2"/>
    </g>
  </svg>`,

  'w_r': `<svg viewBox="0 0 45 45">
    <g fill="#ffffff" stroke="#111827" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 39h27v-4H9v4zm3-4v-4h21v4H12zm1.5-4l1.5-13h15l1.5 13h-18z"/>
      <path d="M14 18v-4h4v2h2v-2h5v2h2v-2h4v4H14z"/>
      <path d="M12 14h21M9 40h27" stroke-width="2"/>
    </g>
  </svg>`,

  'w_b': `<svg viewBox="0 0 45 45">
    <g fill="#ffffff" stroke="#111827" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="22.5" cy="8" r="2" fill="#f59e0b"/>
      <path d="M15 36c4-1 11-1 15 0v-4c0-3-2.5-4-4.5-5.5-2-1.5-2.5-3.5-2.5-6.5 0-3 3-5 3-5s-3.5-1-3.5-5c0 0-2 1-2 3.5 0 2 2 3.5 2 3.5s-4 1.5-4 4.5c0 3-.5 5-2.5 6.5-2 1.5-4.5 2.5-4.5 5.5v4z"/>
      <path d="M17.5 26h10M15 36h15M13 39h19" stroke-width="1.5"/>
      <path d="M21 15l4 4M25 15l-4 4" stroke-width="1.2"/>
    </g>
  </svg>`,

  'w_n': `<svg viewBox="0 0 45 45">
    <g fill="#ffffff" stroke="#111827" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 10c-3 0-5.5 2-6 5.5-.5 3-2 4.5-4 5.5 1.5 1 3.5 1 5.5.5-1 2-1 4-1 6 0 4.5 3 7.5 7.5 7.5s7.5-3 7.5-7.5c0-2.5-.5-4.5-1.5-6.5 2 0 4-.5 5-1.5-2.5-1-4-2.5-4-4.5 0-3-3.5-5-8-5z"/>
      <circle cx="18" cy="14" r="1.5" fill="#111827"/>
      <path d="M13 39c5-1 14-1 19 0M11 41h23" stroke-width="2"/>
    </g>
  </svg>`,

  'w_p': `<svg viewBox="0 0 45 45">
    <g fill="#ffffff" stroke="#111827" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="22.5" cy="12" r="5"/>
      <path d="M16 23c2-1 4.5-1 6.5-1s4.5 0 6.5 1c-1 3-2 6-3 9h-7c-1-3-2-6-3-9z"/>
      <path d="M14 36c4.5-1 12.5-1 17 0v-2c0-1.5-2-2-4-2h-9c-2 0-4 .5-4 2v2z"/>
      <path d="M13 39h19" stroke-width="2"/>
    </g>
  </svg>`,

  // Black Pieces (Dark slate with white contour lines)
  'b_k': `<svg viewBox="0 0 45 45">
    <g fill="#1e293b" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22.5 11.63V6M20 8h5" stroke-width="2" stroke="#f59e0b"/>
      <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/>
      <path d="M12.5 37c5.5 3.5 14.5 3.5 20 0v-5c0-4-3-4-5-5-2-1-3-1-5-1s-3 0-5 1c-2 1-5 1-5 5v5z"/>
      <circle cx="15.5" cy="27.5" r="1.5" fill="#f59e0b"/>
      <circle cx="22.5" cy="25" r="1.5" fill="#f59e0b"/>
      <circle cx="29.5" cy="27.5" r="1.5" fill="#f59e0b"/>
      <path d="M12.5 37h20M11 40h23" stroke-width="2"/>
    </g>
  </svg>`,

  'b_q': `<svg viewBox="0 0 45 45">
    <g fill="#1e293b" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="6" cy="12" r="2.5" fill="#f59e0b"/>
      <circle cx="14" cy="9" r="2.5" fill="#f59e0b"/>
      <circle cx="22.5" cy="8" r="2.5" fill="#f59e0b"/>
      <circle cx="31" cy="9" r="2.5" fill="#f59e0b"/>
      <circle cx="39" cy="12" r="2.5" fill="#f59e0b"/>
      <path d="M9 26c8.5-1.5 18.5-1.5 27 0l2.5-12.5L31 22l-8.5-13-8.5 13-7.5-8.5L9 26z"/>
      <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4"/>
      <path d="M11 38h23M10 41h25" stroke-width="2"/>
    </g>
  </svg>`,

  'b_r': `<svg viewBox="0 0 45 45">
    <g fill="#1e293b" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 39h27v-4H9v4zm3-4v-4h21v4H12zm1.5-4l1.5-13h15l1.5 13h-18z"/>
      <path d="M14 18v-4h4v2h2v-2h5v2h2v-2h4v4H14z"/>
      <path d="M12 14h21M9 40h27" stroke-width="2"/>
    </g>
  </svg>`,

  'b_b': `<svg viewBox="0 0 45 45">
    <g fill="#1e293b" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="22.5" cy="8" r="2" fill="#f59e0b"/>
      <path d="M15 36c4-1 11-1 15 0v-4c0-3-2.5-4-4.5-5.5-2-1.5-2.5-3.5-2.5-6.5 0-3 3-5 3-5s-3.5-1-3.5-5c0 0-2 1-2 3.5 0 2 2 3.5 2 3.5s-4 1.5-4 4.5c0 3-.5 5-2.5 6.5-2 1.5-4.5 2.5-4.5 5.5v4z"/>
      <path d="M17.5 26h10M15 36h15M13 39h19" stroke-width="1.5"/>
      <path d="M21 15l4 4M25 15l-4 4" stroke-width="1.2"/>
    </g>
  </svg>`,

  'b_n': `<svg viewBox="0 0 45 45">
    <g fill="#1e293b" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 10c-3 0-5.5 2-6 5.5-.5 3-2 4.5-4 5.5 1.5 1 3.5 1 5.5.5-1 2-1 4-1 6 0 4.5 3 7.5 7.5 7.5s7.5-3 7.5-7.5c0-2.5-.5-4.5-1.5-6.5 2 0 4-.5 5-1.5-2.5-1-4-2.5-4-4.5 0-3-3.5-5-8-5z"/>
      <circle cx="18" cy="14" r="1.5" fill="#f59e0b"/>
      <path d="M13 39c5-1 14-1 19 0M11 41h23" stroke-width="2"/>
    </g>
  </svg>`,

  'b_p': `<svg viewBox="0 0 45 45">
    <g fill="#1e293b" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="22.5" cy="12" r="5"/>
      <path d="M16 23c2-1 4.5-1 6.5-1s4.5 0 6.5 1c-1 3-2 6-3 9h-7c-1-3-2-6-3-9z"/>
      <path d="M14 36c4.5-1 12.5-1 17 0v-2c0-1.5-2-2-4-2h-9c-2 0-4 .5-4 2v2z"/>
      <path d="M13 39h19" stroke-width="2"/>
    </g>
  </svg>`
};

const PIECE_NAMES = {
  'p': 'Pawn',
  'r': 'Rook',
  'n': 'Knight',
  'b': 'Bishop',
  'q': 'Queen',
  'k': 'King'
};

export class ChessGame2D {
  constructor(container, ui, onVictory) {
    this.container = container;
    this.ui = ui;
    this.onVictory = onVictory;

    // FEN: Adams vs Torre Back-Rank Mate in 3
    this.initialFen = 'r1b2rk1/pp4pp/2p5/q7/8/5Q2/PPP3PP/4RRK1 w - - 0 1';
    this.chess = new Chess(this.initialFen);

    this.selectedSquare = null;
    this.moveCount = 0;
    this.isPlayerTurn = true;
    this.isComplete = false;

    this.renderBoard();
  }

  renderBoard() {
    this.container.innerHTML = `
      <div class="chess-room-box">
        <!-- Simple Gate 1 Instructions Banner -->
        <div class="gate-guide-banner">
          <div class="gate-guide-header">
            <span class="gate-guide-badge">GATE 01</span>
            <span class="gate-guide-title">♟️ CHESS PROTOCOL</span>
            <span class="gate-guide-target">CHECKMATE IN 3 MOVES</span>
          </div>
          <div class="gate-guide-body">
            <div class="guide-step-item">
              <span class="step-num">1</span>
              <span><b>Tap your White piece</b> (start with your Queen on <b>f3</b>) to select it.</span>
            </div>
            <div class="guide-step-item">
              <span class="step-num">2</span>
              <span><b>Tap a glowing green dot</b> to move your piece to that square.</span>
            </div>
            <div class="guide-step-item">
              <span class="step-num">3</span>
              <span>Deliver checkmate in 3 moves to win! (Need help? Tap <b>HINT</b> below).</span>
            </div>
          </div>
        </div>

        <!-- Chessboard with Outer Coordinate Frame -->
        <div class="board-frame">
          <!-- Top File Labels A-H -->
          <div class="board-coords-horiz">
            <span>A</span><span>B</span><span>C</span><span>D</span><span>E</span><span>F</span><span>G</span><span>H</span>
          </div>

          <div class="board-middle-row">
            <!-- Left Rank Labels 8-1 -->
            <div class="board-coords-vert">
              <span>8</span><span>7</span><span>6</span><span>5</span><span>4</span><span>3</span><span>2</span><span>1</span>
            </div>

            <!-- 8x8 Chess Grid -->
            <div id="chessboard-grid" class="chessboard-grid"></div>

            <!-- Right Rank Labels 8-1 -->
            <div class="board-coords-vert">
              <span>8</span><span>7</span><span>6</span><span>5</span><span>4</span><span>3</span><span>2</span><span>1</span>
            </div>
          </div>

          <!-- Bottom File Labels A-H -->
          <div class="board-coords-horiz">
            <span>A</span><span>B</span><span>C</span><span>D</span><span>E</span><span>F</span><span>G</span><span>H</span>
          </div>
        </div>

        <div id="chess-selection-hint" class="chess-selection-hint">
          Click any White piece to see legal moves
        </div>
      </div>
    `;

    this.boardGrid = this.container.querySelector('#chessboard-grid');
    this.selectionHint = this.container.querySelector('#chess-selection-hint');
    this.populateSquares();
  }

  populateSquares() {
    this.boardGrid.innerHTML = '';
    const boardState = this.chess.board();
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const squareName = files[f] + (8 - r);
        const isLight = (r + f) % 2 === 0;

        const sqEl = document.createElement('div');
        sqEl.className = `chess-sq ${isLight ? 'light' : 'dark'}`;
        sqEl.dataset.square = squareName;

        const piece = boardState[r][f];
        if (piece) {
          const pieceKey = `${piece.color}_${piece.type}`;
          const pieceName = `${piece.color === 'w' ? 'White' : 'Black'} ${PIECE_NAMES[piece.type]}`;
          sqEl.innerHTML = `
            <div class="piece-wrapper" data-color="${piece.color}" title="${pieceName} at ${squareName}">
              ${STAUNTON_SVGS[pieceKey] || ''}
            </div>
          `;
        }

        sqEl.addEventListener('click', () => this.handleSquareClick(squareName));
        this.boardGrid.appendChild(sqEl);
      }
    }
  }

  handleSquareClick(square) {
    if (!this.isPlayerTurn || this.isComplete) return;

    const piece = this.chess.get(square);

    // If clicking White piece: Select it!
    if (piece && piece.color === 'w') {
      this.selectPiece(square, piece);
      return;
    }

    // If a piece is already selected, attempt move to destination
    if (this.selectedSquare) {
      this.attemptMove(this.selectedSquare, square);
    }
  }

  selectPiece(square, piece) {
    this.clearHighlights();
    this.selectedSquare = square;

    const srcEl = this.boardGrid.querySelector(`[data-square="${square}"]`);
    if (srcEl) srcEl.classList.add('selected');

    if (this.selectionHint) {
      this.selectionHint.innerHTML = `Selected: <b>White ${PIECE_NAMES[piece.type]} at ${square.toUpperCase()}</b>. Tap a green target!`;
    }

    // Highlight legal moves with high-visibility target markers
    const moves = this.chess.moves({ square, verbose: true });
    moves.forEach(m => {
      const destEl = this.boardGrid.querySelector(`[data-square="${m.to}"]`);
      if (destEl) {
        destEl.classList.add(m.captured ? 'target-capture' : 'target-move');
      }
    });

    audio.playClick();
  }

  clearHighlights() {
    this.selectedSquare = null;
    this.boardGrid.querySelectorAll('.chess-sq').forEach(sq => {
      sq.classList.remove('selected', 'target-move', 'target-capture');
    });
    if (this.selectionHint) {
      this.selectionHint.textContent = 'Click any White piece to see legal moves';
    }
  }

  attemptMove(from, to) {
    const move = this.chess.move({ from, to });
    if (!move) {
      this.clearHighlights();
      return;
    }

    this.clearHighlights();
    this.moveCount++;
    this.isPlayerTurn = false;
    audio.playChessMove();
    this.populateSquares();

    // Check if move matches the forced checkmate sequence
    // Move 1: 1. Qxf7+
    // Move 2: 2. Re8+
    // Move 3: 3. Rfxf8# (or Rexf8#)
    const isCorrectPuzzleMove =
      (this.moveCount === 1 && to === 'f7' && move.piece === 'q') ||
      (this.moveCount === 2 && to === 'e8' && move.piece === 'r') ||
      (this.moveCount === 3 && to === 'f8' && move.piece === 'r' && this.chess.in_checkmate());

    if (this.chess.in_checkmate()) {
      this.handleVictory();
      return;
    }

    if (!isCorrectPuzzleMove) {
      this.ui.showToast('INCORRECT MOVE. RECALCULATE.', 'warning');
      setTimeout(() => this.resetPuzzle(), 1200);
      return;
    }

    audio.playChessCheck();
    this.ui.updateChessMoves(this.moveCount, 3);

    // Opponent forced defensive reply
    setTimeout(() => {
      this.playOpponentResponse();
    }, 450);
  }

  playOpponentResponse() {
    let oppMove = null;
    if (this.moveCount === 1) {
      oppMove = this.chess.move({ from: 'f8', to: 'f7' }) || this.chess.moves({ verbose: true })[0];
    } else if (this.moveCount === 2) {
      oppMove = this.chess.move({ from: 'f7', to: 'f8' }) || this.chess.moves({ verbose: true })[0];
    }

    if (oppMove) {
      audio.playChessMove();
      this.populateSquares();
      this.isPlayerTurn = true;
    }
  }

  handleVictory() {
    this.isComplete = true;
    audio.playFanfare(false);

    // Glow checkmated Black King
    const kingEl = this.boardGrid.querySelector('[data-square="g8"]');
    if (kingEl) kingEl.classList.add('checkmate-glow');

    this.ui.showToast('CHESS PROTOCOL COMPLETE // MATE VERIFIED', 'success');
    gameState.completeChallenge('chess');

    setTimeout(() => {
      if (this.onVictory) this.onVictory();
    }, 1800);
  }

  giveHint() {
    if (this.isComplete) return;
    if (this.moveCount === 0) {
      this.ui.showToast('HINT: Sacrifice the Queen on f7! (1. Qxf7+)', 'info');
      const piece = this.chess.get('f3');
      if (piece) this.selectPiece('f3', piece);
    } else if (this.moveCount === 1) {
      this.ui.showToast('HINT: Invade the back rank! (2. Re8+)', 'info');
      const piece = this.chess.get('e1');
      if (piece) this.selectPiece('e1', piece);
    } else if (this.moveCount === 2) {
      this.ui.showToast('HINT: Capture the pinned rook! (3. Rxf8#)', 'info');
      const piece = this.chess.get('f1');
      if (piece) this.selectPiece('f1', piece);
    }
  }

  resetPuzzle() {
    this.chess = new Chess(this.initialFen);
    this.moveCount = 0;
    this.isPlayerTurn = true;
    this.isComplete = false;
    this.clearHighlights();
    this.populateSquares();
    this.ui.updateChessMoves(0, 3);
  }

  destroy() {
    this.container.innerHTML = '';
  }
}
