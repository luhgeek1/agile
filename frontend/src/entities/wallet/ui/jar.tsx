import type { Category } from '@/shared/api/contracts'

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
