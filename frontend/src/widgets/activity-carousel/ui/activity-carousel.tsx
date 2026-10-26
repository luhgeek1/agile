import { ActivityCard, type Activity } from '@/entities/activity'
import useEmblaCarousel from 'embla-carousel-react'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { useEffect, useId, useState, type KeyboardEvent } from 'react'

export function ActivityCarousel({
  activities,
  onOpen,
}: {
  activities: Activity[]
  onOpen: (activity: Activity) => void
}) {
  const reducedMotion = useReducedMotion()
  const viewportId = useId()
  const [initialIndex] = useState(() =>
    Math.max(
      0,
      activities.findIndex((a) => !a.completed_at),
    ),
  )
  const [selectedIndex, setSelectedIndex] = useState(initialIndex)
  const [viewportRef, carousel] = useEmblaCarousel({
    loop: true,
    startIndex: initialIndex,
    duration: reducedMotion ? 0 : 22,
  })

  useEffect(() => {
    if (!carousel) return
    const updateSelection = () => setSelectedIndex(carousel.selectedScrollSnap())
    updateSelection()
    carousel.on('select', updateSelection).on('reInit', updateSelection)
    return () => {
      carousel.off('select', updateSelection).off('reInit', updateSelection)
    }
  }, [carousel])

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    if (event.key === 'ArrowLeft') carousel?.scrollPrev(!!reducedMotion)
    else carousel?.scrollNext(!!reducedMotion)
  }
  if (!activities.length) return null
  const completed = activities.filter((activity) => activity.completed_at).length

  return (
    <section
      className="activity-carousel"
      role="region"
      aria-roledescription="карусель"
      aria-label="Задания для полезных привычек"
      onKeyDown={onKeyDown}
    >
      <div className="activity-carousel-stage">
        <div className="activity-carousel-viewport" id={viewportId} ref={viewportRef}>
          <div className="activity-carousel-track">
            {activities.map((activity, index) => (
              <div
                className="activity-carousel-slide"
                key={activity.id}
                role="group"
                aria-roledescription="слайд"
                aria-label={`${index + 1} из ${activities.length}: ${activity.title}`}
                aria-hidden={selectedIndex !== index}
                inert={selectedIndex !== index}
                data-active={selectedIndex === index ? 'true' : undefined}
              >
                <ActivityCard activity={activity} featured onOpen={onOpen} />
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="activity-carousel-arrow activity-carousel-prev"
          aria-label="Предыдущее задание"
          aria-controls={viewportId}
          disabled={!carousel || activities.length < 2}
          onClick={() => carousel?.scrollPrev(!!reducedMotion)}
        >
          <ChevronLeft size={22} strokeWidth={2} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="activity-carousel-arrow activity-carousel-next"
          aria-label="Следующее задание"
          aria-controls={viewportId}
          disabled={!carousel || activities.length < 2}
          onClick={() => carousel?.scrollNext(!!reducedMotion)}
        >
          <ChevronRight size={22} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
      <div className="activity-carousel-footer">
        <span role="status" aria-live="polite" aria-atomic="true">
          Задание {selectedIndex + 1} из {activities.length}
        </span>
        <span>
          <CheckCircle2 size={15} aria-hidden="true" />
          Выполнено: {completed} из {activities.length}
        </span>
      </div>
    </section>
  )
}
