import React, { useState, useEffect } from 'react'
import TitleScreen from './components/TitleScreen'
import LevelSelector from './components/LevelSelector'
import GameSettingsMenu from './components/GameSettingsMenu'
import SnakeGame from './components/SnakeGame'
import LevelEditor from './components/LevelEditor'
import { getUnlockedLevels, getGameSettings } from './utils/storage'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState('title')
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [gameMode, setGameMode] = useState('1p')
  const [settings, setSettings] = useState(getGameSettings())
  const [customLevels, setCustomLevels] = useState([])
  const [unlockedLevels, setUnlockedLevels] = useState(getUnlockedLevels())
  const [superHardMode, setSuperHardMode] = useState(false)

  useEffect(() => {
    const savedCustomLevels = localStorage.getItem('customLevels')
    if (savedCustomLevels) {
      setCustomLevels(JSON.parse(savedCustomLevels))
    }
  }, [])

  const handleScreenChange = (screen) => {
    setCurrentScreen(screen)
  }

  const handleLevelSelect = (level) => {
    setSelectedLevel(level)
    setCurrentScreen('game')
  }

  const handleGameModeSelect = (mode) => {
    setGameMode(mode)
    setCurrentScreen('levels')
  }

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings)
    localStorage.setItem('gameSettings', JSON.stringify(newSettings))
  }

  const handleLevelComplete = (levelId) => {
    const newUnlocked = [...unlockedLevels]
    const nextLevelId = `level-${parseInt(levelId.split('-')[1]) + 1}`
    if (!newUnlocked.includes(nextLevelId)) {
      newUnlocked.push(nextLevelId)
      setUnlockedLevels(newUnlocked)
      localStorage.setItem('unlockedLevels', JSON.stringify(newUnlocked))
    }
  }

  const handleCustomLevelSave = (level) => {
    const newCustomLevels = [...customLevels, level]
    setCustomLevels(newCustomLevels)
    localStorage.setItem('customLevels', JSON.stringify(newCustomLevels))
  }

  const toggleSuperHardMode = () => {
    setSuperHardMode(!superHardMode)
  }

  return (
    <div className="app custom-cursor">
      <div className="secret-button" onClick={toggleSuperHardMode}>
        {superHardMode ? '🔥' : '🌟'}
      </div>
      
      {currentScreen === 'title' && (
        <TitleScreen onScreenChange={handleScreenChange} />
      )}
      
      {currentScreen === 'gameMode' && (
        <div className="game-mode-selector">
          <div className="modal-overlay">
            <div className="modal-content glassmorphism">
              <h2 className="retro-text">SELECT GAME MODE</h2>
              <div className="mode-buttons">
                <button 
                  className="mode-button glow-effect"
                  onClick={() => handleGameModeSelect('1p')}
                >
                  1 PLAYER
                </button>
                <button 
                  className="mode-button glow-effect"
                  onClick={() => handleGameModeSelect('2p')}
                >
                  2 PLAYERS
                </button>
              </div>
              <button 
                className="back-button"
                onClick={() => setCurrentScreen('title')}
              >
                BACK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {currentScreen === 'levels' && (
        <LevelSelector 
          onLevelSelect={handleLevelSelect}
          onBack={() => setCurrentScreen('gameMode')}
          unlockedLevels={unlockedLevels}
          customLevels={customLevels}
          gameMode={gameMode}
        />
      )}
      
      {currentScreen === 'settings' && (
        <GameSettingsMenu 
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onBack={() => setCurrentScreen('title')}
        />
      )}
      
      {currentScreen === 'levelEditor' && (
        <LevelEditor 
          onSave={handleCustomLevelSave}
          onBack={() => setCurrentScreen('title')}
        />
      )}
      
      {currentScreen === 'game' && selectedLevel && (
        <SnakeGame 
          level={selectedLevel}
          gameMode={gameMode}
          settings={settings}
          superHardMode={superHardMode}
          onLevelComplete={handleLevelComplete}
          onBack={() => setCurrentScreen('levels')}
        />
      )}
    </div>
  )
}

export default App
