import type { Category } from '@/shared/api/contracts'
import { useId } from 'react'

const materials = {
  save: { light: '#79DFD6', mid: '#24B8B0', dark: '#12867F', rim: '#B5F3E9', cheek: '#D4FFF1' },
  spend: { light: '#FFC2D7', mid: '#ED7CA6', dark: '#C7507C', rim: '#FFE1EB', cheek: '#FFE5ED' },
  help: { light: '#FFE599', mid: '#F4C44B', dark: '#CC9626', rim: '#FFF0BE', cheek: '#FFF6D8' },
}

/** Lightweight vector toys: the gradients describe the material, not the UI surface. */
export function Jar({ category, className = '' }: { category: Category; className?: string }) {
  const id = useId().replace(/:/g, '')
  const material = materials[category]
  const fill = (part: string) => `url(#${id}-${part})`
  return (
    <svg viewBox="0 0 240 200" fill="none" className={`jar ${className}`} aria-hidden="true">
      <defs>
        <linearGradient
          id={`${id}-body`}
          x1="68"
          y1="75"
          x2="177"
          y2="159"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={material.light} />
          <stop offset=".48" stopColor={material.mid} />
          <stop offset="1" stopColor={material.dark} />
        </linearGradient>
        <linearGradient
          id={`${id}-lid`}
          x1="64"
          y1="61"
          x2="172"
          y2="88"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={material.rim} />
          <stop offset=".45" stopColor={material.light} />
          <stop offset="1" stopColor={material.dark} />
        </linearGradient>
        <linearGradient
          id={`${id}-gold`}
          x1="97"
          y1="9"
          x2="131"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFF4B9" />
          <stop offset=".5" stopColor="#FFDA66" />
          <stop offset="1" stopColor="#D9A32B" />
        </linearGradient>
        <linearGradient
          id={`${id}-heart`}
          x1="103"
          y1="11"
          x2="137"
          y2="49"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFB6CB" />
          <stop offset=".5" stopColor="#EF79A0" />
          <stop offset="1" stopColor="#C74F7A" />
        </linearGradient>
      </defs>
      <ellipse cx="122" cy="181" rx="67" ry="7" fill={material.dark} opacity=".1" />
      <g className="jar-character">
        <path d="M72 150v17c0 11 24 12 25 1v-11m48-3v14c0 12 25 11 25-1v-20" fill={material.dark} />
        <path
          d="M65 108c-23-7-30 7-23 22"
          stroke={material.mid}
          strokeWidth="12"
          strokeLinecap="round"
        />
        <circle cx="43" cy="131" r="8" fill={material.light} />
        <path
          d={category === 'help' ? 'M174 111c20 3 26-10 26-23' : 'M176 110c24-7 28 10 21 22'}
          stroke={material.dark}
          strokeWidth="12"
          strokeLinecap="round"
        />
        <circle
          cx={category === 'help' ? 200 : 196}
          cy={category === 'help' ? 86 : 133}
          r="8"
          fill={material.light}
        />
        <path
          d="M66 77c-3 15-8 53-8 69 0 23 26 29 62 29s62-6 62-29c0-16-5-54-8-69Z"
          fill={fill('body')}
        />
        <path
          d="M73 88c-3 13-5 30-5 43"
          stroke="white"
          strokeOpacity=".36"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M78 153c19 10 52 12 75 4"
          stroke={material.light}
          strokeOpacity=".35"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M64 72h112v15c-23 9-89 9-112 0Z" fill={material.dark} />
        <rect x="57" y="63" width="126" height="22" rx="10" fill={fill('lid')} />
        <ellipse cx="120" cy="65" rx="62" ry="12" fill={material.light} />
        <ellipse cx="116" cy="62" rx="49" ry="6" fill={material.rim} opacity=".7" />
        <path d="M98 65h44" stroke={material.dark} strokeWidth="5" strokeLinecap="round" />
        <path d="M99 63h42" stroke="#244E4A" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="99" cy="117" rx="4" ry="5.5" fill="#244640" />
        <ellipse cx="141" cy="117" rx="4" ry="5.5" fill="#244640" />
        <circle cx="100" cy="115" r="1.3" fill="white" />
        <circle cx="142" cy="115" r="1.3" fill="white" />
        <ellipse cx="85" cy="129" rx="8" ry="4.5" fill={material.cheek} opacity=".65" />
        <ellipse cx="155" cy="129" rx="8" ry="4.5" fill={material.cheek} opacity=".65" />
        <path d="M111 129q9 10 18 0" stroke="#244640" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g className="jar-accessory">
        {category === 'save' && (
          <g transform="rotate(-13 119 29)">
            <rect x="99" y="8" width="39" height="43" rx="19" fill="#C69425" />
            <ellipse cx="116" cy="28" rx="19" ry="21" fill={fill('gold')} />
            <ellipse cx="116" cy="28" rx="14" ry="16" stroke="#D6A43A" strokeWidth="1.5" />
            <path
              d="M113 38V19h6a5 5 0 0 1 0 10h-9m0 4h12"
              stroke="#966914"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path d="M106 17q3-4 7-4" stroke="#FFF9DF" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}
        {category === 'spend' && (
          <g transform="rotate(12 123 31)">
            <path d="M104 19h37l3 31c-11 5-31 5-43 0Z" fill="#D3A341" />
            <path d="M100 18h36l3 31c-11 5-30 5-42 0Z" fill={fill('gold')} />
            <path
              d="M109 23V14a8 8 0 0 1 16 0v9"
              stroke="#AE7A22"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="m111 35 5 5 10-11"
              stroke="#AE7A22"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}
        {category === 'help' && (
          <g transform="rotate(9 121 30)">
            <path
              d="M122 51c-7-5-31-18-28-32 3-14 19-16 28-4 9-12 25-10 28 4 3 14-21 27-28 32Z"
              fill="#BD4A72"
            />
            <path
              d="M119 48c-7-5-31-18-28-32 3-14 19-16 28-4 9-12 25-10 28 4 3 14-21 27-28 32Z"
              fill={fill('heart')}
            />
            <path d="M100 17q3-8 11-4" stroke="#FFD9E4" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}
      </g>
    </svg>
  )
}
