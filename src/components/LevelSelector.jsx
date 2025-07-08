import React, { useState } from 'react'
import { getAllLevels } from '../utils/levels'
import { getHighScore } from '../utils/storage'
import './LevelSelector.css'

const LevelSelector = ({ onLevelSelect, onBack, unlockedLevels, customLevels, gameMode }) => {
  const [selectedCategory, setSelectedCategory] = useState('default')
  const defaultLevels = getAllLevels()

  const renderLevelCard = (level, isUnlocked) => {
    const highScore = getHighScore(level.id)
    const isCustom = level.id.startsWith('custom-')
    
    return (
      <div
        key={level.id}
        className={`level-card pixel-border ${isUnlocked ? 'level-unlocked glow-effect' : 'level-locked'}`}
        onClick={() => isUnlocked && onLevelSelect(level)}
      >
        <div className="level-header">
          <h3 className="level-name retro-text">{level.name}</h3>
          <div className={`difficulty-badge ${level.difficulty.toLowerCase()}`}>
            {level.difficulty}
          </div>
        </div>
        
        <div className="level-preview">
          <div className="grid-preview">
            {level.grid.slice(0, 10).map((row, y) => (
              <div key={y} className="preview-row">
                {row.slice(0, 10).split('').map((cell, x) => (
                  <div 
                    key={x} 
                    className={`preview-cell ${cell === '#' ? 'wall' : 'empty'}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <div className="level-info">
          <div className="level-description">{level.description}</div>
          {!isCustom && (
            <div className="target-score">TARGET: {level.targetScore}</div>
          )}
          {highScore > 0 && (
            <div className="high-score">BEST: {highScore}</div>
          )}
        </div>
        
        {!isUnlocked && (
          <div className="locked-overlay">
            <div className="lock-icon">🔒</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="level-selector">
      <div className="header">
        <button className="back-button" onClick={onBack}>
          ← BACK
        </button>
        <h2 className="screen-title retro-text">
          SELECT LEVEL - {gameMode === '1p' ? '1 PLAYER' : '2 PLAYERS'}
        </h2>
      </div>
      
      <div className="category-tabs">
        <button
          className={`tab-button ${selectedCategory === 'default' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('default')}
        >
          DEFAULT LEVELS
        </button>
        <button
          className={`tab-button ${selectedCategory === 'custom' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('custom')}
        >
          CUSTOM LEVELS ({customLevels.length})
        </button>
      </div>
      
      <div className="levels-container">
        {selectedCategory === 'default' ? (
          <div className="levels-grid">
            {defaultLevels.map(level => 
              renderLevelCard(level, unlockedLevels.includes(level.id))
            )}
          </div>
        ) : (
          <div className="levels-grid">
            {customLevels.length > 0 ? (
              customLevels.map(level => 
                renderLevelCard(level, true)
              )
            ) : (
              <div className="no-custom-levels">
                <div className="empty-state">
                  <h3>NO CUSTOM LEVELS</h3>
                  <p>Create your own levels in the Level Editor!</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="progress-info">
        <div className="unlock-progress">
          UNLOCKED: {unlockedLevels.length} / {defaultLevels.length}
        </div>
      </div>
    </div>
  )
}

export default LevelSelector
