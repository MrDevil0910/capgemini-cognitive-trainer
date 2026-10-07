import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { LevelGrid } from './components/LevelGrid'
import { ModeCard } from './components/ModeCard'
import { MemoryGame } from './games/MemoryGame'
import { MotionGame } from './games/MotionGame'
import { loadStats, loadTheme, saveStats, saveTheme } from './lib/storage'
import type { GameType, Mode, Stats, Theme } from './lib/types'

const LEVELS = 30

export function App() {
  const [theme, setTheme] = useState<Theme>(() => loadTheme())
  const [game, setGame] = useState<GameType>('memory')
  const [mode, setMode] = useState<Mode>('home')
  const [level, setLevel] = useState(1)
  const [stats, setStats] = useState<Stats>(() => loadStats())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    saveTheme(theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const openLevel = (type: GameType) => {
    setGame(type)
    setMode('level')
  }

  const play = (type: GameType, selectedLevel: number, selectedMode: Mode) => {
    setGame(type)
    setLevel(selectedLevel)
    setMode(selectedMode)
  }

  const handleComplete = (result: { success: boolean; score: number; level: number }) => {
    setStats(prev => {
      const next = { ...prev }
      if (game === 'memory') {
        next.memoryAttempts += 1
        if (result.success) next.memoryBest = Math.max(next.memoryBest, result.level)
        next.memoryAccuracy = Math.round(((next.memoryAccuracy * (next.memoryAttempts - 1)) + (result.success ? 100 : 0)) / next.memoryAttempts)
      } else {
        next.motionAttempts += 1
        if (result.success) next.motionBest = Math.max(next.motionBest, result.level)
        const efficiency = result.success ? Math.min(100, result.score / 10) : 0
        next.motionEfficiency = Math.round(((next.motionEfficiency * (next.motionAttempts - 1)) + efficiency) / next.motionAttempts)
      }
      saveStats(next)
      return next
    })
  }

  const home = () => setMode('home')

  if (mode === 'progressive' || mode === 'exam') {
    return (
      <div className="app-shell">
        <Header theme={theme} onTheme={toggleTheme} onHome={home} />
        <main className="main game-main">
          {game === 'memory' ? (
            <MemoryGame level={level} exam={mode === 'exam'} onComplete={handleComplete} onExit={home} />
          ) : (
            <MotionGame level={level} exam={mode === 'exam'} onComplete={handleComplete} onExit={home} />
          )}
        </main>
      </div>
    )
  }

  if (mode === 'level') {
    return (
      <div className="app-shell">
        <Header theme={theme} onTheme={toggleTheme} onHome={home} />
        <main className="main">
          <section className="page-intro compact">
            <button className="back-button" onClick={home}>← Back</button>
            <span className="eyebrow">{game === 'memory' ? 'MEMORY CHALLENGE' : 'MOTION CHALLENGE'}</span>
            <h1>Select a difficulty level.</h1>
            <p>Each level generates a fresh puzzle. Repeat any level as many times as you want.</p>
          </section>
          <LevelGrid maxLevel={LEVELS} bestLevel={game === 'memory' ? stats.memoryBest : stats.motionBest} onSelect={l => play(game, l, 'progressive')} />
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Header theme={theme} onTheme={toggleTheme} onHome={home} />
      <main className="main">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">COGNITIVE PRACTICE / 01</span>
            <h1>Train the two<br /><em>games that matter.</em></h1>
            <p>Focused practice for the Memory/Grid and Motion challenges. Lightweight, responsive and designed to work smoothly even on slow connections.</p>
          </div>
          <div className="hero-note">
            <span>NO ACCOUNT</span>
            <span>NO BACKEND</span>
            <span>LOCAL PROGRESS</span>
          </div>
        </section>

        <section className="game-grid">
          <ModeCard
            meta="01 / WORKING MEMORY"
            title="Memory Challenge"
            description="Remember where the dots appeared and reproduce their order. Unlimited generated practice."
            onClick={() => openLevel('memory')}
          />
          <ModeCard
            meta="02 / COMPLEX PLANNING"
            title="Motion Challenge"
            description="Move the constrained blocks to open a route from the ball to the target. Unlimited generated practice."
            onClick={() => openLevel('motion')}
          />
        </section>

        <section className="training-section">
          <div className="section-head">
            <div>
              <span className="eyebrow">TRAINING MODES</span>
              <h2>Practice without friction.</h2>
            </div>
            <span className="muted">30 calibrated tiers · unlimited attempts</span>
          </div>
          <div className="training-grid">
            <ModeCard meta="PROGRESSIVE" title="Climb" description="Start at Level 1 and work upward. The difficulty increases as you improve." onClick={() => play('memory', 1, 'progressive')} />
            <ModeCard meta="EXAM SIMULATION" title="Timed Memory" description="Run a focused timed session based on the published nine-minute Grid Challenge format." onClick={() => play('memory', 1, 'exam')} />
            <ModeCard meta="EXAM SIMULATION" title="Timed Motion" description="Run a focused timed session based on the published six-minute Motion Challenge format." onClick={() => play('motion', 1, 'exam')} />
          </div>
        </section>

        <section className="stats-section">
          <div className="section-head">
            <div>
              <span className="eyebrow">YOUR LOCAL RECORD</span>
              <h2>Progress.</h2>
            </div>
            <span className="muted">Saved only on this device</span>
          </div>
          <div className="stats-grid">
            <Stat label="Memory best" value={`L${stats.memoryBest}`} />
            <Stat label="Memory accuracy" value={`${stats.memoryAccuracy}%`} />
            <Stat label="Motion best" value={`L${stats.motionBest}`} />
            <Stat label="Motion efficiency" value={`${stats.motionEfficiency}%`} />
          </div>
        </section>

        <footer className="footer">
          <span>Built for practice. Not affiliated with Capgemini or Aon.</span>
          <span>Fast by design · no external assets</span>
        </footer>
      </main>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="stat"><span>{label}</span><strong>{value}</strong></div>
}
