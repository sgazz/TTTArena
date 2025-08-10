// Check if Phaser is loaded
if (typeof Phaser === 'undefined') {
  console.error('Phaser is not loaded!');
} else {
  console.log('Phaser loaded successfully');
}

// Check if GameScene is defined
if (typeof GameScene === 'undefined') {
  console.error('GameScene is not defined!');
} else {
  console.log('GameScene loaded successfully');
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: 0x0a0a0a,
  width: 1200,
  height: 900,
  parent: 'game-container',
  scene: [ GameScene ]
};

const game = new Phaser.Game(config);
console.log('Phaser game created:', game);
console.log('Canvas element:', document.querySelector('canvas'));

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, starting game...');
  
  // Start the game scene
  console.log('Starting GameScene...');
  game.scene.start('GameScene');
  console.log('GameScene started');
  
  // Button references
  const btnPvP = document.getElementById('btnPvP');
  const btnPvAI = document.getElementById('btnPvAI');
  const btnAIvP = document.getElementById('btnAIvP');
  const btnNewGame = document.getElementById('btnNewGame');
  const btnReset = document.getElementById('btnReset');
  const btnPause = document.getElementById('btnPause');
  const btnReplay = document.getElementById('btnReplay');
  const btnCloseGameOver = document.getElementById('btnCloseGameOver');

  // Helper function to get game scene
  function getGameScene() {
    const scene = game.scene.keys['GameScene'];
    if (!scene) {
      console.error('GameScene not found');
      return null;
    }
    return scene;
  }

  // Helper function to show error message
  function showError(message) {
    console.error(message);
    // You could add a toast notification here
  }

  // Helper function to confirm action
  function confirmAction(message) {
    return confirm(message);
  }

  // Mode buttons
  const modeButtons = [btnPvP, btnPvAI, btnAIvP];
  
  function setActiveMode(activeButton) {
    modeButtons.forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
  }

  btnPvP.onclick = () => {
    console.log('PvP clicked');
    const scene = getGameScene();
    if (scene) {
      scene.setMode('PvP');
      setActiveMode(btnPvP);
    }
  };

  btnPvAI.onclick = () => {
    console.log('PvAI clicked');
    const scene = getGameScene();
    if (scene) {
      scene.setMode('PvAI');
      setActiveMode(btnPvAI);
    }
  };

  btnAIvP.onclick = () => {
    console.log('AIvP clicked');
    const scene = getGameScene();
    if (scene) {
      scene.setMode('AIvP');
      setActiveMode(btnAIvP);
    }
  };

  // New Game button
  btnNewGame.onclick = () => {
    if (confirmAction('Are you sure you want to start a new game? This will reset everything.')) {
      console.log('New Game clicked');
      location.reload();
    }
  };

  // Reset button
  btnReset.onclick = () => {
    if (confirmAction('Are you sure you want to reset the current game?')) {
      console.log('Reset clicked');
      const scene = getGameScene();
      if (scene) {
        scene.resetGame();
      }
    }
  };

  // Pause button
  btnPause.onclick = () => {
    console.log('Pause clicked');
    const scene = getGameScene();
    if (scene) {
      scene.togglePause();
    }
  };

  // Replay button
  btnReplay.onclick = () => {
    console.log('Replay clicked');
    const scene = getGameScene();
    if (scene) {
      if (scene.moveHistory.length === 0) {
        showError('No moves to replay');
        return;
      }
      scene.startReplay();
    }
  };

  // Close Game Over modal
  btnCloseGameOver.onclick = () => {
    const gameOverDiv = document.getElementById('gameOver');
    if (gameOverDiv) {
      gameOverDiv.style.display = 'none';
    }
  };

  // AI difficulty buttons
  const aiButtons = document.querySelectorAll('.ai-btn');
  aiButtons.forEach(btn => {
    btn.onclick = () => {
      // Remove active class from all buttons
      aiButtons.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');
      
      const scene = getGameScene();
      if (scene) {
        scene.setAIDifficulty(btn.dataset.level);
      }
    };
  });

  // Tournament button click handler
  const tournamentButton = document.getElementById('tournament-button');
  const btnStopTournament = document.getElementById('btnStopTournament');
  
  if (tournamentButton) {
    tournamentButton.onclick = () => {
      const scene = getGameScene();
      if (!scene) return;

      // Check if game is in progress
      if (scene.gameActive && !scene.isPaused) {
        if (!confirmAction('Game is in progress. Do you want to start tournament anyway? This will reset the current game.')) {
          return;
        }
      }

      if (confirmAction('Start tournament mode? This will play 5 games and track the overall winner.')) {
        scene.startTournament();
        updateTournamentButtonState(true);
      }
    };
  }

  if (btnStopTournament) {
    btnStopTournament.onclick = () => {
      const scene = getGameScene();
      if (!scene) return;

      if (confirmAction('Stop tournament? This will end the current tournament.')) {
        scene.stopTournament();
        updateTournamentButtonState(false);
      }
    };
  }

  function updateTournamentButtonState(isActive) {
    if (tournamentButton) {
      if (isActive) {
        tournamentButton.classList.add('active');
        tournamentButton.classList.remove('disabled');
        tournamentButton.title = 'Tournament in progress (Ctrl+Shift+T to stop)';
      } else {
        tournamentButton.classList.remove('active');
        tournamentButton.classList.remove('disabled');
        tournamentButton.title = 'Start tournament mode (Ctrl+T)';
      }
    }

    if (btnStopTournament) {
      btnStopTournament.style.display = isActive ? 'block' : 'none';
    }
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (event) => {
    // Don't trigger shortcuts if user is typing in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    const scene = getGameScene();
    if (!scene) return;

    switch (event.key) {
      case ' ':
        event.preventDefault();
        scene.togglePause();
        break;
      case 'r':
      case 'R':
        if (event.ctrlKey) {
          event.preventDefault();
          if (confirmAction('Are you sure you want to reset the current game?')) {
            scene.resetGame();
          }
        }
        break;
      case 'n':
      case 'N':
        if (event.ctrlKey) {
          event.preventDefault();
          if (confirmAction('Are you sure you want to start a new game? This will reset everything.')) {
            location.reload();
          }
        }
        break;
      case '1':
        if (event.ctrlKey) {
          event.preventDefault();
          scene.setMode('PvP');
          setActiveMode(btnPvP);
        }
        break;
      case '2':
        if (event.ctrlKey) {
          event.preventDefault();
          scene.setMode('PvAI');
          setActiveMode(btnPvAI);
        }
        break;
      case '3':
        if (event.ctrlKey) {
          event.preventDefault();
          scene.setMode('AIvP');
          setActiveMode(btnAIvP);
        }
        break;
      case 't':
      case 'T':
        if (event.ctrlKey) {
          event.preventDefault();
          if (event.shiftKey) {
            // Stop tournament
            if (btnStopTournament && btnStopTournament.style.display !== 'none') {
              btnStopTournament.click();
            }
          } else {
            // Start tournament
            tournamentButton.click();
          }
        }
        break;
    }
  });

  // Set initial active mode
  setActiveMode(btnPvP);
});
