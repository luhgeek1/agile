import type { Illustration } from '@/shared/api/contracts'

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
