const TicTacToeAI = (function(){
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  function findWinningMove(board, symbol) {
    for (let combo of wins) {
      const [a,b,c] = combo;
      const triple = [board[a], board[b], board[c]];
      const countSym = triple.filter(x=>x===symbol).length;
      const countEmpty = triple.filter(x=>x==null).length;
      if (countSym === 2 && countEmpty === 1) {
        if (!board[a]) return a;
        if (!board[b]) return b;
        if (!board[c]) return c;
      }
    }
    return null;
  }

  function bestMovesOrder() {
    return [4,0,2,6,8,1,3,5,7];
  }

  return {
    makeMove(board, symbol, difficulty = 'medium') {
      if (difficulty === 'easy') {
        // Easy AI - random moves with some strategy
        const availableMoves = [];
        for (let i = 0; i < 9; i++) {
          if (!board[i]) availableMoves.push(i);
        }
        
        // 30% chance to make a good move, 70% random
        if (Math.random() < 0.3) {
          let m = findWinningMove(board, symbol);
          if (m != null) return m;
          
          const opp = symbol === 'X' ? 'O' : 'X';
          m = findWinningMove(board, opp);
          if (m != null) return m;
        }
        
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      }
      
      if (difficulty === 'hard') {
        // Hard AI - perfect play with some randomization
        let m = findWinningMove(board, symbol);
        if (m != null) return m;
        
        const opp = symbol === 'X' ? 'O' : 'X';
        m = findWinningMove(board, opp);
        if (m != null) return m;
        
        // Prefer center and corners
        const preferredMoves = [4, 0, 2, 6, 8, 1, 3, 5, 7];
        for (let idx of preferredMoves) {
          if (!board[idx]) return idx;
        }
        return null;
      }
      
      // Medium AI - default behavior
      let m = findWinningMove(board, symbol);
      if (m != null) return m;
      
      const opp = symbol === 'X' ? 'O' : 'X';
      m = findWinningMove(board, opp);
      if (m != null) return m;
      
      for (let idx of bestMovesOrder()) {
        if (!board[idx]) return idx;
      }
      return null;
    }
  };
})();
