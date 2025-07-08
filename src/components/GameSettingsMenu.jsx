import React, { useState } from 'react'
import { resetProgress } from '../utils/storage'
import './GameSettingsMenu.css'

const GameSettingsMenu = ({ settings, onSettingsChange, onBack }) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleChange = (key, value) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  const handleReset = () => {
    resetProgress()
    setShowResetConfirm(false)
    alert('PROGRESS RESET COMPLETE!')
  }

  return (
    <div className="settings-menu">
      <div className="settings-container glassmorphism">
        <div className="settings-header">
          <button className="back-button" onClick={onBack}>
            ← BACK
          </button>
          <h2 className="settings-title retro-text">GAME SETTINGS</h2>
        </div>
        
        <div className="settings-grid">
          <div className="setting-group">
            <label className="setting-label">SPEED</label>
            <select 
              className="setting-select"
              value={settings.speed} 
              onChange={(e) => handleChange('speed', parseInt(e.target.value))}
            >
              <option value={300}>SLOW</option>
              <option value={200}>MEDIUM</option>
              <option value={150}>FAST</option>
              <option value={100}>VERY FAST</option>
              <option value={75}>LIGHTNING</option>
            </select>
          </div>

          <div className="setting-group">
            <label className="setting-label">GRID SIZE</label>
            <select 
              className="setting-select"
              value={settings.gridSize} 
              onChange={(e) => handleChange('gridSize', parseInt(e.target.value))}
            >
              <option value={15}>SMALL (15x15)</option>
              <option value={20}>MEDIUM (20x20)</option>
              <option value={25}>LARGE (25x25)</option>
              <option value={30}>EXTRA LARGE (30x30)</option>
            </select>
          </div>

          <div className="setting-group">
            <label className="setting-label">MAX FRUITS</label>
            <select 
              className="setting-select"
              value={settings.maxFruits} 
              onChange={(e) => handleChange('maxFruits', parseInt(e.target.value))}
            >
              <option value={1}>1 FRUIT</option>
              <option value={2}>2 FRUITS</option>
              <option value={3}>3 FRUITS</option>
              <option value={5}>5 FRUITS</option>
            </select>
          </div>

          <div className="setting-group">
            <label className="setting-label">DIFFICULTY</label>
            <select 
              className="setting-select"
              value={settings.difficulty} 
              onChange={(e) => handleChange('difficulty', e.target.value)}
            >
              <option value="easy">EASY</option>
              <option value="medium">MEDIUM</option>
              <option value="hard">HARD</option>
              <option value="nightmare">NIGHTMARE</option>
            </select>
          </div>

          <div className="setting-group">
            <label className="setting-label">THEME</label>
            <select 
              className="setting-select"
              value={settings.theme} 
              onChange={(e) => handleChange('theme', e.target.value)}
            >
              <option value="retro">RETRO</option>
              <option value="beige">BEIGE</option>
              <option value="green">GREEN</option>
              <option value="matte">MATTE</option>
            </select>
          </div>

          <div className="setting-group checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={settings.wallCollision}
                onChange={(e) => handleChange('wallCollision', e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              WALL COLLISION
            </label>
          </div>

          <div className="setting-group checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={settings.powerUps}
                onChange={(e) => handleChange('powerUps', e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              POWER-UPS
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button 
            className="reset-button"
            onClick={() => setShowResetConfirm(true)}
          >
            RESET PROGRESS
          </button>
        </div>
      </div>

      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="modal-content glassmorphism">
            <h3 className="modal-title">RESET PROGRESS</h3>
            <p className="modal-text">
              This will reset all unlocked levels and high scores. 
              Are you sure you want to continue?
            </p>
            <div className="modal-actions">
              <button className="confirm-button" onClick={handleReset}>
                YES, RESET
              </button>
              <button 
                className="cancel-button"
                onClick={() => setShowResetConfirm(false)}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameSettingsMenu
