# XO Arena - Tournament Game

Web-based game with 9 boards for XO (Tic-Tac-Toe) tournament using Phaser.js framework with timer system.

## Key Rules

### 1. 9 independent boards played in rotation
- Game takes place on 9 mini boards organized in a 3x3 grid
- X → O → next board (circular movement)

### 2. Board reset after victory
- **Winner** → board is cleared and a new match starts on it
- **Loser** → plays first in the new match on that board
- **Draw** → X plays first in the new match

### 3. Chess-like timer system
- **Start**: 1 minute per player
- **Victory**: +15 seconds to winner, -10 seconds to loser
- **Draw**: +5 seconds to both players
- **Winner**: The one who doesn't run out of time

### 4. Game modes
- **PvP**: Human vs Human
- **PvAI**: Human (X) vs AI (O)
- **AIvP**: AI (X) vs Human (O)

## Features

- **9 boards**: Mini XO games in 3x3 grid
- **Timer system**: Chess timer with bonus/penalty system
- **Reset system**: Board resets after victory
- **AI opponent**: Smart AI that looks for winning moves
- **Animations**: Blinking winning cells
- **Scoreboard**: Display of results, time and bonus/penalty seconds
- **Game Over screen**: Final tournament result

## How to Play

1. Open `index.html` in a web browser
2. Choose game mode (PvP, PvAI, AIvP)
3. Click on the active board (marked in yellow)
4. Place X or O in an empty cell
5. After victory on a board, the board resets and the loser plays first
6. Tournament ends when one player runs out of time
7. Winner is the one who doesn't run out of time

## Controls

- **PvP**: Switch between game modes
- **PvAI**: Play as X against AI
- **AIvP**: AI plays as X against you
- **Reset**: Reset current tournament

## Technologies

- **Phaser.js 3**: Game framework
- **HTML5 Canvas**: Rendering
- **Vanilla JavaScript**: Game logic

## File Structure

- `index.html` - Main HTML file with UI and scoreboard
- `main.js` - Phaser configuration and UI controls
- `GameScene.js` - Main game logic with timer system
- `ai.js` - AI algorithm for opponent
- `README.md` - Game instructions

## Sounds and Animations

- **Sounds**: Placeholder for move, win, draw sounds
- **Animations**: Blinking winning cells (4 times)
- **Scoreboard**: Bonus/penalty info blinks for 1 second
- **Game Over**: Modal with final result
