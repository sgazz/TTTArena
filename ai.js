const TicTacToeAI = (function() {
  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  function checkWinner(board) {
    for (let [a, b, c] of wins) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  function getAvailableMoves(board) {
    return board.map((cell, i) => cell === null ? i : null).filter(i => i !== null);
  }

  function findWinningMove(board, symbol) {
    for (let [a, b, c] of wins) {
      const cells = [board[a], board[b], board[c]];
      const count = cells.filter(cell => cell === symbol).length;
      if (count === 2 && cells.includes(null)) {
        return [a, b, c].find(i => board[i] === null);
      }
    }
    return null;
  }

  function findBlockingMove(board, symbol) {
    return findWinningMove(board, symbol === 'X' ? 'O' : 'X');
  }

  function findStrategicMove(board) {
    for (let move of [4, 0, 2, 6, 8, 1, 3, 5, 7]) {
      if (board[move] === null) return move;
    }
    return null;
  }

  function findRandomMove(board) {
    const moves = getAvailableMoves(board);
    return moves.length ? moves[Math.floor(Math.random() * moves.length)] : null;
  }

  function minimax(board, player, ai, human, depth = 0, maxDepth = 3) {
    const availableMoves = getAvailableMoves(board);
    const winner = checkWinner(board);

    if (winner === human) return { score: -10 + depth };
    if (winner === ai) return { score: 10 - depth };
    if (!availableMoves.length || depth >= maxDepth) return { score: 0 };

    let moves = [];
    for (let move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = player;
      const result = minimax(newBoard, player === ai ? human : ai, ai, human, depth + 1, maxDepth);
      moves.push({ index: move, score: result.score });
    }

    return player === ai
      ? moves.reduce((best, m) => m.score > best.score ? m : best)
      : moves.reduce((best, m) => m.score < best.score ? m : best);
  }

  function ruleBasedMove(board, aiPlayer) {
    return findWinningMove(board, aiPlayer) ??
           findBlockingMove(board, aiPlayer) ??
           findStrategicMove(board) ??
           findRandomMove(board);
  }

  const difficultySettings = {
    easy:    { smartChance: 0.3, minimaxDepth: 0 }, // mostly random
    medium:  { smartChance: 0.5, minimaxDepth: 2 }, // balanced
    hard:    { smartChance: 0.9, minimaxDepth: 6 }  // mostly minimax
  };

  return {
    makeMove(board, symbol, difficulty = 'medium') {
      const { smartChance, minimaxDepth } = difficultySettings[difficulty] || difficultySettings.medium;
      const aiPlayer = symbol;
      const humanPlayer = symbol === 'X' ? 'O' : 'X';
      const availableMoves = getAvailableMoves(board);

      console.log(`=== AI MOVE DEBUG ===`);
      console.log(`AI making move for ${symbol} with difficulty: ${difficulty}`);
      console.log(`Board state:`, board);
      console.log(`Available moves:`, availableMoves);
      console.log(`Smart chance: ${smartChance}, Minimax depth: ${minimaxDepth}`);

      if (availableMoves.length === 9 && symbol === 'X' && difficulty !== 'easy') {
        console.log('First move optimization: choosing center (4)');
        return 4; // center first move
      }

      if (Math.random() < smartChance) {
        if (minimaxDepth > 0) {
          console.log(`${difficulty} AI: Using minimax strategy (depth ${minimaxDepth})`);
          const result = minimax(board, aiPlayer, aiPlayer, humanPlayer, 0, minimaxDepth);
          const move = result.index ?? findRandomMove(board);
          console.log(`Minimax chose move: ${move} with score: ${result.score}`);
          return move;
        }
        console.log(`${difficulty} AI: Using rule-based strategy`);
        const move = ruleBasedMove(board, aiPlayer);
        console.log(`Rule-based chose move: ${move}`);
        return move;
      }
      
      console.log(`${difficulty} AI: Using random move`);
      const move = findRandomMove(board);
      console.log(`Random chose move: ${move}`);
      console.log(`=== END AI MOVE DEBUG ===`);
      return move;
    }
  };
})();
