'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useId } from 'react'

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: ReadonlyArray<{ value: T; label: string }>
  onChange: (value: T) => void
}) {
  const id = useId()
  const reduced = useReducedMotion()
  return (
    <div className="segmented-control" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.value === value && (
            <motion.span
              className="segment-selection"
              layoutId={`${id}-selection`}
              transition={{ type: 'spring', bounce: 0, duration: reduced ? 0 : 0.3 }}
            />
          )}
          <span className="segment-label">{option.label}</span>
        </button>
      ))}
    </div>
  )
}
