export function toDateKey(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function addDays(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + delta)
  return toDateKey(date)
}

export function isToday(dateKey: string): boolean {
  return dateKey === todayKey()
}

const WEEKDAY_FORMAT = new Intl.DateTimeFormat(undefined, { weekday: 'long' })
const SHORT_WEEKDAY_FORMAT = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
const FULL_DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

function keyToDate(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDateKey(dateKey: string, opts: 'weekday' | 'full' = 'full'): string {
  const date = keyToDate(dateKey)
  return opts === 'weekday' ? WEEKDAY_FORMAT.format(date) : FULL_DATE_FORMAT.format(date)
}

export function shortWeekday(dateKey: string): string {
  return SHORT_WEEKDAY_FORMAT.format(keyToDate(dateKey))
}
