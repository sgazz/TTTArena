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
  const btnSound = document.getElementById('btnSound');
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

  // Custom confirmation modal
  function showConfirmModal(title, message, onConfirm, onCancel) {
    const modal = document.getElementById('confirmModal');
    const titleElement = document.getElementById('confirmTitle');
    const messageElement = document.getElementById('confirmMessage');
    const yesButton = document.getElementById('btnConfirmYes');
    const noButton = document.getElementById('btnConfirmNo');

    if (modal && titleElement && messageElement && yesButton && noButton) {
      titleElement.textContent = title;
      messageElement.textContent = message;
      
      // Show modal
      modal.style.display = 'flex';
      
      // Set up event listeners
      const handleYes = () => {
        modal.style.display = 'none';
        yesButton.removeEventListener('click', handleYes);
        noButton.removeEventListener('click', handleNo);
        if (onConfirm) onConfirm();
      };
      
      const handleNo = () => {
        modal.style.display = 'none';
        yesButton.removeEventListener('click', handleYes);
        noButton.removeEventListener('click', handleNo);
        if (onCancel) onCancel();
      };
      
      yesButton.addEventListener('click', handleYes);
      noButton.addEventListener('click', handleNo);
      
      // Focus on Yes button
      yesButton.focus();
    }
  }

  // Helper function to confirm action
  function confirmAction(message) {
    return new Promise((resolve) => {
      showConfirmModal('Confirm Action', message, () => resolve(true), () => resolve(false));
    });
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
  btnNewGame.onclick = async () => {
    const confirmed = await confirmAction('Are you sure you want to start a new game? This will reset everything.');
    if (confirmed) {
      console.log('New Game clicked');
      location.reload();
    }
  };

  // Reset button
  btnReset.onclick = async () => {
    const confirmed = await confirmAction('Are you sure you want to reset the current game?');
    if (confirmed) {
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

  // Arena button click handler
  const arenaButton = document.getElementById('arena-button');
  const btnStopArena = document.getElementById('btnStopArena');
  
  if (arenaButton) {
    arenaButton.onclick = async () => {
      const scene = getGameScene();
      if (!scene) return;

      // Check if game is in progress
      if (scene.gameActive && !scene.isPaused) {
        const continueAnyway = await confirmAction('Game is in progress. Do you want to start arena mode anyway? This will reset the current game.');
        if (!continueAnyway) {
          return;
        }
      }

      const startArena = await confirmAction('Start arena mode? This will play 5 games and track the overall winner with detailed statistics. You need to select a game mode (PvP/PvAI/AIvP) first.');
      if (startArena) {
        // Check if a mode is selected
        const activeModeButton = document.querySelector('.mode-btn.active');
        if (!activeModeButton) {
          alert('Please select a game mode (PvP, PvAI, or AIvP) before starting Arena mode.');
          return;
        }
        
        const selectedMode = activeModeButton.dataset.mode;
        console.log('Starting arena mode with selected mode:', selectedMode);
        scene.startArena(selectedMode);
      }
    };
  }

  if (btnStopArena) {
    btnStopArena.onclick = async () => {
      const scene = getGameScene();
      if (!scene) return;

      const stopArena = await confirmAction('Stop arena? This will end the current arena session.');
      if (stopArena) {
        scene.stopArena();
      }
    };
  }



  // Keyboard shortcuts
  document.addEventListener('keydown', (event) => {
    // Don't trigger shortcuts if user is typing in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    // Check if confirmation modal is open
    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal && confirmModal.style.display === 'flex') {
      const yesButton = document.getElementById('btnConfirmYes');
      const noButton = document.getElementById('btnConfirmNo');
      
      if (event.key === 'Enter' && yesButton) {
        event.preventDefault();
        yesButton.click();
        return;
      }
      
      if (event.key === 'Escape' && noButton) {
        event.preventDefault();
        noButton.click();
        return;
      }
      
      // Don't process other shortcuts when modal is open
      return;
    }

    // Check if pause overlay is open
    const pauseOverlay = document.getElementById('pauseOverlay');
    if (pauseOverlay && pauseOverlay.style.display === 'flex') {
      if (event.key === ' ') {
        event.preventDefault();
        const scene = getGameScene();
        if (scene && scene.isPaused) {
          scene.togglePause();
        }
        return;
      }
      
      // Don't process other shortcuts when pause overlay is open
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
          confirmAction('Are you sure you want to reset the current game?').then(confirmed => {
            if (confirmed) {
              scene.resetGame();
            }
          });
        }
        break;
      case 'n':
      case 'N':
        if (event.ctrlKey) {
          event.preventDefault();
          confirmAction('Are you sure you want to start a new game? This will reset everything.').then(confirmed => {
            if (confirmed) {
              location.reload();
            }
          });
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
      case 'a':
      case 'A':
        if (event.ctrlKey) {
          event.preventDefault();
          if (event.shiftKey) {
            // Stop arena
            if (btnStopArena && btnStopArena.style.display !== 'none') {
              btnStopArena.click();
            }
          } else {
            // Start arena
            arenaButton.click();
          }
        }
        break;
      case 'h':
      case 'H':
        if (event.ctrlKey) {
          event.preventDefault();
          toggleFooter();
        }
        break;
      case 's':
      case 'S':
        if (event.ctrlKey) {
          event.preventDefault();
          toggleSound();
        }
        break;
    }
  });

  // Set initial active mode
  setActiveMode(btnPvP);

  // Add click handler for pause overlay
  const pauseOverlay = document.getElementById('pauseOverlay');
  if (pauseOverlay) {
    pauseOverlay.addEventListener('click', () => {
      const scene = getGameScene();
      if (scene && scene.isPaused) {
        scene.togglePause();
      }
    });
  }

  // Sound toggle functionality
  let soundEnabled = true;
  
  function toggleSound() {
    soundEnabled = !soundEnabled;
    const scene = getGameScene();
    if (scene) {
      scene.soundEnabled = soundEnabled;
    }
    
    if (btnSound) {
      btnSound.textContent = soundEnabled ? 'SOUND ON/OFF' : 'SOUND ON/OFF';
      btnSound.classList.toggle('muted', !soundEnabled);
    }
  }

  // Add sound button event listener
  if (btnSound) {
    btnSound.addEventListener('click', toggleSound);
  }

  // Footer toggle functionality
  function toggleFooter() {
    const footer = document.getElementById('footer');
    if (footer) {
      const isVisible = footer.style.display !== 'none';
      footer.style.display = isVisible ? 'none' : 'block';
      console.log(`Footer ${isVisible ? 'hidden' : 'shown'}`);
    }
  }
});
