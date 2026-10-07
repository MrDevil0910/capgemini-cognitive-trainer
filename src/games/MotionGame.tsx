import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { blockCells, generateMotionPuzzle, routeIsOpen, tryMoveBlock } from '../lib/motion'
import type { MotionPuzzle } from '../lib/types'

interface Props {
  level: number
  exam?: boolean
  onComplete: (result: { success: boolean; score: number; level: number }) => void
  onExit: () => void
}

export function MotionGame({ level, exam = false, onComplete, onExit }: Props) {
  const [puzzle, setPuzzle] = useState<MotionPuzzle>(() => generateMotionPuzzle(level))
  const [moves, setMoves] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [won, setWon] = useState(false)
  const started = useRef(performance.now())
  const [timeLeft, setTimeLeft] = useState(exam ? 360 : 0)
  const [ended, setEnded] = useState(false)
  const dragStart = useRef<{ id: number; x: number; y: number } | null>(null)

  useEffect(() => {
    if (!exam || ended) return undefined
    const id = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setEnded(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [exam, ended])

  const attemptMove = (id: number, delta: number) => {
    const next = tryMoveBlock(puzzle, id, delta)
    if (!next || ended) return
    const nextMoves = moves + 1
    setPuzzle(next)
    setMoves(nextMoves)
    setSelected(id)
    if (routeIsOpen(next)) {
      setWon(true)
      const elapsed = (performance.now() - started.current) / 1000
      const score = Math.max(0, Math.round(1000 - elapsed * 5 - nextMoves * 15 - level * 3))
      onComplete({ success: true, score, level })
    }
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>, id: number) => {
    const b = puzzle.blocks.find(x => x.id === id)
    if (!b) return
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    dragStart.current = { id, x: event.clientX, y: event.clientY }
    setSelected(id)
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>, id: number) => {
    const start = dragStart.current
    dragStart.current = null
    if (!start || start.id !== id) return
    const b = puzzle.blocks.find(x => x.id === id)
    if (!b) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    const delta = b.axis === 'h' ? Math.round(dx / 48) : Math.round(dy / 48)
    if (delta !== 0) attemptMove(id, delta > 0 ? 1 : -1)
  }

  const reset = () => {
    setPuzzle(generateMotionPuzzle(level))
    setMoves(0)
    setSelected(null)
    setWon(false)
    setEnded(false)
    started.current = performance.now()
    if (exam) setTimeLeft(360)
  }

  return (
    <div className="game-screen">
      <div className="game-head">
        <div>
          <span className="eyebrow">MOTION CHALLENGE</span>
          <h1>Level {level}</h1>
        </div>
        <div className="game-head-right">
          {exam && <div className="timer">{formatTime(timeLeft)}</div>}
          <div className="move-count">Moves {moves}</div>
          <button className="ghost-button" onClick={onExit}>Exit</button>
        </div>
      </div>

      <div className="game-panel motion-panel">
        <div className="instruction-row">
          <span>Move the blocks to open a path to the target.</span>
          <span>{ended ? 'Session complete' : `${puzzle.size}×${puzzle.size} board`}</span>
        </div>

        <div className="motion-wrap">
          <div className="motion-board" style={{ gridTemplateColumns: `repeat(${puzzle.size}, 1fr)` }}>
            {Array.from({ length: puzzle.size * puzzle.size }, (_, i) => <div className="board-cell" key={i} />)}
            <div className="target" style={cellStyle(puzzle.target, puzzle.size)}>●</div>
            <div className="ball" style={cellStyle(puzzle.ball, puzzle.size)}>●</div>
            {puzzle.blocks.map(block => {
              const first = blockCells(block)[0]
              return (
                <div
                  key={block.id}
                  className={`motion-block axis-${block.axis} ${selected === block.id ? 'selected' : ''}`}
                  style={{
                    ...cellStyle(first, puzzle.size),
                    gridColumn: `${first.x + 1} / span ${block.axis === 'h' ? block.length : 1}`,
                    gridRow: `${first.y + 1} / span ${block.axis === 'v' ? block.length : 1}`,
                  }}
                  onPointerDown={e => handlePointerDown(e, block.id)}
                  onPointerUp={e => handlePointerUp(e, block.id)}
                  onDoubleClick={() => attemptMove(block.id, block.axis === 'h' ? 1 : 1)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Movable ${block.axis === 'h' ? 'horizontal' : 'vertical'} block`}
                />
              )
            })}
          </div>
        </div>

        {ended && !won && <div className="exam-summary"><span className="eyebrow">SESSION COMPLETE</span><h2>Time.</h2><p>Your six-minute practice session is complete.</p><button className="primary-button" onClick={reset}>Run again</button></div>}

        <div className="motion-controls">
          <span>Drag blocks along their axis.</span>
          <button className="ghost-button" onClick={reset}>Reset</button>
        </div>

        {won && (
          <div className="result-panel">
            <div>
              <span className="eyebrow">PATH OPEN</span>
              <h2>Level complete</h2>
            </div>
            <button className="primary-button" onClick={reset}>New puzzle</button>
          </div>
        )}
      </div>
    </div>
  )
}

function cellStyle(cell: { x: number; y: number }, size: number): CSSProperties {
  return {
    gridColumn: cell.x + 1,
    gridRow: cell.y + 1,
  }
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
