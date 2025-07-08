import React from 'react';
import './GameSettings.css';

const GameSettings = ({ settings, onSettingsChange }) => {
  const handleChange = (key, value) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="game-settings">
      <h2>Game Settings</h2>
      
      <div className="setting-group">
        <label htmlFor="gridSize">Grid Size:</label>
        <select 
          id="gridSize"
          value={settings.gridSize} 
          onChange={(e) => handleChange('gridSize', parseInt(e.target.value))}
        >
          <option value={15}>Small (15x15)</option>
          <option value={20}>Medium (20x20)</option>
          <option value={25}>Large (25x25)</option>
          <option value={30}>XL (30x30)</option>
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="speed">Speed:</label>
        <select 
          id="speed"
          value={settings.speed} 
          onChange={(e) => handleChange('speed', parseInt(e.target.value))}
        >
          <option value={250}>Slow</option>
          <option value={150}>Medium</option>
          <option value={100}>Fast</option>
          <option value={50}>Lightning</option>
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="difficulty">Difficulty:</label>
        <select 
          id="difficulty"
          value={settings.difficulty} 
          onChange={(e) => handleChange('difficulty', e.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="nightmare">Nightmare</option>
        </select>
      </div>

      <div className="setting-group">
        <label>
          <input 
            type="checkbox" 
            checked={settings.walls}
            onChange={(e) => handleChange('walls', e.target.checked)}
          />
          Wall Collision
        </label>
      </div>

      <div className="setting-group">
        <label>
          <input 
            type="checkbox" 
            checked={settings.powerUps}
            onChange={(e) => handleChange('powerUps', e.target.checked)}
          />
          Power-ups
        </label>
      </div>
    </div>
  );
};

export default GameSettings;
