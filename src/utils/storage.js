export const getUnlockedLevels = () => {
  const saved = localStorage.getItem('unlockedLevels')
  return saved ? JSON.parse(saved) : ['level-1']
}

export const unlockLevel = (levelId) => {
  const current = getUnlockedLevels()
  if (!current.includes(levelId)) {
    current.push(levelId)
    localStorage.setItem('unlockedLevels', JSON.stringify(current))
  }
}

export const getGameSettings = () => {
  const saved = localStorage.getItem('gameSettings')
  return saved ? JSON.parse(saved) : {
    speed: 200,
    gridSize: 20,
    maxFruits: 1,
    wallCollision: true,
    powerUps: true,
    difficulty: 'medium',
    theme: 'retro'
  }
}

export const saveGameSettings = (settings) => {
  localStorage.setItem('gameSettings', JSON.stringify(settings))
}

export const getCustomLevels = () => {
  const saved = localStorage.getItem('customLevels')
  return saved ? JSON.parse(saved) : []
}

export const saveCustomLevel = (level) => {
  const current = getCustomLevels()
  current.push(level)
  localStorage.setItem('customLevels', JSON.stringify(current))
}

export const getHighScore = (levelId) => {
  const saved = localStorage.getItem(`highScore_${levelId}`)
  return saved ? parseInt(saved) : 0
}

export const saveHighScore = (levelId, score) => {
  const current = getHighScore(levelId)
  if (score > current) {
    localStorage.setItem(`highScore_${levelId}`, score.toString())
    return true
  }
  return false
}

export const resetProgress = () => {
  localStorage.removeItem('unlockedLevels')
  localStorage.removeItem('customLevels')
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith('highScore_')) {
      localStorage.removeItem(key)
    }
  })
}
