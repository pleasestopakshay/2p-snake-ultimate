import React, { useState } from 'react';
import './App.css';
import SnakeGame from './components/SnakeGame';
import GameSettings from './components/GameSettings';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    gridSize: 20,
    speed: 150,
    walls: true,
    powerUps: true,
    difficulty: 'medium'
  });

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleBackToMenu = () => {
    setGameStarted(false);
  };

  const handleSettingsChange = (newSettings) => {
    setGameSettings(newSettings);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🐍 Two-Player Snake Ultimate</h1>
        {!gameStarted ? (
          <div className="menu-container">
            <GameSettings 
              settings={gameSettings} 
              onSettingsChange={handleSettingsChange}
            />
            <button className="start-button" onClick={handleStartGame}>
              Start 2-Player Game
            </button>
          </div>
        ) : (
          <SnakeGame 
            settings={gameSettings} 
            onBackToMenu={handleBackToMenu}
          />
        )}
      </header>
    </div>
  );
}

export default App;
