export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand ${compact ? 'compact' : ''}`}>
      <span className="brand-symbol" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="brand-words">
        Коплю<span>Трачу · Помогаю</span>
      </span>
    </span>
  )
}
