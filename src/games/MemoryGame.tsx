import { useEffect, useRef, useState } from 'react'
import { generateMemoryRound } from '../lib/memory'
import type { MemoryRound } from '../lib/memory'

interface Props {
  level: number
  exam?: boolean
  onComplete: (result: { success: boolean; score: number; level: number }) => void
  onExit: () => void
}

type Phase = 'reveal' | 'recall' | 'result' | 'exam-result'

export function MemoryGame({ level, exam = false, onComplete, onExit }: Props) {
  const [roundIndex, setRoundIndex] = useState(0)
  const [round, setRound] = useState<MemoryRound>(() => generateMemoryRound(level))
  const { config, cells } = round
  const [phase, setPhase] = useState<Phase>('reveal')
  const [selected, setSelected] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(exam ? 540 : Math.ceil(config.recallLimitMs / 1000))
  const [examCorrect, setExamCorrect] = useState(0)
  const [examScore, setExamScore] = useState(0)
  const submitted = useRef(false)

  useEffect(() => {
    setPhase('reveal')
    setSelected([])
    const timer = window.setTimeout(() => setPhase('recall'), config.revealMs)
    return () => window.clearTimeout(timer)
  }, [round, config.revealMs])

  useEffect(() => {
    if (phase !== 'recall' || exam) return
    const interval = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          window.clearInterval(interval)
          setPhase('result')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [phase, exam])

  useEffect(() => {
    if (!exam || phase === 'exam-result') return undefined
    const interval = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          window.clearInterval(interval)
          setPhase('exam-result')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [exam, phase])

  const isCorrect = (answer: number[]) => answer.length === cells.length && answer.every((v, i) => v === cells[i])

  const finish = (answer: number[]) => {
    if (phase !== 'recall') return
    const correct = isCorrect(answer)
    const score = correct ? Math.max(0, Math.round(1000 - level * 3 - (selected.length * 10))) : 0

    if (exam) {
      setExamCorrect(v => v + (correct ? 1 : 0))
      setExamScore(v => v + score)
      if (roundIndex >= 8) {
        setPhase('exam-result')
        submitted.current = true
        onComplete({ success: correct, score: examScore + score, level })
      } else {
        const next = roundIndex + 1
        setRoundIndex(next)
        setRound(generateMemoryRound(level + Math.floor(next / 3)))
      }
      return
    }

    setPhase('result')
    onComplete({ success: correct, score, level })
  }

  const clickCell = (index: number) => {
    if (phase !== 'recall') return
    if (selected.includes(index)) return
    const next = [...selected, index]
    setSelected(next)
    if (next.length === cells.length) finish(next)
  }

  const restart = () => {
    setRoundIndex(0)
    submitted.current = false
    setRound(generateMemoryRound(level))
    setSelected([])
    setExamCorrect(0)
    setExamScore(0)
    setTimeLeft(exam ? 540 : Math.ceil(config.recallLimitMs / 1000))
    setPhase('reveal')
  }

  const resultCorrect = selected.length === cells.length && isCorrect(selected)

  return (
    <div className="game-screen">
      <div className="game-head">
        <div>
          <span className="eyebrow">MEMORY CHALLENGE</span>
          <h1>Level {level}</h1>
        </div>
        <div className="game-head-right">
          <div className="timer">{formatTime(timeLeft)}</div>
          {exam && <div className="move-count">Task {Math.min(roundIndex + 1, 9)}/9</div>}
          <button className="ghost-button" onClick={onExit}>Exit</button>
        </div>
      </div>

      <div className="game-panel memory-panel">
        <div className="instruction-row">
          <span>{phase === 'reveal' ? 'Remember the dots in order.' : phase === 'recall' ? 'Select the dots in the same order.' : 'Round complete.'}</span>
          <span>{config.dots} dots · {config.size}×{config.size}</span>
        </div>

        {phase !== 'exam-result' ? (
          <div className={`memory-grid size-${config.size}`}>
            {Array.from({ length: config.size * config.size }, (_, index) => {
              const active = phase === 'reveal' && cells.includes(index)
              const picked = phase !== 'reveal' && selected.includes(index)
              const number = selected.indexOf(index) + 1
              return (
                <button
                  key={index}
                  className={`memory-cell ${active ? 'active' : ''} ${picked ? 'picked' : ''}`}
                  onClick={() => clickCell(index)}
                  disabled={phase !== 'recall'}
                  aria-label={`Grid cell ${index + 1}`}
                >
                  {picked && <span>{number}</span>}
                </button>
              )
            })}
          </div>
        ) : null}

        {phase === 'result' && (
          <div className="result-panel">
            <div>
              <span className="eyebrow">RESULT</span>
              <h2>{resultCorrect ? 'Correct' : 'Try again'}</h2>
            </div>
            <button className="primary-button" onClick={restart}>New attempt</button>
          </div>
        )}

        {phase === 'exam-result' && (
          <div className="exam-summary">
            <span className="eyebrow">SESSION COMPLETE</span>
            <h2>{examCorrect}/9 correct</h2>
            <p>Timed practice session completed.</p>
            <button className="primary-button" onClick={restart}>Run again</button>
          </div>
        )}
      </div>
    </div>
  )
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
