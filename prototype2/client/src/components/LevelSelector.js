import React from 'react';
import './LevelSelector.css';

const LevelSelector = ({ levels, onStartGame }) => {
  const levelKeys = Object.keys(levels);

  const refreshLevels = () => {
    window.location.reload();
  };

  return (
    <div className="level-selector">
      <div className="level-header">
        <h2>Choose Level</h2>
        <button onClick={refreshLevels} className="refresh-button">
          🔄 Refresh
        </button>
      </div>
      <div className="level-grid">
        {levelKeys.map(levelKey => {
          const level = levels[levelKey];
          return (
            <div key={levelKey} className="level-card">
              <h3>{level.name}</h3>
              <p className="difficulty">{level.difficulty}</p>
              <div className="level-preview">
                {level.grid.slice(0, 15).map((row, i) => (
                  <div key={i} className="preview-row">
                    {row.slice(0, 15).split('').map((cell, j) => (
                      <div 
                        key={j} 
                        className={`preview-cell ${cell === '#' ? 'wall' : 'empty'}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <button 
                className="level-button"
                onClick={() => onStartGame({ ...level, id: levelKey })}
              >
                Play
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LevelSelector;
