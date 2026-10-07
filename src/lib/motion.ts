import type { MotionBlock, MotionPuzzle } from './types'

const key = (x: number, y: number) => `${x},${y}`

function occupied(blocks: MotionBlock[], ignoreId = -1) {
  const set = new Set<string>()
  for (const b of blocks) {
    if (b.id === ignoreId) continue
    for (let i = 0; i < b.length; i++) {
      set.add(key(b.x + (b.axis === 'h' ? i : 0), b.y + (b.axis === 'v' ? i : 0)))
    }
  }
  return set
}

function canMove(blocks: MotionBlock[], b: MotionBlock, delta: number, size: number) {
  const nextX = b.x + (b.axis === 'h' ? delta : 0)
  const nextY = b.y + (b.axis === 'v' ? delta : 0)
  if (nextX < 0 || nextY < 0) return false
  if (b.axis === 'h' && nextX + b.length > size) return false
  if (b.axis === 'v' && nextY + b.length > size) return false
  const occ = occupied(blocks, b.id)
  for (let i = 0; i < b.length; i++) {
    const x = nextX + (b.axis === 'h' ? i : 0)
    const y = nextY + (b.axis === 'v' ? i : 0)
    if (occ.has(key(x, y))) return false
  }
  return true
}

function ballCanReach(blocks: MotionBlock[], ball: { x: number; y: number }, target: { x: number; y: number }, size: number) {
  const blocked = occupied(blocks)
  const q: Array<[number, number]> = [[ball.x, ball.y]]
  const seen = new Set<string>([key(ball.x, ball.y)])
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  while (q.length) {
    const [x, y] = q.shift()!
    if (x === target.x && y === target.y) return true
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy
      const k = key(nx, ny)
      if (nx >= 0 && ny >= 0 && nx < size && ny < size && !blocked.has(k) && !seen.has(k)) {
        seen.add(k); q.push([nx, ny])
      }
    }
  }
  return false
}

export function generateMotionPuzzle(level: number): MotionPuzzle {
  const l = Math.max(1, level)
  const size = Math.min(10, 5 + Math.floor((l - 1) / 5))
  const count = Math.min(size + 4, 3 + Math.floor((l + 1) / 2))

  // Deterministic retry budget: generate a legal, visually readable board.
  for (let attempt = 0; attempt < 250; attempt++) {
    const blocks: MotionBlock[] = []
    const target = { x: size - 1, y: 0 }
    const ball = { x: 0, y: size - 1 }

    for (let id = 0; id < count; id++) {
      const axis: 'h' | 'v' = Math.random() < 0.5 ? 'h' : 'v'
      const length = Math.min(3, 2 + (Math.random() < Math.min(0.6, l / 20) ? 1 : 0))
      let placed = false
      for (let tries = 0; tries < 40 && !placed; tries++) {
        const x = Math.floor(Math.random() * (axis === 'h' ? size - length + 1 : size))
        const y = Math.floor(Math.random() * (axis === 'v' ? size - length + 1 : size))
        const candidate: MotionBlock = { id, x, y, length, axis }
        const occ = occupied(blocks)
        let valid = true
        for (let i = 0; i < length; i++) {
          const cx = x + (axis === 'h' ? i : 0), cy = y + (axis === 'v' ? i : 0)
          if (occ.has(key(cx, cy)) || (cx === ball.x && cy === ball.y) || (cx === target.x && cy === target.y)) valid = false
        }
        if (valid) { blocks.push(candidate); placed = true }
      }
    }

    // Require the starting board to be blocked so the player must manipulate pieces.
    // If it is already open, reject and generate another board.
    if (ballCanReach(blocks, ball, target, size)) continue

    return { size, blocks, ball, target, optimalMoves: 0 }
  }

  return {
    size: 5,
    blocks: [
      { id: 0, x: 0, y: 4, length: 4, axis: 'h' },
      { id: 1, x: 4, y: 1, length: 4, axis: 'v' },
    ],
    ball: { x: 0, y: 4 },
    target: { x: 4, y: 0 },
    optimalMoves: 0,
  }
}

export function blockCells(block: MotionBlock) {
  return Array.from({ length: block.length }, (_, i) => ({
    x: block.x + (block.axis === 'h' ? i : 0),
    y: block.y + (block.axis === 'v' ? i : 0),
  }))
}

export function tryMoveBlock(puzzle: MotionPuzzle, id: number, delta: number): MotionPuzzle | null {
  const block = puzzle.blocks.find(b => b.id === id)
  if (!block || !Number.isInteger(delta) || delta === 0) return null
  if (!canMove(puzzle.blocks, block, delta, puzzle.size)) return null
  const blocks = puzzle.blocks.map(b => b.id === id ? {
    ...b,
    x: b.x + (b.axis === 'h' ? delta : 0),
    y: b.y + (b.axis === 'v' ? delta : 0),
  } : b)
  return { ...puzzle, blocks }
}

export function routeIsOpen(puzzle: MotionPuzzle) {
  return ballCanReach(puzzle.blocks, puzzle.ball, puzzle.target, puzzle.size)
}
