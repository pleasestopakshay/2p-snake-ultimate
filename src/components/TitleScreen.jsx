import React, { useState, useEffect } from 'react'
import './TitleScreen.css'

const TitleScreen = ({ onScreenChange }) => {
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationPhase(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const menuItems = [
    { text: 'PLAY GAME', action: () => onScreenChange('gameMode') },
    { text: 'SETTINGS', action: () => onScreenChange('settings') },
    { text: 'LEVEL EDITOR', action: () => onScreenChange('levelEditor') },
  ]

  return (
    <div className="title-screen">
      <div className="stars-background">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i} 
            className="star" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      <div className={`title-container ${animationPhase >= 1 ? 'fade-in' : ''}`}>
        <h1 className="game-title retro-text">
          <span className="title-word">SNAKE</span>
          <span className="title-word">ULTIMATE</span>
        </h1>
        <div className="subtitle retro-text">
          THE ULTIMATE RETRO EXPERIENCE
        </div>
      </div>
      
      <div className={`menu-container ${animationPhase >= 1 ? 'slide-up' : ''}`}>
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="menu-item pixel-border glow-effect"
            onClick={item.action}
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            {item.text}
          </button>
        ))}
      </div>
      
      <div className="version-info">
        VERSION 1.0.0
      </div>
      
      <div className="snake-animation">
        <div className="animated-snake">
          <div className="snake-segment head"></div>
          <div className="snake-segment body"></div>
          <div className="snake-segment body"></div>
          <div className="snake-segment tail"></div>
        </div>
      </div>
    </div>
  )
}

export default TitleScreen
