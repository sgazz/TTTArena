class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });

    // Game state
    this.BOARD_COUNT = 9;
    this.boards = [];
    this.boardFinished = [];
    this.boardWinners = Array(9).fill(null);
    this.currentBoardIndex = 0;
    this.currentPlayer = 'X';
    this.mode = 'PvP';
    this.cellSize = 50; // Smanjili smo sa 80 na 50
    this.cellSpacing = 6; // Smanjili smo sa 10 na 6
    this.minis = [];
    this.score = { X: 0, O: 0 };
    
    // Herojska imena za table
    this.boardNames = [
      '⚡ Thunder',    // #1 - Grom
      '🔥 Phoenix',    // #2 - Feniks
      '👤 Shadow',     // #3 - Senka
      '🐉 Dragon',     // #4 - Zmaj
      '⚔️ Valkyrie',   // #5 - Valkira
      '🌪️ Storm',      // #6 - Oluja
      '🗡️ Blade',      // #7 - Oštrica
      '❄️ Frost',      // #8 - Led
      '🔥 Flame'       // #9 - Plamen
    ];
    
    // Timer system
    this.timers = { X: 60, O: 60 };
    this.timerEvent = null;
    this.gameActive = false;
    
    // Semafor system
    this.lastBonus = null;
    
    // Animation system
    this.winningCells = [];
    this.blinkTween = null;
    
    // Pause system
    this.isPaused = false;
    
    // Game statistics
    this.stats = {
      totalMoves: 0,
      totalTime: 0,
      averageTimePerMove: 0
    };
    
    // Replay system
    this.moveHistory = [];
    this.isReplaying = false;
    this.replayIndex = 0;
    
    // AI difficulty
    this.aiDifficulty = 'medium';
    
    // Tournament system
    this.tournamentMode = false;
    this.tournamentGames = 0;
    this.tournamentScore = { X: 0, O: 0 };
    this.maxTournamentGames = 5;
  }

  create() {
    console.log('GameScene create() called');
    
    this.initState();
    console.log('State initialized');
    this.drawBoards();
    console.log('Boards drawn');
    this.drawHeader();
    console.log('Header drawn');
    this.updateSemafor();
    console.log('Semafor updated');
    
    // Don't start timer immediately - wait for first move
    this.gameActive = false;
    console.log('Game ready - waiting for first move');

    this.input.on('pointerdown', (pointer) => {
      this.handlePointer(pointer);
    });

    // Add hover effects for boards
    this.input.on('pointerover', (pointer) => {
      this.handlePointerOver(pointer);
    });

    this.input.on('pointerout', (pointer) => {
      this.handlePointerOut(pointer);
    });

    // Keyboard controls
    this.input.keyboard.on('keydown-SPACE', () => {
      this.togglePause();
    });

    this.input.keyboard.on('keydown-R', () => {
      this.resetTournament();
    });

    if (this.mode === 'AIvP') {
      this.maybeTriggerAIMove();
    }
  }

  initState() {
    this.boards = [];
    this.boardFinished = [];
    this.boardWinners = Array(this.BOARD_COUNT).fill(null);
    this.minis = [];
    this.currentBoardIndex = 0;
    this.currentPlayer = 'X';
    this.score = { X: 0, O: 0 };
    this.timers = { X: 60, O: 60 };
    this.gameActive = true;
    this.lastBonus = null;
    this.winningCells = [];

    for (let i=0;i<this.BOARD_COUNT;i++){
      this.boards.push(Array(9).fill(null));
      this.boardFinished.push(false);
    }

    // Update replay button state
    this.updateReplayButton();
  }

  startTimer() {
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }
    
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
      paused: this.isPaused
    });
  }

  updateTimer() {
    if (!this.gameActive || this.isPaused) return;
    
    this.timers[this.currentPlayer] -= 1;
    this.updateSemafor();
    
    // Animate timer when critical (< 10s)
    if (this.timers[this.currentPlayer] <= 10 && this.timers[this.currentPlayer] > 0) {
      this.animateCriticalTimer();
    }
    
    if (this.timers[this.currentPlayer] <= 0) {
      this.onTimeOut();
    }
  }

  animateCriticalTimer() {
    const timerElement = document.getElementById(this.currentPlayer === 'X' ? 'timeX' : 'timeO');
    if (timerElement) {
      timerElement.style.color = '#ff4444';
      timerElement.style.fontWeight = 'bold';
      
      // Pulse animation
      timerElement.style.animation = 'pulse 0.5s ease-in-out';
      
      // Reset animation after 0.5s
      setTimeout(() => {
        timerElement.style.animation = '';
      }, 500);
    }
  }

  updateSemafor() {
    document.getElementById('scoreX').textContent = this.score.X;
    document.getElementById('scoreO').textContent = this.score.O;
    document.getElementById('timeX').textContent = this.formatTime(this.timers.X);
    document.getElementById('timeO').textContent = this.formatTime(this.timers.O);
    
    // Update tournament info if in tournament mode
    if (this.tournamentMode) {
      this.updateTournamentInfo();
    }
    
    if (this.lastBonus) {
      const bonusElement = document.getElementById('bonusInfo');
      bonusElement.textContent = this.lastBonus;
      
      // Animate bonus info
      bonusElement.style.color = '#ffcc66';
      bonusElement.style.fontWeight = 'bold';
      bonusElement.style.fontSize = '14px';
      
      // Clear bonus info after 1 second with fade effect
      setTimeout(() => {
        bonusElement.style.transition = 'opacity 0.5s';
        bonusElement.style.opacity = '0';
        setTimeout(() => {
          bonusElement.textContent = '';
          bonusElement.style.opacity = '1';
          bonusElement.style.color = '#aaa';
          bonusElement.style.fontWeight = 'normal';
          bonusElement.style.fontSize = '12px';
          this.lastBonus = null;
        }, 500);
      }, 1000);
    }
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  onTimeOut() {
    this.gameActive = false;
    const winner = this.currentPlayer === 'X' ? 'O' : 'X';
    
    if (this.tournamentMode) {
      this.handleTournamentGameEnd(winner);
    } else {
      this.onGameComplete(winner);
    }
  }

  showGameOver(winner, reason) {
    const gameOverDiv = document.getElementById('gameOver');
    const title = document.getElementById('gameOverTitle');
    const reasonElement = document.getElementById('gameOverReason');
    const scoreElement = document.getElementById('gameOverScore');
    
    if (reason === 'timeout') {
      title.textContent = 'Game Over - Time Out!';
      reasonElement.textContent = `${winner} wins! ${winner} had ${this.formatTime(this.timers[winner])} remaining.`;
      scoreElement.textContent = `Final score - X: ${this.score.X}, O: ${this.score.O}`;
    } else if (reason === 'draw') {
      title.textContent = 'Game Over - Draw!';
      reasonElement.textContent = `Game ended in a draw!`;
      scoreElement.textContent = `Final score - X: ${this.score.X}, O: ${this.score.O}`;
    } else {
      title.textContent = 'Game Over';
      reasonElement.textContent = `${winner} wins!`;
      scoreElement.textContent = `Final score - X: ${this.score.X}, O: ${this.score.O}`;
    }
    
    // Animate Game Over screen
    gameOverDiv.style.display = 'block';
    gameOverDiv.style.opacity = '0';
    gameOverDiv.style.transform = 'translate(-50%, -50%) scale(0.8)';
    
    // Fade in and scale up
    setTimeout(() => {
      gameOverDiv.style.transition = 'all 0.5s ease-out';
      gameOverDiv.style.opacity = '1';
      gameOverDiv.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 100);
  }

  onGameComplete(winner) {
    this.gameActive = false;
    
    if (winner === 'D') {
      this.showGameOver('D', 'draw');
    } else {
      this.showGameOver(winner, 'complete');
    }
  }

  drawHeader() {
    if (this.headerText) this.headerText.destroy();
    // Pozicioniramo header u centru iznad tabla
    const canvasWidth = 1200;
    const uiLeftWidth = 220;
    const uiRightWidth = 220;
    const gameAreaWidth = canvasWidth - uiLeftWidth - uiRightWidth;
    const headerX = uiLeftWidth + gameAreaWidth / 2;
    const headerY = 80;
    
    // Header uklonjen - više ne prikazujemo Arena info
    if (this.headerText) {
      this.headerText.destroy();
      this.headerText = null;
    }
  }

  drawBoards() {
    console.log('Drawing boards...');
    // Centriramo table u canvas-u, ostavljajući prostor za UI elemente
    const canvasWidth = 1200;
    const canvasHeight = 900;
    const uiTopHeight = 120; // Prostor za gornje UI elemente (Semafor iznad tabla)
    const uiBottomHeight = 50; // Prostor za donje UI elemente
    const uiLeftWidth = 220; // Prostor za levi UI
    const uiRightWidth = 220; // Prostor za desni UI
    
    const gameAreaWidth = canvasWidth - uiLeftWidth - uiRightWidth;
    const gameAreaHeight = canvasHeight - uiTopHeight - uiBottomHeight;
    
    const miniSize = this.cellSize*3 + this.cellSpacing*2;
    const totalBoardsWidth = 3 * miniSize + 2 * 50; // 3 table + 2 razmaka
    const totalBoardsHeight = 3 * miniSize + 2 * 50;
    
    const startX = uiLeftWidth + (gameAreaWidth - totalBoardsWidth) / 2;
    const startY = uiTopHeight + (gameAreaHeight - totalBoardsHeight) / 2;
    
    console.log(`Board positions: startX=${startX}, startY=${startY}, miniSize=${miniSize}`);
    
    if (this.boardGroup) {
      this.boardGroup.clear(true);
    }
    this.boardGroup = this.add.group();

    for (let b = 0; b < this.BOARD_COUNT; b++) {
      const r = Math.floor(b / 3);
      const c = b % 3;
      const x0 = startX + c * (miniSize + 50);
      const y0 = startY + r * (miniSize + 50);
      console.log(`Board ${b}: r=${r}, c=${c}, x0=${x0}, y0=${y0}`);

      // Background - veći kvadrat
      const bg = this.add.rectangle(x0 + miniSize/2, y0 + miniSize/2, miniSize + 20, miniSize + 20, 0x050505).setStrokeStyle(2, 0x00ff41);
      this.boardGroup.add(bg);

      // Highlight active board - veći kvadrat
      const highlight = this.add.rectangle(x0 + miniSize/2, y0 + miniSize/2, miniSize + 26, miniSize + 26).setStrokeStyle(3, 0x00ff41);
      highlight.setVisible(b === this.currentBoardIndex && !this.boardFinished[b]);
      this.boardGroup.add(highlight);

      // Cells - centriramo u background kvadratu
      const cells = [];
      const totalGridSize = 3 * this.cellSize + 2 * this.cellSpacing;
      const gridOffsetX = (miniSize - totalGridSize) / 2;
      const gridOffsetY = (miniSize - totalGridSize) / 2;
      
      for (let row=0; row<3; row++){
        for (let col=0; col<3; col++){
          const cx = x0 + gridOffsetX + col * (this.cellSize + this.cellSpacing) + this.cellSize/2;
          const cy = y0 + gridOffsetY + row * (this.cellSize + this.cellSpacing) + this.cellSize/2;
          const rect = this.add.rectangle(cx, cy, this.cellSize, this.cellSize, 0x0a0a0a).setStrokeStyle(1, 0x00ff41);
          const txt = this.add.text(cx, cy, this.boards[b][row*3+col] || '', { fontSize: '16px', color: '#00ff41', fontFamily: 'Orbitron, monospace', fontStyle: 'bold' }).setOrigin(0.5);
          cells.push({ rect, txt, index: row*3+col, cx, cy });
        }
      }

      // Board name - herojsko ime - centriran iznad većeg background kvadrata
      const label = this.add.text(x0 + (miniSize + 20)/2, y0 - 22, this.boardNames[b], { fontSize: '12px', color: '#00ff41', fontFamily: 'Orbitron, monospace', fontStyle: 'bold' }).setOrigin(0.5);

      // Winner indicator - manji font - centriran u gornjem desnom uglu većeg background kvadrata
      const winnerStamp = this.add.text(x0 + miniSize + 5, y0 - 15, this.boardWinners[b] ? this.boardWinners[b] : '', { fontSize: '12px', color: '#00ff41', fontFamily: 'Orbitron, monospace', fontStyle: 'bold' }).setOrigin(0.5);

      this.minis.push({
        x0, y0, bg, highlight, cells, label, winnerStamp, index: b
      });
    }

    this.updateBoardsVisual();
  }

  updateBoardsVisual() {
    // Check if boards are drawn
    if (!this.minis || this.minis.length === 0) {
      console.log('Boards not drawn yet, skipping updateBoardsVisual');
      return;
    }
    
    for (let b=0;b<this.BOARD_COUNT;b++){
      const mini = this.minis[b];
      mini.highlight.setVisible(b === this.currentBoardIndex && !this.boardFinished[b]);
      mini.winnerStamp.setText(this.boardWinners[b] ? this.boardWinners[b] : '');
      mini.cells.forEach(c => {
        c.txt.setText(this.boards[b][c.index] || '');
        if (this.boardFinished[b]) {
          c.txt.setAlpha(0.45);
          c.rect.setFillStyle(0x050505, 1);
        } else {
          c.txt.setAlpha(1);
          c.rect.setFillStyle(0x0a0a0a, 1);
        }
      });
    }
    this.drawHeader();
  }

  handlePointer(pointer) {
    if (this.isPaused || !this.gameActive) return;
    
    for (let mini of this.minis) {
      if (this.boardFinished[mini.index]) continue;
      if (mini.index !== this.currentBoardIndex) continue;

      for (let c of mini.cells) {
        const bounds = c.rect.getBounds();
        if (Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
          this.onCellClick(mini.index, c.index);
          return;
        }
      }
    }
  }

  handlePointerOver(pointer) {
    for (let mini of this.minis) {
      if (this.boardFinished[mini.index]) continue;
      if (mini.index !== this.currentBoardIndex) continue;

      for (let c of mini.cells) {
        const bounds = c.rect.getBounds();
        if (Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
          // Hover effect - scale up cell
          this.tweens.add({
            targets: c.rect,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 100,
            ease: 'Power2'
          });
          return;
        }
      }
    }
  }

  handlePointerOut(pointer) {
    for (let mini of this.minis) {
      if (this.boardFinished[mini.index]) continue;
      if (mini.index !== this.currentBoardIndex) continue;

      for (let c of mini.cells) {
        const bounds = c.rect.getBounds();
        if (Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
          // Reset hover effect
          this.tweens.add({
            targets: c.rect,
            scaleX: 1,
            scaleY: 1,
            duration: 100,
            ease: 'Power2'
          });
          return;
        }
      }
    }
  }

  onCellClick(boardIndex, cellIndex) {
    if (this.isPaused || !this.gameActive) return;
    if (this.boardFinished[boardIndex]) return;
    const board = this.boards[boardIndex];
    if (board[cellIndex]) return;

    // Start timer on first move
    if (!this.gameActive) {
      this.gameActive = true;
      this.startTimer();
      console.log('Timer started on first move');
    }

    // Update statistics
    this.stats.totalMoves++;
    this.updateStats();
    
    // Record move for replay
    this.moveHistory.push({
      boardIndex: boardIndex,
      cellIndex: cellIndex,
      player: this.currentPlayer,
      timestamp: Date.now()
    });

    // Enable replay button if we have moves
    this.updateReplayButton();

    // Play move sound
    this.playSound('move');

    board[cellIndex] = this.currentPlayer;
    
    // Animate the placed move
    const mini = this.minis[boardIndex];
    const cell = mini.cells[cellIndex];
    if (cell && cell.rect) {
      // Pulse animation for placed move
      this.tweens.add({
        targets: cell.rect,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 150,
        yoyo: true,
        ease: 'Power2'
      });
    }
    
    this.updateBoardsVisual();

    const winner = this.checkBoardWinner(board);
    if (winner) {
      this.handleBoardWin(boardIndex, winner);
    } else if (!board.includes(null)) {
      this.handleBoardDraw(boardIndex);
    } else {
      // X → O → sledeća tabla
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      
      // Prelazi na sledeću tablu SAMO ako je O odigrao potez
      if (this.currentPlayer === 'X') {
        this.advanceToNextBoard();
      }
      
      this.updateBoardsVisual();
    }

    this.maybeTriggerAIMove();
  }

  advanceToNextBoard() {
    if (this.boardFinished.every(x=>x)) return;
    let c = this.currentBoardIndex;
    for (let i=0;i<this.BOARD_COUNT;i++){
      c = (c + 1) % this.BOARD_COUNT;
      if (!this.boardFinished[c]) {
        // Animate board transition
        this.animateBoardTransition(this.currentBoardIndex, c);
        this.currentBoardIndex = c;
        return;
      }
    }
  }

  animateBoardTransition(fromBoard, toBoard) {
    // Fade out current board highlight
    const fromMini = this.minis[fromBoard];
    if (fromMini && fromMini.highlight) {
      this.tweens.add({
        targets: fromMini.highlight,
        alpha: 0.3,
        duration: 200,
        ease: 'Power2'
      });
    }

    // Fade in new board highlight
    const toMini = this.minis[toBoard];
    if (toMini && toMini.highlight) {
      this.tweens.add({
        targets: toMini.highlight,
        alpha: 1,
        duration: 300,
        ease: 'Power2',
        delay: 200
      });
    }
  }

  handleBoardWin(boardIndex, winner) {
    this.boardFinished[boardIndex] = true;
    this.boardWinners[boardIndex] = winner;
    this.score[winner] += 1;
    
    // Play win sound
    this.playSound('win');
    
    // Animate winning cells
    this.animateWinningCells(boardIndex, winner);
    
    // Animate score update
    this.animateScoreUpdate(winner);
    
    // Timer adjustments
    this.timers[winner] += 15;
    this.timers[winner === 'X' ? 'O' : 'X'] -= 10;
    
    // Update semafor
    this.lastBonus = `${winner} +15s, ${winner === 'X' ? 'O' : 'X'} -10s`;
    this.updateSemafor();
    
    // Check if all boards are finished (game complete)
    if (this.boardFinished.every(f => f)) {
      if (this.tournamentMode) {
        this.handleTournamentGameEnd(winner);
      } else {
        this.onGameComplete(winner);
      }
    } else {
      // Reset board immediately - loser plays first
      this.resetBoard(boardIndex, winner === 'X' ? 'O' : 'X');
    }
  }

  handleBoardDraw(boardIndex) {
    this.boardFinished[boardIndex] = true;
    this.boardWinners[boardIndex] = 'D';
    
    // Play draw sound
    this.playSound('draw');
    
    // Timer adjustments for draw
    this.timers.X += 5;
    this.timers.O += 5;
    
    // Update semafor
    this.lastBonus = 'Draw: X +5s, O +5s';
    this.updateSemafor();
    
    // Check if all boards are finished (game complete)
    if (this.boardFinished.every(f => f)) {
      if (this.tournamentMode) {
        this.handleTournamentGameEnd('D'); // Draw
      } else {
        this.onGameComplete('D'); // Draw
      }
    } else {
      // Reset board immediately - X starts after draw
      this.resetBoard(boardIndex, 'X');
    }
  }

  animateWinningCells(boardIndex, winner) {
    const winningCombo = this.getWinningCombo(this.boards[boardIndex], winner);
    if (!winningCombo) return;

    const mini = this.minis[boardIndex];
    this.winningCells = winningCombo.map(index => mini.cells[index].rect);

    // Create winning line
    this.drawWinningLine(boardIndex, winningCombo);

    // Blink animation
    this.blinkTween = this.tweens.add({
      targets: this.winningCells,
      alpha: 0,
      duration: 200,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        this.winningCells.forEach(cell => cell.setAlpha(1));
        this.winningCells = [];
        // Remove winning line
        if (this.winningLine) {
          this.winningLine.destroy();
          this.winningLine = null;
        }
      }
    });
  }

  drawWinningLine(boardIndex, winningCombo) {
    const mini = this.minis[boardIndex];
    if (!mini) return;

    // Calculate line position based on winning combo
    const [a, b, c] = winningCombo;
    const cellA = mini.cells[a];
    const cellC = mini.cells[c];

    if (cellA && cellC) {
      const startX = cellA.cx;
      const startY = cellA.cy;
      const endX = cellC.cx;
      const endY = cellC.cy;

      // Create line graphics
      this.winningLine = this.add.graphics();
      this.winningLine.lineStyle(4, 0xffcc66, 1);
      this.winningLine.beginPath();
      this.winningLine.moveTo(startX, startY);
      this.winningLine.lineTo(endX, endY);
      this.winningLine.strokePath();

      // Animate line drawing
      this.tweens.add({
        targets: this.winningLine,
        alpha: 0,
        duration: 800,
        delay: 400,
        ease: 'Power2'
      });
    }
  }

  animateScoreUpdate(winner) {
    const scoreElement = document.getElementById(winner === 'X' ? 'scoreX' : 'scoreO');
    if (scoreElement) {
      // Scale up and change color
      scoreElement.style.transform = 'scale(1.2)';
      scoreElement.style.color = '#ffcc66';
      scoreElement.style.fontWeight = 'bold';
      
      // Reset after animation
      setTimeout(() => {
        scoreElement.style.transform = 'scale(1)';
        scoreElement.style.color = '';
        scoreElement.style.fontWeight = '';
      }, 500);
    }
  }

  getWinningCombo(board, winner) {
    const wins = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    
    for (let combo of wins) {
      const [a,b,c] = combo;
      if (board[a] === winner && board[b] === winner && board[c] === winner) {
        return combo;
      }
    }
    return null;
  }

  resetBoard(boardIndex, firstPlayer) {
    // Animate board reset
    const mini = this.minis[boardIndex];
    if (mini) {
      // Fade out all cells
      mini.cells.forEach(cell => {
        if (cell.rect) {
          this.tweens.add({
            targets: cell.rect,
            alpha: 0.3,
            duration: 200,
            ease: 'Power2'
          });
        }
      });
      
      // After fade out, reset and fade in
      this.time.delayedCall(200, () => {
        this.boards[boardIndex] = Array(9).fill(null);
        this.boardFinished[boardIndex] = false;
        this.boardWinners[boardIndex] = null;
        
        this.currentPlayer = firstPlayer;
        this.updateBoardsVisual();
        
        // Fade in all cells
        mini.cells.forEach(cell => {
          if (cell.rect) {
            this.tweens.add({
              targets: cell.rect,
              alpha: 1,
              duration: 200,
              ease: 'Power2'
            });
          }
        });
        
        this.maybeTriggerAIMove();
      });
    } else {
      // Fallback if animation fails
      this.boards[boardIndex] = Array(9).fill(null);
      this.boardFinished[boardIndex] = false;
      this.boardWinners[boardIndex] = null;
      
      this.currentPlayer = firstPlayer;
      this.updateBoardsVisual();
      
      this.maybeTriggerAIMove();
    }
  }

  checkBoardWinner(board) {
    const wins = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (let combo of wins){
      const [a,b,c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  playSound(type) {
    // Placeholder for sound effects
    // In real implementation, you would load and play actual sound files
    console.log(`Playing ${type} sound`);
  }

  setMode(m) {
    console.log(`Setting mode to: ${m}`);
    this.mode = m;
    this.resetTournament();

    // Ako je tournament mode aktivan, prikaži tournament info
    if (this.tournamentMode) {
      this.showTournamentInfo();
    }

    if (this.mode === 'AIvP') {
      setTimeout(()=> this.maybeTriggerAIMove(), 200);
    }
  }

  resetGame() {
    this.initState();
    this.drawBoards();
    this.startTimer();
    
    // Hide tournament info if not in tournament mode
    if (!this.tournamentMode) {
      this.hideTournamentInfo();
    } else {
      // Ako je tournament mode, ažuriraj tournament info
      this.updateTournamentInfo();
    }
  }

  resetTournament() {
    this.resetGame();
  }

  maybeTriggerAIMove() {
    if (this.isPaused || !this.gameActive) return;
    
    const aiIsX = (this.mode === 'AIvP');
    const aiIsO = (this.mode === 'PvAI');

    const aiTurn = (aiIsX && this.currentPlayer === 'X') || (aiIsO && this.currentPlayer === 'O');
    if (!aiTurn) return;

    this.time.delayedCall(300, () => {
      if (this.isPaused || !this.gameActive) return;
      
      const board = this.boards[this.currentBoardIndex];
      if (this.boardFinished[this.currentBoardIndex]) return;
      
      const move = TicTacToeAI.makeMove(board.slice(), this.currentPlayer, this.aiDifficulty);
      if (move != null) {
        this.onCellClick(this.currentBoardIndex, move);
      }
    });
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const btnPause = document.getElementById('btnPause');
    if (btnPause) {
      btnPause.textContent = this.isPaused ? 'Resume' : 'Pause';
    }
    
    if (this.isPaused) {
      // Pause timer event
      if (this.timerEvent) {
        this.timerEvent.paused = true;
      }
      // Add pause overlay
      this.showPauseOverlay();
    } else {
      // Resume timer event
      if (this.timerEvent) {
        this.timerEvent.paused = false;
      }
      // Remove pause overlay
      this.hidePauseOverlay();
    }
  }

  showPauseOverlay() {
    const pauseOverlay = document.getElementById('pauseOverlay');
    if (pauseOverlay) {
      pauseOverlay.style.display = 'flex';
    }
  }

  hidePauseOverlay() {
    const pauseOverlay = document.getElementById('pauseOverlay');
    if (pauseOverlay) {
      pauseOverlay.style.display = 'none';
    }
  }

  updateStats() {
    const elapsedTime = 120 - (this.timers.X + this.timers.O); // 120 = 60+60 initial time
    this.stats.totalTime = elapsedTime;
    this.stats.averageTimePerMove = this.stats.totalMoves > 0 ? elapsedTime / this.stats.totalMoves : 0;
    
    // Stats panel removed - no longer updating UI
  }

  startReplay() {
    if (this.moveHistory.length === 0) {
      console.log('No moves to replay');
      return;
    }

    this.isReplaying = true;
    this.replayIndex = 0;
    
    // Disable replay button during replay
    const btnReplay = document.getElementById('btnReplay');
    if (btnReplay) {
      btnReplay.disabled = true;
    }
    
    // Reset game state
    this.resetTournament();
    
    // Start replay
    this.playNextMove();
  }

  playNextMove() {
    if (!this.isReplaying || this.replayIndex >= this.moveHistory.length) {
      this.isReplaying = false;
      console.log('Replay finished');
      
      // Re-enable replay button
      this.updateReplayButton();
      return;
    }

    const move = this.moveHistory[this.replayIndex];
    
    // Simulate the move
    this.boards[move.boardIndex][move.cellIndex] = move.player;
    this.currentBoardIndex = move.boardIndex;
    this.currentPlayer = move.player;
    
    // Update visuals
    this.updateBoardsVisual();
    
    // Check for win/draw
    const winner = this.checkBoardWinner(this.boards[move.boardIndex]);
    if (winner) {
      this.handleBoardWin(move.boardIndex, winner);
    } else if (!this.boards[move.boardIndex].includes(null)) {
      this.handleBoardDraw(move.boardIndex);
    } else {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      this.advanceToNextBoard();
      this.updateBoardsVisual();
    }
    
    this.replayIndex++;
    
    // Play next move after delay
    this.time.delayedCall(1000, () => {
      this.playNextMove();
    });
  }

  setAIDifficulty(difficulty) {
    this.aiDifficulty = difficulty;
    console.log(`AI difficulty set to: ${difficulty}`);
  }

  startTournament() {
    this.tournamentMode = true;
    this.tournamentGames = 0;
    this.tournamentScore = { X: 0, O: 0 };
    
    console.log('Starting tournament mode');
    this.showTournamentInfo();
    this.updateTournamentInfo();
    this.updateTournamentButtonState(true);
    this.startNextTournamentGame();
  }

  startNextTournamentGame() {
    if (this.tournamentGames >= this.maxTournamentGames) {
      this.endTournament();
      return;
    }

    this.tournamentGames++;
    console.log(`Tournament game ${this.tournamentGames}/${this.maxTournamentGames}`);
    
    // Ažuriraj tournament info
    this.updateTournamentInfo();
    
    // Reset for new game
    this.resetTournament();
    this.gameActive = false; // Don't start timer until first move
  }

  handleTournamentGameEnd(winner) {
    if (winner !== 'D') {
      this.tournamentScore[winner]++;
    }
    
    console.log(`Game ${this.tournamentGames} ended. Winner: ${winner}`);
    console.log(`Tournament score: X: ${this.tournamentScore.X}, O: ${this.tournamentScore.O}`);
    
    // Ažuriraj tournament info
    this.updateTournamentInfo();
    
    // Show game result
    this.showTournamentGameResult(winner);
    
    // Start next game after delay
    this.time.delayedCall(3000, () => {
      this.startNextTournamentGame();
    });
  }

  showTournamentGameResult(winner) {
    const gameOverDiv = document.getElementById('gameOver');
    const title = document.getElementById('gameOverTitle');
    const reasonElement = document.getElementById('gameOverReason');
    const scoreElement = document.getElementById('gameOverScore');
    
    title.textContent = `Game ${this.tournamentGames} Complete`;
    if (winner === 'D') {
      reasonElement.textContent = `Game ${this.tournamentGames} ended in a draw!`;
      scoreElement.textContent = `Tournament score - X: ${this.tournamentScore.X}, O: ${this.tournamentScore.O}`;
    } else {
      reasonElement.textContent = `${winner} wins game ${this.tournamentGames}!`;
      scoreElement.textContent = `Tournament score - X: ${this.tournamentScore.X}, O: ${this.tournamentScore.O}`;
    }
    
    gameOverDiv.style.display = 'block';
    
    // Auto-hide after 2.5 seconds
    setTimeout(() => {
      gameOverDiv.style.display = 'none';
    }, 2500);
  }

  stopTournament() {
    this.tournamentMode = false;
    this.tournamentGames = 0;
    this.tournamentScore = { X: 0, O: 0 };
    
    console.log('Tournament stopped by user');
    
    // Reset game state
    this.resetGame();
    
    // Hide tournament info and show button
    this.hideTournamentInfo();
    
    // Update tournament button state
    this.updateTournamentButtonState(false);
  }

  endTournament() {
    this.tournamentMode = false;
    
    const winner = this.tournamentScore.X > this.tournamentScore.O ? 'X' : 
                   this.tournamentScore.O > this.tournamentScore.X ? 'O' : 'Tie';
    
    const gameOverDiv = document.getElementById('gameOver');
    const title = document.getElementById('gameOverTitle');
    const reasonElement = document.getElementById('gameOverReason');
    const scoreElement = document.getElementById('gameOverScore');
    
    title.textContent = 'Tournament Complete!';
    if (winner === 'Tie') {
      reasonElement.textContent = `Tournament ended in a tie!`;
      scoreElement.textContent = `Final score - X: ${this.tournamentScore.X}, O: ${this.tournamentScore.O}`;
    } else {
      reasonElement.textContent = `${winner} wins the tournament!`;
      scoreElement.textContent = `Final score - X: ${this.tournamentScore.X}, O: ${this.tournamentScore.O}`;
    }
    
    gameOverDiv.style.display = 'block';
    
    // Sakrij tournament info i prikaži dugme
    this.hideTournamentInfo();
    
    // Update tournament button state
    this.updateTournamentButtonState(false);
  }

  showTournamentInfo() {
    // Sakrij dugme i prikaži tournament info panel
    const tournamentButton = document.getElementById('tournament-button');
    const tournamentInfo = document.getElementById('tournament-info');
    
    if (tournamentButton) {
      tournamentButton.style.display = 'none';
    }
    if (tournamentInfo) {
      tournamentInfo.style.display = 'block';
    }
    this.updateTournamentInfo();
  }

  updateTournamentInfo() {
    // Ažuriraj HTML tournament info panel
    const tournamentProgress = document.getElementById('tournamentProgress');
    
    if (tournamentProgress) {
      tournamentProgress.textContent = `${this.tournamentGames}/${this.maxTournamentGames}`;
    }
  }

  hideTournamentInfo() {
    // Prikaži dugme i sakrij tournament info panel
    const tournamentButton = document.getElementById('tournament-button');
    const tournamentInfo = document.getElementById('tournament-info');
    
    if (tournamentButton) {
      tournamentButton.style.display = 'block';
    }
    if (tournamentInfo) {
      tournamentInfo.style.display = 'none';
    }
  }

  updateReplayButton() {
    const btnReplay = document.getElementById('btnReplay');
    if (btnReplay) {
      btnReplay.disabled = this.moveHistory.length === 0;
    }
  }

  updateTournamentButtonState(isActive) {
    const tournamentButton = document.getElementById('tournament-button');
    const btnStopTournament = document.getElementById('btnStopTournament');
    const tournamentStatus = document.getElementById('tournamentStatus');
    
    if (tournamentButton) {
      if (isActive) {
        tournamentButton.classList.add('active');
        tournamentButton.classList.remove('disabled');
        tournamentButton.title = 'Tournament in progress (Ctrl+Shift+T to stop)';
        if (tournamentStatus) {
          tournamentStatus.textContent = 'Tournament Active';
        }
      } else {
        tournamentButton.classList.remove('active');
        tournamentButton.classList.remove('disabled');
        tournamentButton.title = 'Start tournament mode (Ctrl+T)';
        if (tournamentStatus) {
          tournamentStatus.textContent = 'Play Tournament';
        }
      }
    }

    if (btnStopTournament) {
      btnStopTournament.style.display = isActive ? 'block' : 'none';
    }
  }
}
