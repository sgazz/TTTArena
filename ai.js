const TicTacToeAI = (function() {
  // Winning combinations
  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  // Check if there's a winner
  function checkWinner(board) {
    for (let combo of wins) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  // Check if board is full
  function isBoardFull(board) {
    return board.every(cell => cell !== null);
  }

  // Get available moves
  function getAvailableMoves(board) {
    return board.map((cell, index) => cell === null ? index : null).filter(index => index !== null);
  }

  // Find winning move for a player
  function findWinningMove(board, symbol) {
    console.log(`findWinningMove called for ${symbol}, board:`, board);
    for (let combo of wins) {
      const [a, b, c] = combo;
      const cells = [board[a], board[b], board[c]];
      const symbolCount = cells.filter(cell => cell === symbol).length;
      const emptyCount = cells.filter(cell => cell === null).length;
      
      if (symbolCount === 2 && emptyCount === 1) {
        if (board[a] === null) {
          console.log(`Winning move found: ${a}`);
          return a;
        }
        if (board[b] === null) {
          console.log(`Winning move found: ${b}`);
          return b;
        }
        if (board[c] === null) {
          console.log(`Winning move found: ${c}`);
          return c;
        }
      }
    }
    console.log('No winning move found');
    return null;
  }

  // Find blocking move (block opponent's win)
  function findBlockingMove(board, symbol) {
    const opponent = symbol === 'X' ? 'O' : 'X';
    return findWinningMove(board, opponent);
  }

  // Get strategic moves in order of preference
  function getStrategicMoves() {
    return [4, 0, 2, 6, 8, 1, 3, 5, 7]; // Center, corners, edges
  }

  // Find best strategic move
  function findStrategicMove(board) {
    console.log(`findStrategicMove called, board:`, board);
    const strategicMoves = getStrategicMoves();
    for (let move of strategicMoves) {
      if (board[move] === null) {
        console.log(`Strategic move found: ${move}`);
        return move;
      }
    }
    console.log('No strategic move found');
    return null;
  }

  // Find random move
  function findRandomMove(board) {
    const availableMoves = getAvailableMoves(board);
    if (availableMoves.length === 0) return null;
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  return {
    makeMove(board, symbol, difficulty = 'medium') {
      console.log(`=== AI MOVE DEBUG ===`);
      console.log(`AI making move for ${symbol} with difficulty: ${difficulty}`);
      console.log(`Board state:`, board);
      console.log(`Available moves:`, getAvailableMoves(board));
      
      // Check if this is the first move (empty board)
      const availableMoves = getAvailableMoves(board);
      if (availableMoves.length === 9) {
        // First move - prefer center for X, random for O
        if (symbol === 'X' && difficulty !== 'easy') {
          return 4; // Center is optimal for first player
        }
      }
      
      if (difficulty === 'easy') {
        // Easy AI - mostly random with some basic strategy
        const availableMoves = getAvailableMoves(board);
        
        // 30% chance to make a strategic move
        if (Math.random() < 0.3) {
          // Try to win
          let move = findWinningMove(board, symbol);
          if (move !== null) return move;
          
          // Try to block opponent
          move = findBlockingMove(board, symbol);
          if (move !== null) return move;
          
          // Try strategic move
          move = findStrategicMove(board);
          if (move !== null) return move;
        }
        
        // Random move
        return findRandomMove(board);
      }
      
      if (difficulty === 'medium') {
        // Medium AI - balanced strategy
        
        // 1. Try to win immediately
        let move = findWinningMove(board, symbol);
        if (move !== null) return move;
        
        // 2. Block opponent's immediate win
        move = findBlockingMove(board, symbol);
        if (move !== null) return move;
        
        // 3. Try strategic move
        move = findStrategicMove(board);
        if (move !== null) return move;
        
        // 4. Random move
        return findRandomMove(board);
      }
      
      if (difficulty === 'hard') {
        // Hard AI - nearly unbeatable
        console.log('Hard AI logic started');
        
        // 1. Try to win immediately
        let move = findWinningMove(board, symbol);
        if (move !== null) {
          console.log('Hard AI: Found winning move');
          return move;
        }
        console.log('Hard AI: No winning move found');
        
        // 2. Block opponent's immediate win
        move = findBlockingMove(board, symbol);
        if (move !== null) {
          console.log('Hard AI: Found blocking move');
          return move;
        }
        console.log('Hard AI: No blocking move needed');
        
        // 3. Try to create fork opportunity (two winning ways)
        for (let moveIndex of getAvailableMoves(board)) {
          board[moveIndex] = symbol;
          let winCount = 0;
          
          for (let combo of wins) {
            const [a, b, c] = combo;
            const cells = [board[a], board[b], board[c]];
            if (cells.filter(cell => cell === symbol).length === 2 && 
                cells.filter(cell => cell === null).length === 1) {
              winCount++;
            }
          }
          
          board[moveIndex] = null; // Undo move
          
          if (winCount >= 2) {
            return moveIndex;
          }
        }
        
        // 4. Block opponent's fork
        const opponent = symbol === 'X' ? 'O' : 'X';
        for (let moveIndex of getAvailableMoves(board)) {
          board[moveIndex] = opponent;
          let winCount = 0;
          
          for (let combo of wins) {
            const [a, b, c] = combo;
            const cells = [board[a], board[b], board[c]];
            if (cells.filter(cell => cell === opponent).length === 2 && 
                cells.filter(cell => cell === null).length === 1) {
              winCount++;
            }
          }
          
          board[moveIndex] = null; // Undo move
          
          if (winCount >= 2) {
            return moveIndex;
          }
        }
        
        // 5. Try strategic move
        move = findStrategicMove(board);
        if (move !== null) {
          console.log('Hard AI: Found strategic move');
          return move;
        }
        console.log('Hard AI: No strategic move found');
        
        // 6. Random move
        console.log('Hard AI: Using random move');
        return findRandomMove(board);
      }
      
      console.log(`=== END AI MOVE DEBUG ===`);
      return findRandomMove(board);
    }
  };
})();
