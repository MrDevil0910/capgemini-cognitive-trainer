import type { MemoryConfig } from './types'

export interface MemoryRound {
  cells: number[]
  config: MemoryConfig
}

export function memoryConfig(level: number): MemoryConfig {
  const l = Math.max(1, level)
  const size = Math.min(9, 4 + Math.floor((l - 1) / 5))
  const dots = Math.min(size * size - 2, 3 + Math.floor((l - 1) / 2))
  const revealMs = Math.max(650, 1800 - Math.floor((l - 1) / 2) * 65)
  const recallLimitMs = Math.max(16000, 42000 - (l - 1) * 500)
  return { level: l, size, dots, revealMs, recallLimitMs }
}

export function generateMemoryRound(level: number): MemoryRound {
  const config = memoryConfig(level)
  const total = config.size * config.size
  const cells = Array.from({ length: total }, (_, i) => i)
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cells[i], cells[j]] = [cells[j], cells[i]]
  }
  return { cells: cells.slice(0, config.dots), config }
}
