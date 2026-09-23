# Daily Agenda

A personal dashboard for planning your day and checking off goals across
four categories: **Daily Goals & Plans**, **Health**, **Life**, and **Work** —
plus a **Training** tab for building and tracking a calisthenics program.

## Features

### Agenda

- Add, check off, and delete items in each category
- Drag-and-drop reordering within a category
- Priority tags (High / Medium / Low) — click a tag to cycle it
- Per-category and overall progress bars
- Daily reset: each day starts with a fresh list, with a 7-day strip to
  jump back to previous days and a "copy yesterday's list" shortcut
- Streak counter for consecutive fully-completed days
### Training (calisthenics)

- **Program builder** — start from a template (Beginner Full Body, Push/Pull/Legs,
  Upper/Lower, Skills & Strength) or from scratch. Each workout day has its
  scheduled weekdays and a list of exercises with sets, rep range (or hold time
  in seconds), added weight, rest time, tempo, and notes/form cues.
- **Exercise library** of ~55 calisthenics movements organised into progression
  chains (e.g. Incline → Knee → Push-up → Diamond → Archer → One-arm).
- **Weekly view** — see what's scheduled each day, what you've completed, and
  what you missed; plus sessions this week, week streak, and total workouts.
- **Workout logger** — log reps/seconds and weight per set, check sets off,
  automatic rest timer (with beep/vibration), built-in stopwatch for holds,
  add/remove sets, session RPE and notes. Inputs are pre-filled from last time.
- **Progression suggestions** — when every set hits the top of the range the app
  suggests adding weight or moving to the harder variation; when most sets fall
  short it suggests the easier one.
- **History** of every session and a **Progress** table with personal records,
  latest best set, and change since your first session for each exercise.
- kg / lb units, multiple programs, and JSON export/import for backups.

### Storage

- Data is saved automatically in your browser's local storage — no
  account or backend required

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
npm run lint     # lint
```
