import React, { useState, useEffect } from 'react';
import './App.css';
import SnakeGame from './components/SnakeGame';
import LevelSelector from './components/LevelSelector';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levels, setLevels] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load levels from JSON file with cache busting
    const cacheBuster = Date.now();
    fetch(`/level.json?t=${cacheBuster}`)
      .then(response => response.json())
      .then(data => {
        setLevels(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading levels:', error);
        setLoading(false);
      });
  }, []);

  const handleStartGame = (level) => {
    setSelectedLevel(level);
    setGameStarted(true);
  };

  const handleBackToMenu = () => {
    setGameStarted(false);
    setSelectedLevel(null);
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">Loading levels...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Snake Ultimate</h1>
        {!gameStarted ? (
          <LevelSelector 
            levels={levels} 
            onStartGame={handleStartGame}
          />
        ) : (
          <SnakeGame 
            level={selectedLevel} 
            onBackToMenu={handleBackToMenu}
          />
        )}
      </header>
    </div>
  );
}

export default App;
