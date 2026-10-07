interface Props {
  title: string
  description: string
  meta: string
  onClick: () => void
}

export function ModeCard({ title, description, meta, onClick }: Props) {
  return (
    <button className="mode-card" onClick={onClick}>
      <div>
        <span className="eyebrow">{meta}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <span className="arrow">↗</span>
    </button>
  )
}
