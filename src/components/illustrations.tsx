import type { Category, Illustration } from '../lib/types'

// Original vector illustrations; these are prototype artwork, not official НЦФГ branding.
export function Jar({ category, className = '' }: { category: Category; className?: string }) {
  const color = { save: '#159FAA', spend: '#DD568A', help: '#DFAF20' }[category]
  const pale = { save: '#DDF3F3', spend: '#FBE6EF', help: '#FFF2C6' }[category]
  return (
    <svg viewBox="0 0 210 170" fill="none" className={`jar ${className}`} aria-hidden="true">
      <ellipse cx="104" cy="155" rx="66" ry="6" fill={color} opacity=".1" />
      <path d="M55 65q-5 0-5 12l-7 60q0 13 15 13h94q15 0 14-13l-7-60q0-12-6-12" fill={color} />
      <path d="M56 66h97v13H56z" fill="#26343B" opacity=".12" />
      <rect
        x="46"
        y="52"
        width="118"
        height="20"
        rx="9"
        fill={color}
        stroke="#26343B"
        strokeWidth="2.5"
      />
      <path d="M83 60h44" stroke="#26343B" strokeWidth="4" strokeLinecap="round" />
      <path d="M66 87v41" stroke="white" strokeWidth="5" strokeLinecap="round" opacity=".3" />
      <circle cx="88" cy="105" r="3.5" fill="#26343B" />
      <circle cx="123" cy="105" r="3.5" fill="#26343B" />
      <path d="M98 117q7 7 14 0" stroke="#26343B" strokeWidth="2.7" strokeLinecap="round" />
      <ellipse cx="78" cy="115" rx="6" ry="3" fill={pale} opacity=".65" />
      <ellipse cx="134" cy="115" rx="6" ry="3" fill={pale} opacity=".65" />
      {category === 'save' && (
        <>
          <circle cx="108" cy="28" r="18" fill="#FFF2C6" stroke="#DFAF20" strokeWidth="2.5" />
          <path
            d="M108 19v18m-4-16h6a4 4 0 0 1 0 8h-7m0 4h8"
            stroke="#A27B09"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="m159 24 4 7 8 2-7 5-1 8-5-6-8-1 6-5Z" fill="#DFAF20" />
        </>
      )}
      {category === 'spend' && (
        <>
          <path d="m87 15 25-4 11 28-30 7Z" fill="#FFF2C6" stroke="#DFAF20" strokeWidth="2" />
          <path d="m94 23 14-2m-11 9 15-2" stroke="#A27B09" strokeWidth="2" strokeLinecap="round" />
          <path
            d="m168 86 9-5m-4 14 10 2M41 34l7 7"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
      {category === 'help' && (
        <>
          <path
            d="M108 43S81 28 89 17q8-10 19 1 12-11 20-1 9 12-20 26Z"
            fill="#DD568A"
            stroke="#C82D70"
            strokeWidth="2"
          />
          <path
            d="m39 84 5-4m124-43 7-8m-9 18 10-1"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
      <path
        d="M32 117q-8-5-5-12m148 25q11-5 10-14"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
export function GoalArt({
  kind = 'bike',
  className = '',
}: {
  kind?: Illustration
  className?: string
}) {
  return (
    <svg viewBox="0 0 300 175" fill="none" className={`goal-art ${className}`} aria-hidden="true">
      <path d="M24 152h252" stroke="#D9C88E" strokeWidth="2" strokeLinecap="round" />
      {kind === 'bike' ? (
        <>
          <circle cx="78" cy="112" r="38" fill="#FBF7ED" stroke="#26343B" strokeWidth="4" />
          <circle cx="230" cy="112" r="38" fill="#FBF7ED" stroke="#26343B" strokeWidth="4" />
          <circle cx="78" cy="112" r="29" stroke="#E6E2D9" strokeWidth="2" />
          <circle cx="230" cy="112" r="29" stroke="#E6E2D9" strokeWidth="2" />
          <path
            d="m78 112 43-65 36 65H78l44-65h85l-50 65m50-65 23 65m-23-65-9-26h-23"
            stroke="#159FAA"
            strokeWidth="7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path d="M108 45h30" stroke="#26343B" strokeWidth="7" strokeLinecap="round" />
          <circle cx="157" cy="112" r="7" fill="#26343B" />
          <path d="m157 112 13 10h11" stroke="#26343B" strokeWidth="3" strokeLinecap="round" />
          <path d="m207 37 23-2-3 20-14 2" fill="#DD568A" />
          <path d="m212 38 3 17m6-18 3 17" stroke="#C82D70" strokeWidth="2" />
          <path
            d="m50 47 2-9m-9 15-8-3m222 17 6-8m-1 17 10 1"
            stroke="#DFAF20"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      ) : kind === 'book' ? (
        <>
          <path
            d="M47 42q50-17 103 8 54-25 103-8v98q-52-14-103 9-51-23-103-9Z"
            fill="#DDF3F3"
            stroke="#159FAA"
            strokeWidth="4"
          />
          <path
            d="M150 50v99M66 66q30-7 64 7m-64 14q30-7 64 7m-64 14q30-7 64 7m40-42q32-14 62-7m-62 28q32-14 62-7m-62 28q32-14 62-7"
            stroke="#159FAA"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      ) : kind === 'skates' ? (
        <>
          <path
            d="M92 30h54v47l61 22q12 5 12 20v15H72V87h20Z"
            fill="#DD568A"
            stroke="#26343B"
            strokeWidth="3"
          />
          <path
            d="M110 49h34m-34 15h34m-28 17h31m-27 14h46"
            stroke="#FBE6EF"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="91" cy="145" r="13" fill="#DFAF20" stroke="#26343B" strokeWidth="3" />
          <circle cx="144" cy="145" r="13" fill="#DFAF20" stroke="#26343B" strokeWidth="3" />
          <circle cx="198" cy="145" r="13" fill="#DFAF20" stroke="#26343B" strokeWidth="3" />
        </>
      ) : (
        <>
          <path
            d="m150 17 26 43 50 12-34 39 3 48-45-19-45 19 3-48-34-39 50-12Z"
            fill="#DFAF20"
            stroke="#26343B"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="135" cy="89" r="4" fill="#26343B" />
          <circle cx="165" cy="89" r="4" fill="#26343B" />
          <path d="M139 107q11 11 22 0" stroke="#26343B" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}
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
