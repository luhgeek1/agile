import type { Activity } from '@/entities/activity'
import { CategoryIcon, Mascot } from '@/entities/wallet'
import { ArrowRight, ArrowUpRight, Check, ChevronRight, Clock3 } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'

export function HomeTasks({
  activities,
  onOpen,
}: {
  activities: Activity[]
  onOpen: (activity: Activity, focus: HTMLElement) => void
}) {
  const next = activities.find((activity) => !activity.completed_at) ?? activities[0]
  if (!next) return null

  const completed = activities.filter((activity) => activity.completed_at).length
  const tasks = [next, ...activities.filter((activity) => activity.id !== next.id)]

  return (
    <section className="home-task" aria-labelledby="home-task-title">
      <div className="section-heading home-panel-heading">
        <h2 id="home-task-title">Выбери задание</h2>
        <Link className="text-link" href="/app/activities">
          Все задания <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <div className="task-board">
        <div className="task-board-progress">
          <span role="status">
            Выполнено {completed} из {activities.length}
          </span>
          <progress
            className="sr-only"
            value={completed}
            max={activities.length}
            aria-label="Прогресс заданий"
          />
          <span className="task-progress-track" aria-hidden="true">
            <span style={{ transform: `scaleX(${completed / activities.length})` }} />
          </span>
        </div>
        <ul className="task-board-list">
          {tasks.map((activity, index) => {
            const featured = index === 0
            const done = Boolean(activity.completed_at)
            const action = done ? 'Вспомнить' : featured ? 'Начать задание' : 'Открыть задание'
            return (
              <motion.li
                key={activity.id}
                layout="position"
                layoutDependency={next.id}
                transition={{ type: 'spring', duration: 0.32, bounce: 0 }}
              >
                <button
                  type="button"
                  className={`task-row ${activity.category}${featured ? ' task-row-featured' : ''}`}
                  onClick={(event) => onOpen(activity, event.currentTarget)}
                  aria-label={`${action} «${activity.title}»${done ? ', выполнено' : ''}`}
                >
                  <span className="task-row-icon" aria-hidden="true">
                    {done ? (
                      <Check size={19} />
                    ) : (
                      <CategoryIcon category={activity.category} size={19} />
                    )}
                  </span>
                  <span className="task-row-copy">
                    <strong>{activity.title}</strong>
                    {featured && (
                      <span className="task-row-description">{activity.description}</span>
                    )}
                    <span className="task-row-meta">
                      {featured && <Clock3 size={14} aria-hidden="true" />}
                      {done ? 'Выполнено' : activity.duration}
                    </span>
                    {featured && (
                      <span className="task-row-action" aria-hidden="true">
                        {action} <ArrowRight size={16} />
                      </span>
                    )}
                  </span>
                  {featured ? (
                    <Mascot category={activity.category} className="task-row-mascot" />
                  ) : (
                    <ChevronRight className="task-row-chevron" size={18} aria-hidden="true" />
                  )}
                </button>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
