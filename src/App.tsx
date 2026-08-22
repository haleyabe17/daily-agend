import { CATEGORIES } from './types'
import { useDashboardData } from './hooks/useDashboardData'
import { Header } from './components/Header'
import { CategoryCard } from './components/CategoryCard'

function App() {
  const {
    activeDate,
    day,
    addGoal,
    toggleGoal,
    removeGoal,
    setPriority,
    reorderGoals,
    copyFromYesterday,
    hasYesterdayData,
    goToDate,
    goToToday,
    shiftDate,
    getDayStats,
    categoryStats,
    streak,
    last7Days,
  } = useDashboardData()

  const overallStats = getDayStats(activeDate)

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Header
          activeDate={activeDate}
          overallStats={overallStats}
          streak={streak}
          last7Days={last7Days}
          onShift={shiftDate}
          onGoToToday={goToToday}
          onSelectDate={goToDate}
          onCopyYesterday={copyFromYesterday}
          hasYesterdayData={hasYesterdayData}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {CATEGORIES.map((meta) => {
            const goals = day.categories[meta.id]
            return (
              <CategoryCard
                key={meta.id}
                meta={meta}
                goals={goals}
                stats={categoryStats(goals)}
                onAdd={(text, priority) => addGoal(meta.id, text, priority)}
                onToggle={(goalId) => toggleGoal(meta.id, goalId)}
                onRemove={(goalId) => removeGoal(meta.id, goalId)}
                onSetPriority={(goalId, priority) => setPriority(meta.id, goalId, priority)}
                onReorder={(fromId, toId) => reorderGoals(meta.id, fromId, toId)}
              />
            )
          })}
        </div>

        <footer className="mt-8 text-center text-xs text-neutral-400 dark:text-neutral-600">
          Saved automatically in this browser.
        </footer>
      </main>
    </div>
  )
}

export default App
