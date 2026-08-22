import { formatDateKey, isToday, shortWeekday, todayKey } from '../utils/date'
import type { DayStats } from '../hooks/useDashboardData'
import { ProgressBar } from './ProgressBar'

interface HeaderProps {
  activeDate: string
  overallStats: DayStats
  streak: number
  last7Days: { date: string; stats: DayStats }[]
  onShift: (delta: number) => void
  onGoToToday: () => void
  onSelectDate: (date: string) => void
  onCopyYesterday: () => void
  hasYesterdayData: boolean
}

export function Header({
  activeDate,
  overallStats,
  streak,
  last7Days,
  onShift,
  onGoToToday,
  onSelectDate,
  onCopyYesterday,
  hasYesterdayData,
}: HeaderProps) {
  const today = isToday(activeDate)

  return (
    <header className="mb-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Daily Agenda</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {formatDateKey(activeDate, 'weekday')}, {formatDateKey(activeDate)}
            {today && <span className="ml-2 rounded-full bg-violet-100 dark:bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-600 dark:text-violet-300">Today</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-500/15 px-3 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-300">
              <span aria-hidden="true">🔥</span>
              {streak} day{streak === 1 ? '' : 's'}
            </div>
          )}
          <div className="flex items-center rounded-full border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <button
              type="button"
              onClick={() => onShift(-1)}
              aria-label="Previous day"
              className="px-2.5 py-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              ←
            </button>
            <button
              type="button"
              onClick={onGoToToday}
              disabled={today}
              className="px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => onShift(1)}
              aria-label="Next day"
              className="px-2.5 py-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4">
        <div className="flex-1">
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <span>Today's overall progress</span>
            <span>{overallStats.done}/{overallStats.total} complete ({overallStats.percent}%)</span>
          </div>
          <ProgressBar percent={overallStats.percent} colorClass="bg-violet-500" heightClass="h-2.5" />
        </div>

        {!today && hasYesterdayData && overallStats.total === 0 && (
          <button
            type="button"
            onClick={onCopyYesterday}
            className="shrink-0 rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Copy yesterday's list
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {last7Days.map(({ date, stats }) => {
          const selected = date === activeDate
          const label = shortWeekday(date)
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs shrink-0 border transition-colors ${
                selected
                  ? 'border-violet-400 bg-violet-50 dark:bg-violet-500/10 dark:border-violet-500/50'
                  : 'border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <span className="font-medium text-neutral-500 dark:text-neutral-400">
                {date === todayKey() ? 'Today' : label}
              </span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${
                  stats.total === 0
                    ? 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600'
                    : stats.percent === 100
                      ? 'bg-emerald-500 text-white'
                      : 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300'
                }`}
              >
                {stats.total === 0 ? '–' : `${stats.percent}%`}
              </span>
            </button>
          )
        })}
      </div>
    </header>
  )
}
