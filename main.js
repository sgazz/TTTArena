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
  
  const btnPvP = document.getElementById('btnPvP');
  const btnPvAI = document.getElementById('btnPvAI');
  const btnAIvP = document.getElementById('btnAIvP');
  const btnReset = document.getElementById('btnReset');

  btnPvP.onclick = () => {
    console.log('PvP clicked');
    const s = game.scene.keys['GameScene'];
    if (s) {
      s.setMode('PvP');
    } else {
      console.error('GameScene not found');
    }
  };
  btnPvAI.onclick = () => {
    console.log('PvAI clicked');
    const s = game.scene.keys['GameScene'];
    if (s) {
      s.setMode('PvAI');
    } else {
      console.error('GameScene not found');
    }
  };
  btnAIvP.onclick = () => {
    console.log('AIvP clicked');
    const s = game.scene.keys['GameScene'];
    if (s) {
      s.setMode('AIvP');
    } else {
      console.error('GameScene not found');
    }
  };
  btnReset.onclick = () => {
    console.log('Reset clicked');
    const s = game.scene.keys['GameScene'];
    if (s) {
      s.resetTournament();
    } else {
      console.error('GameScene not found');
    }
  };

  const btnPause = document.getElementById('btnPause');
  btnPause.onclick = () => {
    console.log('Pause clicked');
    const s = game.scene.keys['GameScene'];
    if (s) {
      s.togglePause();
    } else {
      console.error('GameScene not found');
    }
  };

  const btnReplay = document.getElementById('btnReplay');
  btnReplay.onclick = () => {
    console.log('Replay clicked');
    const s = game.scene.keys['GameScene'];
    if (s) {
      s.startReplay();
    } else {
      console.error('GameScene not found');
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
      
      const s = game.scene.keys['GameScene'];
      if (s) {
        s.setAIDifficulty(btn.dataset.level);
      }
    };
  });

  // Tournament button click handler
  const tournamentButton = document.getElementById('tournament-button');
  
  if (tournamentButton) {
    tournamentButton.onclick = () => {
      const s = game.scene.keys['GameScene'];
      if (s) {
        s.startTournament();
      } else {
        console.error('GameScene not found');
      }
    };
  }

  // New Game button handler
  const btnNewGame = document.getElementById('btnNewGame');
  if (btnNewGame) {
    btnNewGame.onclick = () => {
      location.reload();
    };
  }
});
