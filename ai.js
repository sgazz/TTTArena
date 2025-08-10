const TicTacToeAI = (function(){
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  // Check if board has a winner
  function checkWinner(board) {
    for (let combo of wins) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  // Check if board is full (draw)
  function isBoardFull(board) {
    return board.every(cell => cell !== null);
  }

  // Get available moves
  function getAvailableMoves(board) {
    return board.map((cell, index) => cell === null ? index : null).filter(index => index !== null);
  }

  // Evaluate board state with heuristic scoring
  function evaluateBoard(board, maximizingPlayer) {
    const winner = checkWinner(board);
    if (winner === maximizingPlayer) return 1000;
    if (winner === (maximizingPlayer === 'X' ? 'O' : 'X')) return -1000;
    
    // Heuristic evaluation for non-terminal states
    let score = 0;
    const minimizingPlayer = maximizingPlayer === 'X' ? 'O' : 'X';
    
    // Check each winning combination
    for (let combo of wins) {
      const [a, b, c] = combo;
      const cells = [board[a], board[b], board[c]];
      const maxCount = cells.filter(cell => cell === maximizingPlayer).length;
      const minCount = cells.filter(cell => cell === minimizingPlayer).length;
      const emptyCount = cells.filter(cell => cell === null).length;
      
      // Score based on potential
      if (maxCount === 2 && emptyCount === 1) score += 10;
      else if (maxCount === 1 && emptyCount === 2) score += 1;
      else if (minCount === 2 && emptyCount === 1) score -= 8;
      else if (minCount === 1 && emptyCount === 2) score -= 1;
    }
    
    return score;
  }

  // Minimax algorithm with alpha-beta pruning
  function minimax(board, depth, alpha, beta, isMaximizing, maximizingPlayer, maxDepth) {
    const winner = checkWinner(board);
    const isFull = isBoardFull(board);
    
    // Terminal conditions
    if (winner === maximizingPlayer) return 1000 - depth;
    if (winner === (maximizingPlayer === 'X' ? 'O' : 'X')) return depth - 1000;
    if (isFull || depth >= maxDepth) return evaluateBoard(board, maximizingPlayer);
    
    const availableMoves = getAvailableMoves(board);
    
    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let move of availableMoves) {
        board[move] = maximizingPlayer;
        const eval = minimax(board, depth + 1, alpha, beta, false, maximizingPlayer, maxDepth);
        board[move] = null; // Undo move
        maxEval = Math.max(maxEval, eval);
        alpha = Math.max(alpha, eval);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      const minimizingPlayer = maximizingPlayer === 'X' ? 'O' : 'X';
      for (let move of availableMoves) {
        board[move] = minimizingPlayer;
        const eval = minimax(board, depth + 1, alpha, beta, true, maximizingPlayer, maxDepth);
        board[move] = null; // Undo move
        minEval = Math.min(minEval, eval);
        beta = Math.min(beta, eval);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return minEval;
    }
  }

  // Find best move using minimax
  function findBestMove(board, symbol, maxDepth = 9) {
    const availableMoves = getAvailableMoves(board);
    let bestMove = null;
    let bestValue = -Infinity;
    const alpha = -Infinity;
    const beta = Infinity;
    
    for (let move of availableMoves) {
      board[move] = symbol;
      const moveValue = minimax(board, 0, alpha, beta, false, symbol, maxDepth);
      board[move] = null; // Undo move
      
      if (moveValue > bestValue) {
        bestValue = moveValue;
        bestMove = move;
      }
    }
    
    return bestMove;
  }

  // Simple winning move finder (for easy mode)
  function findWinningMove(board, symbol) {
    for (let combo of wins) {
      const [a, b, c] = combo;
      const triple = [board[a], board[b], board[c]];
      const countSym = triple.filter(x => x === symbol).length;
      const countEmpty = triple.filter(x => x === null).length;
      if (countSym === 2 && countEmpty === 1) {
        if (!board[a]) return a;
        if (!board[b]) return b;
        if (!board[c]) return c;
      }
    }
    return null;
  }

  // Block opponent's winning move
  function findBlockingMove(board, symbol) {
    const opponent = symbol === 'X' ? 'O' : 'X';
    return findWinningMove(board, opponent);
  }

  // Check for fork (opponent can win in two ways)
  function findFork(board, symbol) {
    const opponent = symbol === 'X' ? 'O' : 'X';
    let forkCount = 0;
    let forkMove = null;
    
    for (let move of getAvailableMoves(board)) {
      board[move] = opponent;
      let winCount = 0;
      
      for (let combo of wins) {
        const [a, b, c] = combo;
        const cells = [board[a], board[b], board[c]];
        if (cells.filter(cell => cell === opponent).length === 2 && 
            cells.filter(cell => cell === null).length === 1) {
          winCount++;
        }
      }
      
      if (winCount >= 2) {
        forkCount++;
        forkMove = move;
      }
      
      board[move] = null;
    }
    
    return forkCount >= 2 ? forkMove : null;
  }

  // Force opponent to block (create two winning opportunities)
  function findForkOpportunity(board, symbol) {
    for (let move of getAvailableMoves(board)) {
      board[move] = symbol;
      let winCount = 0;
      
      for (let combo of wins) {
        const [a, b, c] = combo;
        const cells = [board[a], board[b], board[c]];
        if (cells.filter(cell => cell === symbol).length === 2 && 
            cells.filter(cell => cell === null).length === 1) {
          winCount++;
        }
      }
      
      board[move] = null;
      
      if (winCount >= 2) {
        return move;
      }
    }
    
    return null;
  }

  // Strategic move priorities
  function getStrategicMoves() {
    return [4, 0, 2, 6, 8, 1, 3, 5, 7]; // Center, corners, edges
  }

  return {
    makeMove(board, symbol, difficulty = 'medium') {
      console.log(`AI making move for ${symbol} with difficulty: ${difficulty}`);
      
      // Check if this is the first move (empty board)
      const availableMoves = getAvailableMoves(board);
      if (availableMoves.length === 9) {
        // First move - prefer center for X, random for O
        if (symbol === 'X' && difficulty !== 'easy') {
          return 4; // Center is optimal for first player
        }
      }
      
      if (difficulty === 'easy') {
        // Easy AI - mostly random with basic strategy
        const availableMoves = getAvailableMoves(board);
        
        // 40% chance to make a strategic move
        if (Math.random() < 0.4) {
          // Try to win
          let move = findWinningMove(board, symbol);
          if (move !== null) return move;
          
          // Try to block opponent
          move = findBlockingMove(board, symbol);
          if (move !== null) return move;
          
          // Try center or corners
          const strategicMoves = getStrategicMoves();
          for (let strategicMove of strategicMoves) {
            if (board[strategicMove] === null) return strategicMove;
          }
        }
        
        // Random move
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      }
      
      if (difficulty === 'medium') {
        // Medium AI - balanced strategy with some advanced tactics
        
        // 1. Try to win immediately
        let move = findWinningMove(board, symbol);
        if (move !== null) return move;
        
        // 2. Block opponent's immediate win
        move = findBlockingMove(board, symbol);
        if (move !== null) return move;
        
        // 3. Use minimax with limited depth for complex situations
        const availableMoves = getAvailableMoves(board);
        if (availableMoves.length <= 4) {
          return findBestMove(board, symbol, 6);
        }
        
        return findBestMove(board, symbol, 3);
      }
      
      if (difficulty === 'hard') {
        // Hard AI - nearly unbeatable with advanced strategies
        
        // 1. Try to win immediately
        let move = findWinningMove(board, symbol);
        if (move !== null) return move;
        
        // 2. Block opponent's immediate win
        move = findBlockingMove(board, symbol);
        if (move !== null) return move;
        
        // 3. Create fork opportunity
        move = findForkOpportunity(board, symbol);
        if (move !== null) return move;
        
        // 4. Block opponent's fork
        move = findFork(board, symbol);
        if (move !== null) return move;
        
        // 5. Use minimax for complex situations
        return findBestMove(board, symbol, 9);
      }
      
      // Default to medium
      return findBestMove(board, symbol, 4);
    }
  };
})();
