import React, { useState, useEffect, useCallback, useRef } from 'react'
import { saveHighScore, unlockLevel } from '../utils/storage'
import './SnakeGame.css'

const SnakeGame = ({ level, gameMode, settings, superHardMode, onLevelComplete, onBack }) => {
  const [gameState, setGameState] = useState('ready')
  const [snake1, setSnake1] = useState([{ x: 1, y: 1 }]) // Will be updated on mount
  const [snake2, setSnake2] = useState([{ x: 2, y: 1 }]) // Will be updated on mount
  const [foods, setFoods] = useState([])
  const [powerUps, setPowerUps] = useState([])
  const [direction1, setDirection1] = useState({ x: 0, y: 0 })
  const [direction2, setDirection2] = useState({ x: 0, y: 0 })
  const [score1, setScore1] = useState(0)
  const [score2, setScore2] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [notification, setNotification] = useState('')
  const [superHardControls, setSuperHardControls] = useState(null)
  const [controlsChangeTimer, setControlsChangeTimer] = useState(0)
  const [showControlsWarning, setShowControlsWarning] = useState(false)
  const [levelCompleted, setLevelCompleted] = useState(false)
  
  const gameLoopRef = useRef()
  const containerRef = useRef()
  const gameStateRef = useRef()
  const snake1Ref = useRef()
  const snake2Ref = useRef()
  const foodsRef = useRef()
  const powerUpsRef = useRef()
  
  // Keep refs in sync with state
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])
  
  useEffect(() => {
    snake1Ref.current = snake1
  }, [snake1])
  
  useEffect(() => {
    snake2Ref.current = snake2
  }, [snake2])
  
  useEffect(() => {
    foodsRef.current = foods
  }, [foods])
  
  useEffect(() => {
    powerUpsRef.current = powerUps
  }, [powerUps])
  
  const gridSize = level.grid ? level.grid.length : (settings.gridSize || 20)
  const gridWidth = level.grid && level.grid[0] ? level.grid[0].length : gridSize
  const gameSpeed = settings.speed || 200
  
  const keys = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('')
  
  // Find valid spawn positions
  const findValidSpawnPosition = useCallback(() => {
    const emptyCells = []
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (level.grid[y] && level.grid[y][x] === '.') {
          emptyCells.push({ x, y })
        }
      }
    }
    
    return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : { x: 1, y: 1 }
  }, [level.grid, gridSize, gridWidth])
  
  // Initialize snake positions based on valid spawn points
  const getInitialSnakePositions = useCallback(() => {
    const spawn1 = findValidSpawnPosition()
    let spawn2 = findValidSpawnPosition()
    
    // Ensure player 2 doesn't spawn on player 1
    while (spawn2.x === spawn1.x && spawn2.y === spawn1.y) {
      spawn2 = findValidSpawnPosition()
    }
    
    return {
      snake1: [spawn1],
      snake2: [spawn2]
    }
  }, [findValidSpawnPosition])
  
  const generateRandomPosition = useCallback((currentSnake1, currentSnake2, currentFoods, currentPowerUps) => {
    const emptyCells = []
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (level.grid[y] && level.grid[y][x] === '.') {
          const isOccupied = 
            currentSnake1.some(seg => seg.x === x && seg.y === y) ||
            (gameMode === '2p' && currentSnake2.some(seg => seg.x === x && seg.y === y)) ||
            currentFoods.some(food => food.x === x && food.y === y) ||
            currentPowerUps.some(powerUp => powerUp.x === x && powerUp.y === y)
          
          if (!isOccupied) {
            emptyCells.push({ x, y })
          }
        }
      }
    }
    
    return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : null
  }, [level.grid, gridSize, gridWidth, gameMode])
  
  const spawnInitialFoods = useCallback(() => {
    const newFoods = []
    const maxFruits = Math.min(settings.maxFruits || 1, 5)
    const initialPositions = getInitialSnakePositions()
    
    for (let i = 0; i < maxFruits; i++) {
      const pos = generateRandomPosition(initialPositions.snake1, initialPositions.snake2, [], [])
      if (pos) {
        newFoods.push({ 
          x: pos.x, 
          y: pos.y, 
          id: Math.random(),
          type: Math.random() > 0.9 ? 'special' : 'normal'
        })
      }
    }
    
    setFoods(newFoods)
  }, [generateRandomPosition, settings.maxFruits, getInitialSnakePositions])
  
  const spawnNewFoods = useCallback((currentSnake1, currentSnake2, currentFoods, currentPowerUps) => {
    const newFoods = []
    const maxFruits = Math.min(settings.maxFruits || 1, 5)
    
    for (let i = 0; i < maxFruits; i++) {
      const pos = generateRandomPosition(currentSnake1, currentSnake2, currentFoods, currentPowerUps)
      if (pos) {
        newFoods.push({ 
          x: pos.x, 
          y: pos.y, 
          id: Math.random(),
          type: Math.random() > 0.9 ? 'special' : 'normal'
        })
      }
    }
    
    return newFoods
  }, [generateRandomPosition, settings.maxFruits])
  
  const spawnPowerUp = useCallback((currentSnake1, currentSnake2, currentFoods, currentPowerUps) => {
    if (settings.powerUps && Math.random() < 0.3) {
      const pos = generateRandomPosition(currentSnake1, currentSnake2, currentFoods, currentPowerUps)
      if (pos) {
        return { 
          x: pos.x, 
          y: pos.y, 
          id: Math.random(),
          type: 'gem'
        }
      }
    }
    return null
  }, [generateRandomPosition, settings.powerUps])
  
  const generateSuperHardControls = useCallback(() => {
    if (!superHardMode) return
    
    const randomKeys = [...keys].sort(() => Math.random() - 0.5).slice(0, 8)
    
    const controls = {
      up1: randomKeys[0],
      down1: randomKeys[1],
      left1: randomKeys[2],
      right1: randomKeys[3],
      up2: randomKeys[4],
      down2: randomKeys[5],
      left2: randomKeys[6],
      right2: randomKeys[7]
    }
    
    setSuperHardControls(controls)
    setShowControlsWarning(true)
    
    setTimeout(() => {
      setShowControlsWarning(false)
    }, 3000)
  }, [superHardMode]) // Removed 'keys' dependency
  
  const moveSnake = useCallback((snake, direction, isPlayer1) => {
    if (gameStateRef.current !== 'playing' || (direction.x === 0 && direction.y === 0)) return snake
    
    const newSnake = [...snake]
    const head = { ...newSnake[0] }
    
    head.x += direction.x
    head.y += direction.y
    
    if (settings.wallCollision) {
      if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridSize) {
        setGameState('gameOver')
        setGameOver(true)
        setWinner(gameMode === '2p' ? (isPlayer1 ? 'Player 2' : 'Player 1') : null)
        return snake
      }
    } else {
      head.x = (head.x + gridWidth) % gridWidth
      head.y = (head.y + gridSize) % gridSize
    }
    
    if (level.grid[head.y] && head.x >= 0 && head.x < gridWidth && level.grid[head.y][head.x] === '#') {
      setGameState('gameOver')
      setGameOver(true)
      setWinner(gameMode === '2p' ? (isPlayer1 ? 'Player 2' : 'Player 1') : null)
      return snake
    }
    
    if (newSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
      setGameState('gameOver')
      setGameOver(true)
      setWinner(gameMode === '2p' ? (isPlayer1 ? 'Player 2' : 'Player 1') : null)
      return snake
    }
    
    if (gameMode === '2p') {
      const otherSnake = isPlayer1 ? snake2Ref.current : snake1Ref.current
      if (otherSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
        setGameState('gameOver')
        setGameOver(true)
        setWinner(isPlayer1 ? 'Player 2' : 'Player 1')
        return snake
      }
    }
    
    newSnake.unshift(head)
    
    const foodEaten = foodsRef.current.find(food => food.x === head.x && food.y === head.y)
    if (foodEaten) {
      const points = foodEaten.type === 'special' ? 25 : 10
      if (isPlayer1) {
        setScore1(prev => prev + points)
      } else {
        setScore2(prev => prev + points)
      }
      setFoods(prev => {
        const newFoods = prev.filter(food => food.id !== foodEaten.id)
        // Spawn new food
        const spawnedFoods = spawnNewFoods(newSnake, snake2Ref.current, newFoods, powerUpsRef.current)
        return spawnedFoods
      })
      
      // Spawn power-up
      setPowerUps(prev => {
        const newPowerUp = spawnPowerUp(newSnake, snake2Ref.current, foodsRef.current, prev)
        return newPowerUp ? [...prev, newPowerUp] : prev
      })
    } else {
      newSnake.pop()
    }
    
    const powerUpEaten = powerUpsRef.current.find(powerUp => powerUp.x === head.x && powerUp.y === head.y)
    if (powerUpEaten) {
      if (isPlayer1) {
        setScore1(prev => prev + 50)
      } else {
        setScore2(prev => prev + 50)
      }
      setPowerUps(prev => prev.filter(powerUp => powerUp.id !== powerUpEaten.id))
    }
    
    return newSnake
  }, [settings.wallCollision, gridSize, level.grid, gameMode, spawnNewFoods, spawnPowerUp])
  
  const gameLoop = useCallback(() => {
    if (gameStateRef.current !== 'playing') return
    
    setSnake1(prev => moveSnake(prev, direction1, true))
    
    if (gameMode === '2p') {
      setSnake2(prev => moveSnake(prev, direction2, false))
    }
  }, [direction1, direction2, gameMode, moveSnake])
  
  const handleKeyPress = useCallback((e) => {
    if (gameState === 'ready' && e.key === ' ') {
      setGameState('playing')
      setIsFullscreen(true)
      if (containerRef.current) {
        containerRef.current.requestFullscreen?.()
      }
      return
    }
    
    if (gameState !== 'playing') return
    
    const key = e.key.toLowerCase()
    
    if (superHardMode && superHardControls) {
      if (key === superHardControls.up1 && direction1.y === 0) {
        setDirection1({ x: 0, y: -1 })
      } else if (key === superHardControls.down1 && direction1.y === 0) {
        setDirection1({ x: 0, y: 1 })
      } else if (key === superHardControls.left1 && direction1.x === 0) {
        setDirection1({ x: -1, y: 0 })
      } else if (key === superHardControls.right1 && direction1.x === 0) {
        setDirection1({ x: 1, y: 0 })
      }
      
      if (gameMode === '2p') {
        if (key === superHardControls.up2 && direction2.y === 0) {
          setDirection2({ x: 0, y: -1 })
        } else if (key === superHardControls.down2 && direction2.y === 0) {
          setDirection2({ x: 0, y: 1 })
        } else if (key === superHardControls.left2 && direction2.x === 0) {
          setDirection2({ x: -1, y: 0 })
        } else if (key === superHardControls.right2 && direction2.x === 0) {
          setDirection2({ x: 1, y: 0 })
        }
      }
    } else {
      if (key === 'w' && direction1.y === 0) {
        setDirection1({ x: 0, y: -1 })
      } else if (key === 's' && direction1.y === 0) {
        setDirection1({ x: 0, y: 1 })
      } else if (key === 'a' && direction1.x === 0) {
        setDirection1({ x: -1, y: 0 })
      } else if (key === 'd' && direction1.x === 0) {
        setDirection1({ x: 1, y: 0 })
      }
      
      if (gameMode === '2p') {
        if (e.key === 'ArrowUp' && direction2.y === 0) {
          setDirection2({ x: 0, y: -1 })
        } else if (e.key === 'ArrowDown' && direction2.y === 0) {
          setDirection2({ x: 0, y: 1 })
        } else if (e.key === 'ArrowLeft' && direction2.x === 0) {
          setDirection2({ x: -1, y: 0 })
        } else if (e.key === 'ArrowRight' && direction2.x === 0) {
          setDirection2({ x: 1, y: 0 })
        }
      }
    }
    
    if (e.key === 'Escape') {
      onBack()
    }
  }, [gameState, direction1, direction2, gameMode, superHardMode, superHardControls, onBack])
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])
  
  useEffect(() => {
    gameLoopRef.current = setInterval(gameLoop, gameSpeed)
    return () => clearInterval(gameLoopRef.current)
  }, [gameLoop, gameSpeed])
  
  useEffect(() => {
    if (superHardMode && gameState === 'playing') {
      const interval = setInterval(() => {
        setControlsChangeTimer(prev => {
          if (prev <= 1) {
            generateSuperHardControls()
            return 10
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [superHardMode, gameState, generateSuperHardControls])
  
  useEffect(() => {
    // Initialize game on component mount
    const initialPositions = getInitialSnakePositions()
    setSnake1(initialPositions.snake1)
    setSnake2(initialPositions.snake2)
    
    spawnInitialFoods()
    if (superHardMode) {
      generateSuperHardControls()
      setControlsChangeTimer(10)
    }
  }, []) // Only run once on mount
  
  useEffect(() => {
    if (gameOver) {
      const totalScore = gameMode === '2p' ? Math.max(score1, score2) : score1
      const isNewRecord = saveHighScore(level.id, totalScore)
      
      if (isNewRecord) {
        setNotification('NEW HIGH SCORE!')
      }
    }
  }, [gameOver, score1, score2, level.id, gameMode])

  // Check for level completion (separate from game over)
  useEffect(() => {
    if (gameState === 'playing' && !gameOver && !levelCompleted) {
      const totalScore = gameMode === '2p' ? Math.max(score1, score2) : score1
      if (totalScore >= (level.targetScore || 100)) {
        onLevelComplete(level.id)
        setLevelCompleted(true)
        setNotification('LEVEL COMPLETE! Keep playing!')
        setTimeout(() => setNotification(''), 3000)
      }
    }
  }, [score1, score2, level.id, level.targetScore, gameMode, gameState, gameOver, onLevelComplete, levelCompleted])
  
  const resetGame = () => {
    const initialPositions = getInitialSnakePositions()
    
    setGameState('ready')
    setSnake1(initialPositions.snake1)
    setSnake2(initialPositions.snake2)
    setFoods([])
    setPowerUps([])
    setDirection1({ x: 0, y: 0 })
    setDirection2({ x: 0, y: 0 })
    setScore1(0)
    setScore2(0)
    setGameOver(false)
    setWinner(null)
    setIsFullscreen(false)
    setNotification('')
    setControlsChangeTimer(0)
    setShowControlsWarning(false)
    setLevelCompleted(false)
    
    if (document.fullscreenElement) {
      document.exitFullscreen()
    }
    
    // Re-initialize foods and controls
    setTimeout(() => {
      spawnInitialFoods()
      if (superHardMode) {
        generateSuperHardControls()
        setControlsChangeTimer(10)
      }
    }, 100)
  }
  
  const renderCell = (x, y) => {
    let cellClass = 'game-cell'
    let content = ''
    
    if (level.grid[y] && level.grid[y][x] === '#') {
      cellClass += ' wall'
    } else {
      cellClass += ' empty'
    }
    
    if (snake1.some(seg => seg.x === x && seg.y === y)) {
      cellClass += snake1[0].x === x && snake1[0].y === y ? ' snake1-head' : ' snake1-body'
      content = snake1[0].x === x && snake1[0].y === y ? '🐍' : '●'
    } else if (gameMode === '2p' && snake2.some(seg => seg.x === x && seg.y === y)) {
      cellClass += snake2[0].x === x && snake2[0].y === y ? ' snake2-head' : ' snake2-body'
      content = snake2[0].x === x && snake2[0].y === y ? '🐍' : '●'
    } else if (foods.some(food => food.x === x && food.y === y)) {
      const food = foods.find(food => food.x === x && food.y === y)
      cellClass += food.type === 'special' ? ' special-food' : ' food'
      content = food.type === 'special' ? '🍎' : '🍒'
    } else if (powerUps.some(powerUp => powerUp.x === x && powerUp.y === y)) {
      cellClass += ' power-up'
      content = '💎'
    }
    
    return (
      <div key={`${x}-${y}`} className={cellClass}>
        {content}
      </div>
    )
  }
  
  return (
    <div ref={containerRef} className={`snake-game-container ${isFullscreen ? 'fullscreen-container' : ''}`}>
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
      
      {showControlsWarning && superHardControls && (
        <div className="notification controls-notification">
          <h3>CONTROLS CHANGED!</h3>
          <div>
            P1: {superHardControls.up1}↑ {superHardControls.down1}↓ {superHardControls.left1}← {superHardControls.right1}→
          </div>
          {gameMode === '2p' && (
            <div>
              P2: {superHardControls.up2}↑ {superHardControls.down2}↓ {superHardControls.left2}← {superHardControls.right2}→
            </div>
          )}
        </div>
      )}
      
      <div className="game-header">
        <div className="game-info">
          <h2 className="level-title">{level.name}</h2>
          <div className="scores">
            <div className="score player1">
              P1: {score1}
            </div>
            {gameMode === '2p' && (
              <div className="score player2">
                P2: {score2}
              </div>
            )}
          </div>
        </div>
        
        {superHardMode && gameState === 'playing' && (
          <div className="super-hard-info">
            <div className="controls-timer">
              CONTROLS CHANGE IN: {controlsChangeTimer}s
            </div>
          </div>
        )}
        
        <button className="exit-button" onClick={onBack}>
          EXIT
        </button>
      </div>
      
      <div className="game-board" style={{
        gridTemplateColumns: `repeat(${gridWidth}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`
      }}>
        {Array.from({ length: gridSize * gridWidth }).map((_, index) => {
          const x = index % gridWidth
          const y = Math.floor(index / gridWidth)
          return renderCell(x, y)
        })}
      </div>
      
      {gameState === 'ready' && (
        <div className="game-overlay">
          <div className="game-message">
            <h2>GET READY!</h2>
            <div className="controls-info">
              {superHardMode ? (
                <div>
                  <p>SUPER HARD MODE ACTIVATED!</p>
                  <p>Controls will change every 10 seconds</p>
                </div>
              ) : (
                <div>
                  <p>Player 1: W/A/S/D</p>
                  {gameMode === '2p' && <p>Player 2: Arrow Keys</p>}
                </div>
              )}
            </div>
            <p className="start-instruction">Press SPACE to start</p>
          </div>
        </div>
      )}
      
      {gameOver && (
        <div className="game-overlay">
          <div className="game-over-message">
            <h2>GAME OVER!</h2>
            {winner && <h3>{winner} WINS!</h3>}
            <div className="final-scores">
              <div>Player 1: {score1}</div>
              {gameMode === '2p' && <div>Player 2: {score2}</div>}
            </div>
            <div className="game-actions">
              <button className="restart-button" onClick={resetGame}>
                PLAY AGAIN
              </button>
              <button className="menu-button" onClick={onBack}>
                LEVEL SELECT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SnakeGame
