import React, { useState, useEffect, useCallback } from 'react';
import './SnakeGame.css';

const SnakeGame = ({ settings, onBackToMenu }) => {
  const [snake1, setSnake1] = useState([{ x: 5, y: 10 }]);
  const [snake2, setSnake2] = useState([{ x: 15, y: 10 }]);
  const [food, setFood] = useState({ x: 10, y: 10 });
  const [powerUp, setPowerUp] = useState(null);
  const [direction1, setDirection1] = useState({ x: 0, y: 0 });
  const [direction2, setDirection2] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const gridSize = settings.gridSize;

  // Generate random position for food/power-ups
  const generateRandomPosition = useCallback(() => {
    return {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
  }, [gridSize]);

  // Generate new food position
  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = generateRandomPosition();
    } while (
      snake1.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
      snake2.some(segment => segment.x === newFood.x && segment.y === newFood.y)
    );
    setFood(newFood);
  }, [snake1, snake2, generateRandomPosition]);

  // Generate power-up occasionally
  const generatePowerUp = useCallback(() => {
    if (settings.powerUps && Math.random() < 0.3) {
      let newPowerUp;
      do {
        newPowerUp = generateRandomPosition();
      } while (
        snake1.some(segment => segment.x === newPowerUp.x && segment.y === newPowerUp.y) ||
        snake2.some(segment => segment.x === newPowerUp.x && segment.y === newPowerUp.y) ||
        (newPowerUp.x === food.x && newPowerUp.y === food.y)
      );
      setPowerUp(newPowerUp);
    }
  }, [settings.powerUps, snake1, snake2, food, generateRandomPosition]);

  // Move snake function
  const moveSnake = useCallback((snake, direction, setSnake, setScore, player) => {
    if (gameOver || !gameStarted || (direction.x === 0 && direction.y === 0)) return snake;

    const newSnake = [...snake];
    const head = { ...newSnake[0] };
    
    head.x += direction.x;
    head.y += direction.y;

    // Wall collision
    if (settings.walls) {
      if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        setGameOver(true);
        setWinner(player === 1 ? 'Player 2' : 'Player 1');
        return snake;
      }
    } else {
      // Wrap around
      head.x = (head.x + gridSize) % gridSize;
      head.y = (head.y + gridSize) % gridSize;
    }

    // Self collision
    if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      setWinner(player === 1 ? 'Player 2' : 'Player 1');
      return snake;
    }

    // Collision with other snake
    const otherSnake = player === 1 ? snake2 : snake1;
    if (otherSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      setWinner(player === 1 ? 'Player 2' : 'Player 1');
      return snake;
    }

    newSnake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
      setScore(prev => prev + 10);
      generateFood();
      generatePowerUp();
    } else {
      newSnake.pop();
    }

    // Check power-up collision
    if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
      setScore(prev => prev + 50);
      setPowerUp(null);
    }

    return newSnake;
  }, [gameOver, gameStarted, settings.walls, gridSize, food, powerUp, snake1, snake2, generateFood, generatePowerUp]);

  // Move both snakes
  const moveSnakes = useCallback(() => {
    if (gameOver || !gameStarted) return;

    setSnake1(prevSnake => moveSnake(prevSnake, direction1, setSnake1, setScore1, 1));
    setSnake2(prevSnake => moveSnake(prevSnake, direction2, setSnake2, setScore2, 2));
  }, [direction1, direction2, gameOver, gameStarted, moveSnake]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted) {
        if (e.key === ' ') {
          setGameStarted(true);
        }
        return;
      }

      // Player 1 controls (WASD)
      switch (e.key.toLowerCase()) {
        case 'w':
          if (direction1.y === 0) setDirection1({ x: 0, y: -1 });
          break;
        case 's':
          if (direction1.y === 0) setDirection1({ x: 0, y: 1 });
          break;
        case 'a':
          if (direction1.x === 0) setDirection1({ x: -1, y: 0 });
          break;
        case 'd':
          if (direction1.x === 0) setDirection1({ x: 1, y: 0 });
          break;
      }

      // Player 2 controls (Arrow Keys)
      switch (e.key) {
        case 'ArrowUp':
          if (direction2.y === 0) setDirection2({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction2.y === 0) setDirection2({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction2.x === 0) setDirection2({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction2.x === 0) setDirection2({ x: 1, y: 0 });
          break;
        case 'Escape':
          onBackToMenu();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction1, direction2, gameStarted, onBackToMenu]);

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      moveSnakes();
    }, settings.speed);

    return () => clearInterval(gameLoop);
  }, [moveSnakes, settings.speed]);

  // Reset game
  const resetGame = () => {
    setSnake1([{ x: 5, y: 10 }]);
    setSnake2([{ x: 15, y: 10 }]);
    setFood({ x: 10, y: 10 });
    setPowerUp(null);
    setDirection1({ x: 0, y: 0 });
    setDirection2({ x: 0, y: 0 });
    setScore1(0);
    setScore2(0);
    setGameOver(false);
    setWinner(null);
    setGameStarted(false);
  };

  return (
    <div className="snake-game">
      <div className="game-header">
        <div className="scores">
          <div className="score player1">Player 1 (WASD): {score1}</div>
          <div className="score player2">Player 2 (Arrow Keys): {score2}</div>
        </div>
        <button onClick={onBackToMenu} className="back-button">
          Back to Menu
        </button>
      </div>

      <div 
        className="game-board"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);
          
          let cellClass = 'cell';
          
          // Check if cell contains snake 1
          if (snake1.some(segment => segment.x === x && segment.y === y)) {
            cellClass += snake1[0].x === x && snake1[0].y === y ? ' snake1-head' : ' snake1-body';
          }
          // Check if cell contains snake 2
          else if (snake2.some(segment => segment.x === x && segment.y === y)) {
            cellClass += snake2[0].x === x && snake2[0].y === y ? ' snake2-head' : ' snake2-body';
          }
          // Check if cell contains food
          else if (food.x === x && food.y === y) {
            cellClass += ' food';
          }
          // Check if cell contains power-up
          else if (powerUp && powerUp.x === x && powerUp.y === y) {
            cellClass += ' power-up';
          }

          return <div key={index} className={cellClass}></div>;
        })}
      </div>

      {!gameStarted && !gameOver && (
        <div className="game-message">
          <h2>Press SPACE to Start</h2>
          <div className="controls">
            <p><strong>Player 1:</strong> W/A/S/D keys</p>
            <p><strong>Player 2:</strong> Arrow keys</p>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <h3>{winner} Wins!</h3>
          <div className="final-scores">
            <p>Player 1: {score1}</p>
            <p>Player 2: {score2}</p>
          </div>
          <button onClick={resetGame} className="restart-button">
            Play Again
          </button>
          <button onClick={onBackToMenu} className="menu-button">
            Back to Menu
          </button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
