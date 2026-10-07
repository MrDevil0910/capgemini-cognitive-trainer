interface Props {
  maxLevel: number
  bestLevel: number
  onSelect: (level: number) => void
}

export function LevelGrid({ maxLevel, bestLevel, onSelect }: Props) {
  return (
    <div className="level-grid">
      {Array.from({ length: maxLevel }, (_, i) => i + 1).map(level => (
        <button
          key={level}
          className={`level-button ${level === bestLevel + 1 ? 'next' : ''}`}
          onClick={() => onSelect(level)}
        >
          <span>LEVEL</span>
          <strong>{level}</strong>
        </button>
      ))}
    </div>
  )
}
