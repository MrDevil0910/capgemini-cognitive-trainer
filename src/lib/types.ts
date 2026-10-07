export type GameType = 'memory' | 'motion'
export type Mode = 'home' | 'level' | 'progressive' | 'exam'
export type Theme = 'dark' | 'light'

export interface MemoryConfig {
  level: number
  size: number
  dots: number
  revealMs: number
  recallLimitMs: number
}

export interface MotionBlock {
  id: number
  x: number
  y: number
  length: number
  axis: 'h' | 'v'
}

export interface MotionPuzzle {
  size: number
  blocks: MotionBlock[]
  ball: { x: number; y: number }
  target: { x: number; y: number }
  optimalMoves: number
}

export interface Stats {
  memoryBest: number
  motionBest: number
  memoryAttempts: number
  motionAttempts: number
  memoryAccuracy: number
  motionEfficiency: number
}
