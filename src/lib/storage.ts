import type { Theme, Stats } from './types'

const THEME_KEY = 'cognitive-trainer-theme'
const STATS_KEY = 'cognitive-trainer-stats'

const defaultStats: Stats = {
  memoryBest: 0,
  motionBest: 0,
  memoryAttempts: 0,
  motionAttempts: 0,
  memoryAccuracy: 0,
  motionEfficiency: 0,
}

export function loadTheme(): Theme {
  return (localStorage.getItem(THEME_KEY) as Theme | null) || 'dark'
}

export function saveTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme)
}

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    return raw ? { ...defaultStats, ...JSON.parse(raw) } : defaultStats
  } catch {
    return defaultStats
  }
}

export function saveStats(stats: Stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}
