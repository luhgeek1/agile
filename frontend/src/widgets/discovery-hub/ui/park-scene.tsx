import { Mascot } from '@/entities/wallet'

export function ParkScene() {
  return (
    <div className="park-scene" aria-hidden="true">
      <svg className="park-path" viewBox="0 0 480 280" fill="none">
        <ellipse cx="240" cy="157" rx="216" ry="103" fill="#d5e5cf" />
        <path d="M48 214C92 270 212 243 193 193S72 134 145 92S351 41 376 100S305 143 347 194S437 213 446 178" stroke="#f9fbef" strokeWidth="22" strokeLinecap="round" />
        <path d="M48 214C92 270 212 243 193 193S72 134 145 92S351 41 376 100S305 143 347 194S437 213 446 178" stroke="#a9bf9e" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
        <path d="M73 83v-19m-8 10 8 9 8-9M421 230v-19m-8 10 8 9 8-9" stroke="#6e9367" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="278" cy="49" r="5" fill="#d7b33e" />
        <circle cx="89" cy="169" r="4" fill="#d7b33e" />
      </svg>
      <Mascot category="save" className="park-guide-save" />
      <Mascot category="spend" className="park-guide-spend" />
      <Mascot category="help" className="park-guide-help" />
      <span className="park-scene-caption">Три друга. Много открытий.</span>
    </div>
  )
}
