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
    
    // Arena system
    this.arenaMode = false;
    this.arenaGames = 0;
    this.arenaScore = { X: 0, O: 0, D: 0 };
    this.maxArenaGames = 5;
    this.arenaStats = {
      totalMoves: 0,
      averageGameTime: 0,
      fastestWin: null,
      longestGame: null,
      gameHistory: []
    };
  }

  create() {
    console.log('GameScene create() called');
    
    this.initState();
    console.log('State initialized');
    
    // Load and initialize sounds only if not already loaded
    if (!this.sounds || Object.keys(this.sounds).length === 0) {
      this.loadAndInitSounds();
    }
    
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
      this.resetArena();
    });

    if (this.mode === 'AIvP') {
      this.maybeTriggerAIMove();
    }
  }

  initState() {
    // Save sounds before reset
    const savedSounds = this.sounds || {};
    
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
    this.soundEnabled = true;
    this.aiThinking = false;
    
    // Restore sounds after reset
    this.sounds = savedSounds;

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
    
    console.log(`Timer update: ${this.currentPlayer} has ${this.timers[this.currentPlayer]}s`);
    
    // Prevent timer from going below 0
    if (this.timers[this.currentPlayer] <= 0) {
      console.log(`Timer timeout for ${this.currentPlayer}`);
      this.onTimeOut();
      return;
    }
    
    this.timers[this.currentPlayer] -= 1;
    this.updateSemafor();
    
    // Animate timer when critical (< 10s)
    if (this.timers[this.currentPlayer] <= 10 && this.timers[this.currentPlayer] > 0) {
      this.animateCriticalTimer();
    }
    
    if (this.timers[this.currentPlayer] <= 0) {
      console.log(`Timer timeout for ${this.currentPlayer} (after update)`);
      this.onTimeOut();
    }
  }

  animateCriticalTimer() {
    const timerElement = document.getElementById(this.currentPlayer === 'X' ? 'timeX' : 'timeO');
    if (timerElement) {
      // Enhanced critical timer animation
      timerElement.style.color = '#ff4444';
      timerElement.style.fontWeight = 'bold';
      timerElement.style.textShadow = '0 0 15px #ff4444';
      
      // Scale and shake animation
      timerElement.style.transform = 'scale(1.2)';
      timerElement.style.transition = 'all 0.1s ease-in-out';
      
      // Create shake effect
      let shakeCount = 0;
      const shakeInterval = setInterval(() => {
        const shakeX = (Math.random() - 0.5) * 4;
        const shakeY = (Math.random() - 0.5) * 4;
        timerElement.style.transform = `scale(1.2) translate(${shakeX}px, ${shakeY}px)`;
        
        shakeCount++;
        if (shakeCount >= 5) {
          clearInterval(shakeInterval);
          timerElement.style.transform = 'scale(1)';
          timerElement.style.textShadow = '';
          timerElement.style.color = '';
          timerElement.style.fontWeight = '';
        }
      }, 100);
    }
  }

  updateSemafor() {
    document.getElementById('scoreX').textContent = this.score.X;
    document.getElementById('scoreO').textContent = this.score.O;
    document.getElementById('timeX').textContent = this.formatTime(this.timers.X);
    document.getElementById('timeO').textContent = this.formatTime(this.timers.O);
    
    // Update arena info if in arena mode
    if (this.arenaMode) {
      this.updateArenaInfo();
    }
    
    if (this.lastBonus) {
      console.log('Setting bonus info:', this.lastBonus);
      
      // Determine which player gets the bonus based on the bonus message
      let bonusElement;
      if (this.lastBonus.includes('X')) {
        bonusElement = document.getElementById('bonusInfoX');
        console.log('Setting bonus for X player');
      } else if (this.lastBonus.includes('O')) {
        bonusElement = document.getElementById('bonusInfoO');
        console.log('Setting bonus for O player');
      } else {
        // For general bonuses (like draws), show on both
        const bonusElementX = document.getElementById('bonusInfoX');
        const bonusElementO = document.getElementById('bonusInfoO');
        
        console.log('Setting bonus for both players (general bonus)');
        bonusElementX.textContent = this.lastBonus;
        bonusElementO.textContent = this.lastBonus;
        
        // Animate both bonus info elements
        [bonusElementX, bonusElementO].forEach(element => {
          element.style.color = '#ffcc66';
          element.style.fontWeight = 'bold';
          element.style.fontSize = '14px';
        });
        
        // Clear both bonus info after 2 seconds with fade effect
        setTimeout(() => {
          console.log('Clearing bonus info after 2 seconds');
          [bonusElementX, bonusElementO].forEach(element => {
            element.style.transition = 'opacity 0.5s';
            element.style.opacity = '0';
          });
          setTimeout(() => {
            [bonusElementX, bonusElementO].forEach(element => {
              element.textContent = '';
              element.style.opacity = '1';
              element.style.color = '#aaa';
              element.style.fontWeight = 'normal';
              element.style.fontSize = '12px';
            });
            this.lastBonus = null;
            console.log('Bonus info cleared');
          }, 500);
        }, 2000);
        return;
      }
      
      console.log('Setting bonus for specific player:', bonusElement);
      bonusElement.textContent = this.lastBonus;
      
      // Animate bonus info
      bonusElement.style.color = '#ffcc66';
      bonusElement.style.fontWeight = 'bold';
      bonusElement.style.fontSize = '14px';
      
      // Clear bonus info after 2 seconds with fade effect
      setTimeout(() => {
        console.log('Clearing bonus info after 2 seconds');
        bonusElement.style.transition = 'opacity 0.5s';
        bonusElement.style.opacity = '0';
        setTimeout(() => {
          bonusElement.textContent = '';
          bonusElement.style.opacity = '1';
          bonusElement.style.color = '#aaa';
          bonusElement.style.fontWeight = 'normal';
          bonusElement.style.fontSize = '12px';
          this.lastBonus = null;
          console.log('Bonus info cleared');
        }, 500);
      }, 2000);
    }
  }

  formatTime(seconds) {
    // Handle negative values
    if (seconds < 0) {
      return '0:00';
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  onTimeOut() {
    this.gameActive = false;
    const winner = this.currentPlayer === 'X' ? 'O' : 'X';
    
    // Play error sound for timeout
    this.playSound('error');
    
    if (this.arenaMode) {
      this.handleArenaGameEnd(winner);
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
      this.playSound('draw');
      this.showGameOver('D', 'draw');
    } else {
      this.playSound('win');
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
    
    // Clear existing boards
    if (this.boardGroup) {
      this.boardGroup.clear(true);
    }
    this.boardGroup = this.add.group();
    
    // Reset minis array
    this.minis = [];
    
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
          const txt = this.add.text(cx, cy, this.boards[b][row*3+col] || '', { fontSize: '20px', color: '#00ff41', fontFamily: 'Orbitron, monospace', fontStyle: 'bold' }).setOrigin(0.5);
          this.boardGroup.add(rect);
          this.boardGroup.add(txt);
          cells.push({ rect, txt, index: row*3+col, cx, cy });
        }
      }

      // Board name - herojsko ime - centriran iznad većeg background kvadrata
      const label = this.add.text(x0 + (miniSize + 20)/2, y0 - 22, this.boardNames[b], { fontSize: '16px', color: '#00ff41', fontFamily: 'Orbitron, monospace', fontStyle: 'bold' }).setOrigin(0.5);
      this.boardGroup.add(label);

      // Winner indicator - manji font - centriran u gornjem desnom uglu većeg background kvadrata
      const winnerStamp = this.add.text(x0 + miniSize + 5, y0 - 15, this.boardWinners[b] ? this.boardWinners[b] : '', { fontSize: '14px', color: '#00ff41', fontFamily: 'Orbitron, monospace', fontStyle: 'bold' }).setOrigin(0.5);
      this.boardGroup.add(winnerStamp);

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
        const cellValue = this.boards[b][c.index] || '';
        c.txt.setText(cellValue);
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
          // Enhanced hover effect - scale up cell with glow
          this.tweens.add({
            targets: c.rect,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 150,
            ease: 'Back.easeOut'
          });
          
          // Add glow effect
          c.rect.setStrokeStyle(3, 0x00ff41);
          
          // Play tap sound on hover
          this.playSound('tap');
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
            duration: 150,
            ease: 'Back.easeOut'
          });
          
          // Remove glow effect
          c.rect.setStrokeStyle(1, 0x00ff41);
          return;
        }
      }
    }
  }

  onCellClick(boardIndex, cellIndex) {
    console.log(`onCellClick called: boardIndex=${boardIndex}, cellIndex=${cellIndex}, currentPlayer=${this.currentPlayer}`);
    
    if (this.isPaused || !this.gameActive) return;
    if (this.boardFinished[boardIndex]) {
      this.playSound('error');
      return;
    }
    const board = this.boards[boardIndex];
    if (board[cellIndex]) {
      this.playSound('error');
      return;
    }

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
      // Enhanced move animation with bounce and glow
      this.tweens.add({
        targets: cell.rect,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Bounce.easeOut'
      });
      
      // Add temporary glow effect
      cell.rect.setStrokeStyle(4, 0x00ff41);
      this.tweens.add({
        targets: cell.rect,
        strokeAlpha: 0.3,
        duration: 400,
        ease: 'Power2'
      });
      
      // Create particle effect
      this.createMoveParticles(cell.cx, cell.cy, this.currentPlayer);
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
    // Enhanced board transition with slide and glow effects
    
    // Fade out current board highlight with scale
    const fromMini = this.minis[fromBoard];
    if (fromMini && fromMini.highlight) {
      this.tweens.add({
        targets: fromMini.highlight,
        alpha: 0.2,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 300,
        ease: 'Power2'
      });
    }

    // Fade in new board highlight with bounce
    const toMini = this.minis[toBoard];
    if (toMini && toMini.highlight) {
      toMini.highlight.setScale(1.1);
      this.tweens.add({
        targets: toMini.highlight,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 400,
        ease: 'Back.easeOut',
        delay: 200
      });
      
      // Add pulse effect to new board
      this.tweens.add({
        targets: toMini.highlight,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 200,
        yoyo: true,
        repeat: 2,
        delay: 600
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
    const loser = winner === 'X' ? 'O' : 'X';
    const oldWinnerTime = this.timers[winner];
    const oldLoserTime = this.timers[loser];
    
    this.timers[winner] += 15;
    this.timers[loser] = Math.max(0, this.timers[loser] - 10); // Prevent negative time
    
    console.log(`Timer adjustments for win:`);
    console.log(`  ${winner}: ${oldWinnerTime}s → ${this.timers[winner]}s (+15)`);
    console.log(`  ${loser}: ${oldLoserTime}s → ${this.timers[loser]}s (-10)`);
    
    // Update semafor
    this.lastBonus = `${winner} +15s, ${loser} -10s`;
    console.log('Board win - setting lastBonus:', this.lastBonus);
    this.updateSemafor();
    
    // Check if all boards are finished (game complete)
    if (this.boardFinished.every(f => f)) {
          if (this.arenaMode) {
      this.handleArenaGameEnd(winner);
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
    const oldXTime = this.timers.X;
    const oldOTime = this.timers.O;
    
    this.timers.X += 5;
    this.timers.O += 5;
    
    console.log(`Timer adjustments for draw:`);
    console.log(`  X: ${oldXTime}s → ${this.timers.X}s (+5)`);
    console.log(`  O: ${oldOTime}s → ${this.timers.O}s (+5)`);
    
    // Update semafor
    this.lastBonus = 'Draw: X +5s, O +5s';
    console.log('Board draw - setting lastBonus:', this.lastBonus);
    this.updateSemafor();
    
    // Check if all boards are finished (game complete)
    if (this.boardFinished.every(f => f)) {
          if (this.arenaMode) {
      this.handleArenaGameEnd('D'); // Draw
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

    // Enhanced winning animation with explosion effect
    this.winningCells.forEach(cell => {
      // Scale up winning cells - shorter duration
      this.tweens.add({
        targets: cell,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 200,
        ease: 'Back.easeOut'
      });
      
      // Add glow effect
      cell.setStrokeStyle(5, 0xffcc66);
    });
    
    // Blink animation with rotation - shorter duration
    this.blinkTween = this.tweens.add({
      targets: this.winningCells,
      alpha: 0,
      rotation: 0.1,
      duration: 100,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        console.log('Winning animation completed, resetting cells...');
        this.winningCells.forEach(cell => {
          cell.setAlpha(1);
          cell.setRotation(0);
          cell.setScale(1, 1); // Reset scale to normal
          cell.setStrokeStyle(1, 0x00ff41);
          console.log('Cell reset - scale:', cell.scaleX, cell.scaleY);
        });
        this.winningCells = [];
        // Remove winning line
        if (this.winningLine) {
          this.winningLine.destroy();
          this.winningLine = null;
        }
      }
    });
    
    // Create explosion particles
    this.createWinParticles(boardIndex, winner);
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

      // Animate line drawing - shorter duration
      this.tweens.add({
        targets: this.winningLine,
        alpha: 0,
        duration: 500,
        delay: 200,
        ease: 'Power2'
      });
    }
  }

  animateScoreUpdate(winner) {
    const scoreElement = document.getElementById(winner === 'X' ? 'scoreX' : 'scoreO');
    if (scoreElement) {
      // Enhanced score animation with floating text
      const originalText = scoreElement.textContent;
      const newScore = parseInt(originalText) + 1;
      
      // Create floating +1 text
      const floatingText = document.createElement('div');
      floatingText.textContent = '+1';
      floatingText.style.position = 'absolute';
      floatingText.style.color = '#ffcc66';
      floatingText.style.fontSize = '20px';
      floatingText.style.fontWeight = 'bold';
      floatingText.style.fontFamily = 'Orbitron, monospace';
      floatingText.style.textShadow = '0 0 10px #ffcc66';
      floatingText.style.pointerEvents = 'none';
      floatingText.style.zIndex = '1000';
      
      // Position floating text
      const rect = scoreElement.getBoundingClientRect();
      floatingText.style.left = rect.left + 'px';
      floatingText.style.top = rect.top + 'px';
      
      document.body.appendChild(floatingText);
      
      // Animate floating text
      const startY = rect.top;
      const endY = startY - 50;
      const startTime = Date.now();
      const duration = 1000;
      
      const animateFloat = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress < 1) {
          const currentY = startY - (progress * 50);
          const opacity = 1 - progress;
          floatingText.style.top = currentY + 'px';
          floatingText.style.opacity = opacity;
          requestAnimationFrame(animateFloat);
        } else {
          document.body.removeChild(floatingText);
        }
      };
      
      animateFloat();
      
      // Update score with animation
      scoreElement.style.transform = 'scale(1.3)';
      scoreElement.style.color = '#ffcc66';
      scoreElement.style.fontWeight = 'bold';
      scoreElement.style.textShadow = '0 0 15px #ffcc66';
      
      // Update score text
      scoreElement.textContent = newScore;
      
      // Reset after animation
      setTimeout(() => {
        scoreElement.style.transform = 'scale(1)';
        scoreElement.style.color = '';
        scoreElement.style.fontWeight = '';
        scoreElement.style.textShadow = '';
      }, 600);
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

  loadAndInitSounds() {
    // Load sounds directly using fetch and create audio elements
    const soundFiles = ['move', 'tap', 'win', 'lose', 'error', 'draw'];
    
    let loadedCount = 0;
    
    soundFiles.forEach(soundName => {
      const soundPath = `sounds/${soundName}.wav`;
      
      // Create audio element
      const audio = new Audio(soundPath);
      audio.preload = 'auto';
      
      // Store in sounds object
      this.sounds[soundName] = audio;
      
      // Add event listeners
      audio.addEventListener('canplaythrough', () => {
        loadedCount++;
      });
      
      audio.addEventListener('error', (e) => {
        console.error(`Error loading sound ${soundName}:`, e);
      });
    });
  }

  createMoveParticles(x, y, player) {
    // Create particle effect for move
    const particles = this.add.particles(x, y, 'particle', {
      speed: { min: 50, max: 100 },
      scale: { start: 0.5, end: 0 },
      lifespan: 500,
      quantity: 8,
      tint: player === 'X' ? 0xff4444 : 0x4444ff,
      blendMode: 'ADD'
    });
    
    // Destroy particles after animation
    this.time.delayedCall(500, () => {
      particles.destroy();
    });
  }

  createWinParticles(boardIndex, winner) {
    const mini = this.minis[boardIndex];
    if (!mini) return;
    
    // Create explosion particles from center of board
    const centerX = mini.x0 + (mini.bg.width / 2);
    const centerY = mini.y0 + (mini.bg.height / 2);
    
    const particles = this.add.particles(centerX, centerY, 'particle', {
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      lifespan: 800,
      quantity: 15,
      tint: 0xffcc66,
      blendMode: 'ADD',
      angle: { min: 0, max: 360 }
    });
    
    // Destroy particles after animation
    this.time.delayedCall(800, () => {
      particles.destroy();
    });
  }

  playSound(type) {
    console.log(`playSound called: type=${type}, soundEnabled=${this.soundEnabled}`);
    
    // Check if sound is enabled
    if (this.soundEnabled === false) {
      return;
    }
    
    // Try to play sound from sounds object
    if (this.sounds && this.sounds[type]) {
      try {
        const audio = this.sounds[type];
        
        // Check if audio is ready
        if (audio.readyState < 2) { // HAVE_CURRENT_DATA
          return;
        }
        
        // Reset audio to beginning if it's already playing
        if (!audio.paused) {
          audio.currentTime = 0;
        }
        
        // Play the sound
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error(`Error playing sound ${type}:`, error);
          });
        }
        
        return;
      } catch (error) {
        console.error(`Error playing sound ${type}:`, error);
      }
    }
  }

  setMode(m) {
    console.log(`Setting mode to: ${m}`);
    this.mode = m;
        this.resetArena();
    
    // Ako je arena mode aktivan, prikaži arena info
    if (this.arenaMode) {
      this.showArenaInfo();
    }

    if (this.mode === 'AIvP') {
      setTimeout(()=> this.maybeTriggerAIMove(), 200);
    }
  }

  resetGame() {
    this.initState();
    this.drawBoards();
    this.startTimer();
    
    // Hide arena info if not in arena mode
    if (!this.arenaMode) {
      this.hideArenaInfo();
    } else {
      // Ako je arena mode, ažuriraj arena info
      this.updateArenaInfo();
    }
  }

  resetArena() {
    this.arenaGames = 0;
    this.arenaScore = { X: 0, O: 0, D: 0 };
    this.arenaStats = {
      totalMoves: 0,
      averageGameTime: 0,
      fastestWin: null,
      longestGame: null,
      gameHistory: []
    };
  }

  maybeTriggerAIMove() {
    console.log(`maybeTriggerAIMove called: mode=${this.mode}, currentPlayer=${this.currentPlayer}, isPaused=${this.isPaused}, gameActive=${this.gameActive}`);
    
    if (this.isPaused || !this.gameActive) return;
    
    const aiIsX = (this.mode === 'AIvP');
    const aiIsO = (this.mode === 'PvAI');

    const aiTurn = (aiIsX && this.currentPlayer === 'X') || (aiIsO && this.currentPlayer === 'O');
    console.log(`AI turn check: aiIsX=${aiIsX}, aiIsO=${aiIsO}, aiTurn=${aiTurn}`);
    
    if (!aiTurn) return;
    
    // Prevent multiple AI moves at the same time
    if (this.aiThinking) {
      console.log('AI already thinking, skipping...');
      return;
    }
    
    this.aiThinking = true;

    // Random delay between 500ms and 1000ms for more human-like AI behavior
    const aiDelay = Math.random() * 500 + 500; // 500-1000ms
    console.log(`AI thinking for ${aiDelay.toFixed(0)}ms...`);
    
    // Show AI thinking indicator
    this.showAIThinking();
    
    this.time.delayedCall(aiDelay, () => {
      if (this.isPaused || !this.gameActive) return;
      
      const board = this.boards[this.currentBoardIndex];
      if (this.boardFinished[this.currentBoardIndex]) return;
      
      const move = TicTacToeAI.makeMove(board.slice(), this.currentPlayer, this.aiDifficulty);
      if (move != null) {
        console.log(`AI making move: ${this.currentPlayer} at position ${move} on board ${this.currentBoardIndex}`);
        this.hideAIThinking(); // Hide thinking indicator
        this.aiThinking = false; // Reset thinking flag
        this.onCellClick(this.currentBoardIndex, move);
      } else {
        this.aiThinking = false; // Reset thinking flag even if no move found
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
    this.resetArena();
    
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

  startArena() {
    console.log('startArena() called');
    this.arenaMode = true;
    this.arenaGames = 0;
    this.arenaScore = { X: 0, O: 0, D: 0 };
    this.arenaStats = {
      totalMoves: 0,
      averageGameTime: 0,
      fastestWin: null,
      longestGame: null,
      gameHistory: []
    };
    
    console.log('Starting arena mode');
    console.log('Arena mode set to:', this.arenaMode);
    this.showArenaInfo();
    this.updateArenaInfo();
    this.updateArenaButtonState(true);
    this.startNextArenaGame();
  }

  startNextArenaGame() {
    console.log('startNextArenaGame() called');
    console.log('Current arena games:', this.arenaGames);
    console.log('Max arena games:', this.maxArenaGames);
    
    if (this.arenaGames >= this.maxArenaGames) {
      console.log('Arena games limit reached, ending arena');
      this.endArena();
      return;
    }

    this.arenaGames++;
    console.log(`Arena game ${this.arenaGames}/${this.maxArenaGames}`);
    
    // Ažuriraj arena info
    this.updateArenaInfo();
    
    // Reset for new game
    this.resetGame();
    this.gameActive = false; // Don't start timer until first move
    console.log('Next arena game ready');
  }

  handleArenaGameEnd(winner) {
    // Update arena score
    this.arenaScore[winner]++;
    
    // Calculate game statistics
    const gameTime = 120 - (this.timers.X + this.timers.O);
    const gameStats = {
      gameNumber: this.arenaGames,
      winner: winner,
      gameTime: gameTime,
      totalMoves: this.moveHistory.length,
      mode: this.mode
    };
    
    // Update arena statistics
    this.arenaStats.totalMoves += this.moveHistory.length;
    this.arenaStats.gameHistory.push(gameStats);
    
    // Update fastest win and longest game
    if (winner !== 'D') {
      if (!this.arenaStats.fastestWin || gameTime < this.arenaStats.fastestWin.gameTime) {
        this.arenaStats.fastestWin = gameStats;
      }
    }
    
    if (!this.arenaStats.longestGame || gameTime > this.arenaStats.longestGame.gameTime) {
      this.arenaStats.longestGame = gameStats;
    }
    
    // Calculate average game time
    this.arenaStats.averageGameTime = this.arenaStats.gameHistory.reduce((sum, game) => sum + game.gameTime, 0) / this.arenaStats.gameHistory.length;
    
    console.log(`Game ${this.arenaGames} ended. Winner: ${winner}`);
    console.log(`Arena score: X: ${this.arenaScore.X}, O: ${this.arenaScore.O}, D: ${this.arenaScore.D}`);
    
    // Ažuriraj arena info
    this.updateArenaInfo();
    
    // Show game result
    this.showArenaGameResult(winner);
    
    // Start next game after delay
    this.time.delayedCall(3000, () => {
      this.startNextArenaGame();
    });
  }

  showArenaGameResult(winner) {
    const gameOverDiv = document.getElementById('gameOver');
    const title = document.getElementById('gameOverTitle');
    const reasonElement = document.getElementById('gameOverReason');
    const scoreElement = document.getElementById('gameOverScore');
    
    title.textContent = `Arena Game ${this.arenaGames} Complete`;
    if (winner === 'D') {
      reasonElement.textContent = `Game ${this.arenaGames} ended in a draw!`;
      scoreElement.textContent = `Arena score - X: ${this.arenaScore.X}, O: ${this.arenaScore.O}, D: ${this.arenaScore.D}`;
    } else {
      reasonElement.textContent = `${winner} wins arena game ${this.arenaGames}!`;
      scoreElement.textContent = `Arena score - X: ${this.arenaScore.X}, O: ${this.arenaScore.O}, D: ${this.arenaScore.D}`;
    }
    
    gameOverDiv.style.display = 'block';
    
    // Auto-hide after 2.5 seconds
    setTimeout(() => {
      gameOverDiv.style.display = 'none';
    }, 2500);
  }

  stopArena() {
    this.arenaMode = false;
    this.arenaGames = 0;
    this.arenaScore = { X: 0, O: 0, D: 0 };
    
    console.log('Arena stopped by user');
    
    // Reset game state
    this.resetGame();
    
    // Hide arena info and show button
    this.hideArenaInfo();
    
    // Update arena button state
    this.updateArenaButtonState(false);
  }

  endArena() {
    this.arenaMode = false;
    
    const winner = this.arenaScore.X > this.arenaScore.O ? 'X' : 
                   this.arenaScore.O > this.arenaScore.X ? 'O' : 'Tie';
    
    const gameOverDiv = document.getElementById('gameOver');
    const title = document.getElementById('gameOverTitle');
    const reasonElement = document.getElementById('gameOverReason');
    const scoreElement = document.getElementById('gameOverScore');
    
    title.textContent = 'Arena Complete!';
    if (winner === 'Tie') {
      reasonElement.textContent = `Arena ended in a tie!`;
      scoreElement.textContent = `Final score - X: ${this.arenaScore.X}, O: ${this.arenaScore.O}, D: ${this.arenaScore.D}`;
    } else {
      reasonElement.textContent = `${winner} wins the arena!`;
      scoreElement.textContent = `Final score - X: ${this.arenaScore.X}, O: ${this.arenaScore.O}, D: ${this.arenaScore.D}`;
    }
    
    // Add detailed statistics
    const statsText = `
      Total moves: ${this.arenaStats.totalMoves}
      Average game time: ${this.formatTime(this.arenaStats.averageGameTime)}
      Fastest win: ${this.arenaStats.fastestWin ? `Game ${this.arenaStats.fastestWin.gameNumber} (${this.formatTime(this.arenaStats.fastestWin.gameTime)})` : 'N/A'}
      Longest game: ${this.arenaStats.longestGame ? `Game ${this.arenaStats.longestGame.gameNumber} (${this.formatTime(this.arenaStats.longestGame.gameTime)})` : 'N/A'}
    `;
    
    scoreElement.innerHTML = scoreElement.textContent + '<br><br>' + statsText;
    
    gameOverDiv.style.display = 'block';
    
    // Sakrij arena info i prikaži dugme
    this.hideArenaInfo();
    
    // Update arena button state
    this.updateArenaButtonState(false);
  }

  showArenaInfo() {
    console.log('showArenaInfo() called');
    // Sakrij dugme i prikaži arena info panel
    const arenaButton = document.getElementById('arena-button');
    const arenaInfo = document.getElementById('arena-info');
    
    console.log('arenaButton found:', !!arenaButton);
    console.log('arenaInfo found:', !!arenaInfo);
    
    if (arenaButton) {
      arenaButton.style.display = 'none';
      console.log('Arena button hidden');
    }
    if (arenaInfo) {
      arenaInfo.style.display = 'block';
      console.log('Arena info shown');
    }
    this.updateArenaInfo();
  }

  updateArenaInfo() {
    console.log('updateArenaInfo() called');
    // Ažuriraj HTML arena info panel
    const arenaProgress = document.getElementById('arenaProgress');
    const arenaXWins = document.getElementById('arenaXWins');
    const arenaOWins = document.getElementById('arenaOWins');
    const arenaDraws = document.getElementById('arenaDraws');
    
    console.log('arenaProgress found:', !!arenaProgress);
    console.log('arenaXWins found:', !!arenaXWins);
    console.log('arenaOWins found:', !!arenaOWins);
    console.log('arenaDraws found:', !!arenaDraws);
    
    if (arenaProgress) {
      arenaProgress.textContent = `${this.arenaGames}/${this.maxArenaGames}`;
      console.log('Progress updated to:', `${this.arenaGames}/${this.maxArenaGames}`);
    }
    if (arenaXWins) {
      arenaXWins.textContent = this.arenaScore.X;
      console.log('X wins updated to:', this.arenaScore.X);
    }
    if (arenaOWins) {
      arenaOWins.textContent = this.arenaScore.O;
      console.log('O wins updated to:', this.arenaScore.O);
    }
    if (arenaDraws) {
      arenaDraws.textContent = this.arenaScore.D;
      console.log('Draws updated to:', this.arenaScore.D);
    }
  }

  hideArenaInfo() {
    // Prikaži dugme i sakrij arena info panel
    const arenaButton = document.getElementById('arena-button');
    const arenaInfo = document.getElementById('arena-info');
    
    if (arenaButton) {
      arenaButton.style.display = 'block';
    }
    if (arenaInfo) {
      arenaInfo.style.display = 'none';
    }
  }

  updateReplayButton() {
    const btnReplay = document.getElementById('btnReplay');
    if (btnReplay) {
      btnReplay.disabled = this.moveHistory.length === 0;
    }
  }

  updateArenaButtonState(isActive) {
    console.log('updateArenaButtonState() called with isActive:', isActive);
    const arenaButton = document.getElementById('arena-button');
    const btnStopArena = document.getElementById('btnStopArena');
    const arenaStatus = document.getElementById('arenaStatus');
    
    console.log('arenaButton found:', !!arenaButton);
    console.log('btnStopArena found:', !!btnStopArena);
    console.log('arenaStatus found:', !!arenaStatus);
    
    if (arenaButton) {
      if (isActive) {
        arenaButton.classList.add('active');
        arenaButton.classList.remove('disabled');
        arenaButton.title = 'Arena in progress (Ctrl+Shift+A to stop)';
        if (arenaStatus) {
          arenaStatus.textContent = 'Arena Active';
        }
        console.log('Arena button set to active');
      } else {
        arenaButton.classList.remove('active');
        arenaButton.classList.remove('disabled');
        arenaButton.title = 'Start arena mode (Ctrl+A)';
        if (arenaStatus) {
          arenaStatus.textContent = 'Enter Arena';
        }
        console.log('Arena button set to inactive');
      }
    }

    if (btnStopArena) {
      btnStopArena.style.display = isActive ? 'block' : 'none';
      console.log('Stop arena button display set to:', isActive ? 'block' : 'none');
    }
  }

  showAIThinking() {
    // Add a subtle pulse effect to the current player indicator
    const currentPlayerElement = document.querySelector(`.player.${this.currentPlayer.toLowerCase()}`);
    if (currentPlayerElement) {
      currentPlayerElement.style.animation = 'ai-thinking 1s ease-in-out infinite';
    }
  }

  hideAIThinking() {
    // Remove the pulse effect
    const currentPlayerElement = document.querySelector(`.player.${this.currentPlayer.toLowerCase()}`);
    if (currentPlayerElement) {
      currentPlayerElement.style.animation = '';
    }
  }
}
