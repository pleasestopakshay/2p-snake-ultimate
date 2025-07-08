import React, { useState, useEffect, useCallback } from 'react';
import './SnakeGame.css';

const SnakeGame = ({ level, onBackToMenu }) => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(150);

  const gridSize = 30; // Fixed 30x30 grid for levels
  const levelGrid = level.grid;

  // Check if a cell is a wall (blocked)
  const isWall = useCallback((x, y) => {
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return true;
    return levelGrid[y] && levelGrid[y][x] === '#';
  }, [levelGrid, gridSize]);

  // Check if a cell is playable (not a wall)
  const isPlayable = useCallback((x, y) => {
    return !isWall(x, y);
  }, [isWall]);

  // Find a random playable position
  const findRandomPlayablePosition = useCallback(() => {
    let attempts = 0;
    while (attempts < 1000) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      if (isPlayable(x, y)) {
        return { x, y };
      }
      attempts++;
    }
    return { x: 15, y: 15 }; // fallback
  }, [isPlayable, gridSize]);

  // Initialize game with level
  useEffect(() => {
    // Find starting position for snake
    const startPos = findRandomPlayablePosition();
    setSnake([startPos]);
    
    // Find starting position for food
    const foodPos = findRandomPlayablePosition();
    setFood(foodPos);

    // Set game speed based on difficulty
    const difficultySpeed = {
      'Easy': 200,
      'Medium': 150,
      'Hard': 100
    };
    setGameSpeed(difficultySpeed[level.difficulty] || 150);
  }, [level, findRandomPlayablePosition]);

  // Generate new food position
  const generateFood = useCallback(() => {
    let newFood;
    let attempts = 0;
    do {
      newFood = findRandomPlayablePosition();
      attempts++;
    } while (
      attempts < 100 && 
      snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)
    );
    setFood(newFood);
  }, [snake, findRandomPlayablePosition]);

  // Move snake
  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted || (direction.x === 0 && direction.y === 0)) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      // Check wall collision
      if (isWall(head.x, head.y)) {
        setGameOver(true);
        return prevSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return prevSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, gameOver, gameStarted, isWall, food, generateFood]);

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
    }, gameSpeed);

    return () => clearInterval(gameLoop);
  }, [moveSnake, gameSpeed]);

  // Reset game
  const resetGame = () => {
    const startPos = findRandomPlayablePosition();
    setSnake([startPos]);
    const foodPos = findRandomPlayablePosition();
    setFood(foodPos);
    setDirection({ x: 0, y: 0 });
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  };

  return (
    <div className="snake-game">
      <div className="game-header">
        <div className="level-info">
          <h3>{level.name}</h3>
          <p>{level.difficulty}</p>
        </div>
        <div className="score">Score: {score}</div>
        <button onClick={onBackToMenu} className="back-button">
          Back to Levels
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
          
          // Check if it's a wall from the level
          if (isWall(x, y)) {
            cellClass += ' wall';
          } else if (snake.some(segment => segment.x === x && segment.y === y)) {
            cellClass += snake[0].x === x && snake[0].y === y ? ' snake-head' : ' snake-body';
          } else if (food.x === x && food.y === y) {
            cellClass += ' food';
          }

          return <div key={index} className={cellClass}></div>;
        })}
      </div>

      {!gameStarted && !gameOver && (
        <div className="game-message">
          <h2>Press SPACE to Start</h2>
          <p>Use arrow keys to move</p>
          <p>Avoid walls and your own tail!</p>
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
            Back to Levels
          </button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
