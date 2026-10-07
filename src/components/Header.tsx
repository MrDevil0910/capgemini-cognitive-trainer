import type { Theme } from '../lib/types'

interface Props {
  theme: Theme
  onTheme: () => void
  onHome: () => void
}

export function Header({ theme, onTheme, onHome }: Props) {
  return (
    <header className="topbar">
      <button className="brand" onClick={onHome} aria-label="Go home">
        <span className="brand-mark">C</span>
        <span>Cognitive Trainer</span>
      </button>
      <div className="top-actions">
        <button className="icon-button" onClick={onTheme} aria-label="Change theme" title="Change theme">
          {theme === 'dark' ? '☼' : '◐'}
        </button>
      </div>
    </header>
  )
}
