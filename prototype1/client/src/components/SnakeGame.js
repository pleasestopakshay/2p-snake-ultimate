import React, { useState, useEffect, useCallback } from 'react';
import './SnakeGame.css';

const SnakeGame = ({ settings, onBackToMenu }) => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [powerUp, setPowerUp] = useState(null);
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
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
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  }, [snake, generateRandomPosition]);

  // Generate power-up occasionally
  const generatePowerUp = useCallback(() => {
    if (settings.powerUps && Math.random() < 0.3) {
      let newPowerUp;
      do {
        newPowerUp = generateRandomPosition();
      } while (
        snake.some(segment => segment.x === newPowerUp.x && segment.y === newPowerUp.y) ||
        (newPowerUp.x === food.x && newPowerUp.y === food.y)
      );
      setPowerUp(newPowerUp);
    }
  }, [settings.powerUps, snake, food, generateRandomPosition]);

  // Move snake
  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted || (direction.x === 0 && direction.y === 0)) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      // Wall collision
      if (settings.walls) {
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
          setGameOver(true);
          return prevSnake;
        }
      } else {
        // Wrap around
        head.x = (head.x + gridSize) % gridSize;
        head.y = (head.y + gridSize) % gridSize;
      }

      // Self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return prevSnake;
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
    });
  }, [direction, gameOver, gameStarted, settings.walls, gridSize, food, powerUp, generateFood, generatePowerUp]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted) {
        if (e.key === ' ') {
          setGameStarted(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
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
  }, [direction, gameStarted, onBackToMenu]);

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      moveSnake();
    }, settings.speed);

    return () => clearInterval(gameLoop);
  }, [moveSnake, settings.speed]);

  // Reset game
  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setPowerUp(null);
    setDirection({ x: 0, y: 0 });
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  };

  return (
    <div className="snake-game">
      <div className="game-header">
        <div className="score">Score: {score}</div>
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
          
          if (snake.some(segment => segment.x === x && segment.y === y)) {
            cellClass += snake[0].x === x && snake[0].y === y ? ' snake-head' : ' snake-body';
          } else if (food.x === x && food.y === y) {
            cellClass += ' food';
          } else if (powerUp && powerUp.x === x && powerUp.y === y) {
            cellClass += ' power-up';
          }

          return <div key={index} className={cellClass}></div>;
        })}
      </div>

      {!gameStarted && !gameOver && (
        <div className="game-message">
          <h2>Press SPACE to Start</h2>
          <p>Use arrow keys to move</p>
        </div>
      )}

      {gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
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
