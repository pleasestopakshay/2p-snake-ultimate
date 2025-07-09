import React, { useState, useCallback } from 'react'
import './LevelEditor.css'

const LevelEditor = ({ onSave, onBack }) => {
  const [levelName, setLevelName] = useState('')
  const [levelDescription, setLevelDescription] = useState('')
  const [difficulty, setDifficulty] = useState('EASY')
  const [gridSize] = useState(30)
  const [grid, setGrid] = useState(() => {
    const newGrid = []
    for (let y = 0; y < gridSize; y++) {
      const row = []
      for (let x = 0; x < gridSize; x++) {
        if (x === 0 || x === gridSize - 1 || y === 0 || y === gridSize - 1) {
          row.push('#')
        } else {
          row.push('.')
        }
      }
      newGrid.push(row.join(''))
    }
    return newGrid
  })
  const [selectedTool, setSelectedTool] = useState('wall')
  const [isDrawing, setIsDrawing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const tools = [
    { id: 'wall', name: 'WALL', symbol: '#', color: '#68d391' },
    { id: 'empty', name: 'EMPTY', symbol: '.', color: '#2d3748' },
    { id: 'erase', name: 'ERASE', symbol: '.', color: '#f56565' }
  ]

  const handleCellClick = useCallback((x, y) => {
    if (x === 0 || x === gridSize - 1 || y === 0 || y === gridSize - 1) {
      return
    }

    const newGrid = [...grid]
    const row = newGrid[y].split('')
    
    if (selectedTool === 'wall') {
      row[x] = '#'
    } else if (selectedTool === 'empty' || selectedTool === 'erase') {
      row[x] = '.'
    }
    
    newGrid[y] = row.join('')
    setGrid(newGrid)
  }, [grid, selectedTool, gridSize])

  const handleMouseDown = (x, y) => {
    setIsDrawing(true)
    handleCellClick(x, y)
  }

  const handleMouseEnter = (x, y) => {
    if (isDrawing) {
      handleCellClick(x, y)
    }
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const clearGrid = () => {
    const newGrid = []
    for (let y = 0; y < gridSize; y++) {
      const row = []
      for (let x = 0; x < gridSize; x++) {
        if (x === 0 || x === gridSize - 1 || y === 0 || y === gridSize - 1) {
          row.push('#')
        } else {
          row.push('.')
        }
      }
      newGrid.push(row.join(''))
    }
    setGrid(newGrid)
  }

  const fillGrid = () => {
    const newGrid = []
    for (let y = 0; y < gridSize; y++) {
      const row = []
      for (let x = 0; x < gridSize; x++) {
        row.push('#')
      }
      newGrid.push(row.join(''))
    }
    setGrid(newGrid)
  }

  const generateMaze = () => {
    const newGrid = []
    for (let y = 0; y < gridSize; y++) {
      const row = []
      for (let x = 0; x < gridSize; x++) {
        if (x === 0 || x === gridSize - 1 || y === 0 || y === gridSize - 1) {
          row.push('#')
        } else if (x % 4 === 0 && y % 4 === 0) {
          row.push('#')
        } else if (x % 4 === 0 || y % 4 === 0) {
          row.push(Math.random() > 0.7 ? '#' : '.')
        } else {
          row.push('.')
        }
      }
      newGrid.push(row.join(''))
    }
    setGrid(newGrid)
  }

  const handleSave = () => {
    if (!levelName.trim()) {
      alert('Please enter a level name!')
      return
    }

    const level = {
      id: `custom-${Date.now()}`,
      name: levelName.trim(),
      description: levelDescription.trim() || 'Custom level',
      difficulty,
      grid,
      isCustom: true
    }

    onSave(level)
    alert('Level saved successfully!')
    
    setLevelName('')
    setLevelDescription('')
    setDifficulty('EASY')
    clearGrid()
  }

  const exportLevel = () => {
    const level = {
      id: `custom-${Date.now()}`,
      name: levelName.trim() || 'Untitled Level',
      description: levelDescription.trim() || 'Custom level',
      difficulty,
      grid
    }
    
    const dataStr = JSON.stringify(level, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${levelName.trim() || 'level'}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const copyJSON = async () => {
    const level = {
      id: `custom-${Date.now()}`,
      name: levelName.trim() || 'Untitled Level',
      description: levelDescription.trim() || 'Custom level',
      difficulty,
      grid
    }
    
    const jsonString = JSON.stringify(level, null, 2)
    
    try {
      await navigator.clipboard.writeText(jsonString)
      // Could add a temporary notification here
      console.log('Level JSON copied to clipboard!')
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = jsonString
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      console.log('Level JSON copied to clipboard!')
    }
  }

  const renderCell = (x, y) => {
    const cell = grid[y][x]
    const isEditable = !(x === 0 || x === gridSize - 1 || y === 0 || y === gridSize - 1)
    
    return (
      <div
        key={`${x}-${y}`}
        className={`editor-cell ${cell === '#' ? 'wall' : 'empty'} ${!isEditable ? 'border' : ''}`}
        onMouseDown={() => isEditable && handleMouseDown(x, y)}
        onMouseEnter={() => isEditable && handleMouseEnter(x, y)}
        onMouseUp={handleMouseUp}
        style={{
          backgroundColor: cell === '#' ? '#68d391' : 'rgba(45, 55, 72, 0.7)',
          cursor: isEditable ? 'pointer' : 'not-allowed'
        }}
      />
    )
  }

  return (
    <div className="level-editor">
      <div className="editor-header">
        <button className="back-button" onClick={onBack}>
          ← BACK
        </button>
        <h2 className="editor-title">LEVEL EDITOR</h2>
        <button 
          className="preview-button"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? 'HIDE PREVIEW' : 'SHOW PREVIEW'}
        </button>
      </div>

      <div className="editor-content">
        <div className="editor-sidebar">
          <div className="level-info">
            <h3 className="section-title">LEVEL INFO</h3>
            <div className="input-group">
              <label>NAME:</label>
              <input
                type="text"
                value={levelName}
                onChange={(e) => setLevelName(e.target.value)}
                placeholder="Enter level name"
                maxLength={30}
              />
            </div>
            <div className="input-group">
              <label>DESCRIPTION:</label>
              <textarea
                value={levelDescription}
                onChange={(e) => setLevelDescription(e.target.value)}
                placeholder="Enter level description"
                maxLength={100}
                rows={3}
              />
            </div>
            <div className="input-group">
              <label>DIFFICULTY:</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
                <option value="EXTREME">EXTREME</option>
              </select>
            </div>
          </div>

          <div className="tools-panel">
            <h3 className="section-title">TOOLS</h3>
            <div className="tools-grid">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  className={`tool-button ${selectedTool === tool.id ? 'active' : ''}`}
                  onClick={() => setSelectedTool(tool.id)}
                  style={{ borderColor: tool.color }}
                >
                  <div 
                    className="tool-preview"
                    style={{ backgroundColor: tool.color }}
                  />
                  {tool.name}
                </button>
              ))}
            </div>
          </div>

          <div className="quick-actions">
            <h3 className="section-title">QUICK ACTIONS</h3>
            <div className="action-buttons">
              <button className="action-button" onClick={clearGrid}>
                CLEAR ALL
              </button>
              <button className="action-button" onClick={fillGrid}>
                FILL ALL
              </button>
              <button className="action-button" onClick={generateMaze}>
                GEN MAZE
              </button>
            </div>
          </div>

          <div className="save-actions">
            <button className="save-button" onClick={handleSave}>
              SAVE LEVEL
            </button>
            <button className="export-button" onClick={exportLevel}>
              EXPORT JSON
            </button>
            <button className="copy-button" onClick={copyJSON}>
              COPY JSON
            </button>
          </div>
        </div>

        <div className="editor-main">
          <div className="grid-container">
            <div 
              className="editor-grid"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize}, 1fr)`
              }}
            >
              {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                const x = index % gridSize
                const y = Math.floor(index / gridSize)
                return renderCell(x, y)
              })}
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="preview-overlay">
          <div className="preview-modal glassmorphism">
            <div className="preview-header">
              <h3>LEVEL PREVIEW</h3>
              <button onClick={() => setShowPreview(false)}>×</button>
            </div>
            <div className="preview-content">
              <div className="preview-info">
                <h4>{levelName || 'Untitled Level'}</h4>
                <p>{levelDescription || 'Custom level'}</p>
                <span className={`difficulty-badge ${difficulty.toLowerCase()}`}>
                  {difficulty}
                </span>
              </div>
              <div className="preview-grid">
                {grid.slice(0, 15).map((row, y) => (
                  <div key={y} className="preview-row">
                    {row.slice(0, 15).split('').map((cell, x) => (
                      <div 
                        key={x} 
                        className={`preview-cell ${cell === '#' ? 'wall' : 'empty'}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LevelEditor
