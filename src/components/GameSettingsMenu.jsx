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
          <h2 className="settings-title">GAME SETTINGS</h2>
        </div>
        
        <div className="settings-grid">
          <div className="setting-group">
            <label className="setting-label">
              SPEED
              <span className="help-icon" title="Controls how fast the snake moves">?</span>
            </label>
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
            <label className="setting-label">
              RANDOMIZE KEYS
              <span className="help-icon" title="Keys change every 10 seconds during gameplay">?</span>
            </label>
            <select 
              className="setting-select"
              value={settings.randomizeKeys ? 'true' : 'false'} 
              onChange={(e) => handleChange('randomizeKeys', e.target.value === 'true')}
            >
              <option value="false">DISABLED</option>
              <option value="true">ENABLED</option>
            </select>
          </div>

          <div className="setting-group">
            <label className="setting-label">
              MAX FRUITS
              <span className="help-icon" title="Number of fruits on screen at once">?</span>
            </label>
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
            <label className="setting-label">
              DIFFICULTY
              <span className="help-icon" title="AI difficulty for future features">?</span>
            </label>
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
            <label className="setting-label">
              THEME
              <span className="help-icon" title="Visual theme for the game">?</span>
            </label>
            <select 
              className="setting-select"
              value={settings.theme} 
              onChange={(e) => handleChange('theme', e.target.value)}
            >
              <option value="modern">MODERN</option>
              <option value="beige">BEIGE</option>
              <option value="green">GREEN</option>
              <option value="matte">MATTE</option>
            </select>
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
              <span className="help-icon" title="Enable gem power-ups for bonus points">?</span>
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
