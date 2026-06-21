# Habit Calculations — Technical Reference

> **Location:** `apps/desktop/src/features/habits/habits.selectors.ts`  
> **Utility dependencies:** `apps/desktop/src/utils/consistency.ts`

This document explains every calculation used in the Sanctuary Identity-Based Habit system. It covers the mathematical formula, design decisions, edge cases, and known limitations for each function.

---

## 1. `buildCompletionMap`

### Purpose

Converts the flat array of `HabitCompletion` records returned from the database into an efficient nested `Map` for O(1) lookups during rendering.

### Output shape

```
Map<habitId, Map<dateString (YYYY-MM-DD), tier ('mini' | 'plus' | 'elite')>>
```

### Behaviour

- Each `HabitCompletion` record contains `{ habitId, completedAt (YYYY-MM-DD), tier }`.
- The outer map is keyed by `habitId`.
- The inner map is keyed by date string — enabling `O(1)` "was this habit done on this date?" checks.

> **Constraint:** The database schema enforces a `UNIQUE(habitId, completedAt)` index, so duplicate entries are impossible. The map structure reflects this 1-entry-per-day guarantee.

---

## 2. `calculateConsistency`

### Purpose

Answers: _"How consistently has this person shown up for this identity over the last N days?"_

### Signature

```ts
calculateConsistency(habit: Habit, completions: Map<string, string>, days = 30): number
```

### Formula

```
consistency = min(100, round(completedCount / scheduledCount × 100))
```

Where:

- `scheduledCount` = number of days in the window where the habit **was due**
- `completedCount` = number of those scheduled days where it **was completed** + any bonus unscheduled completions

### Detailed logic (per day in the window)

```
for each of the last `days` days:
  if habit was SCHEDULED on this day:
    scheduledCount++
    if completed on this day → completedCount++
  else (habit NOT scheduled — rest day):
    if completed anyway → completedCount++ (bonus, no penalty)
```

### Edge cases

| Scenario                                  | Behaviour                                              |
| ----------------------------------------- | ------------------------------------------------------ |
| New habit (0 scheduled days in window)    | Returns `100` if any bonus completions exist, else `0` |
| Completed every scheduled day             | Returns `100`                                          |
| Completed on scheduled + bonus rest days  | Can push count above scheduled, capped to `100`        |
| Never completed, never scheduled          | Returns `0`                                            |
| `weekdays` habit, user skips all weekends | Weekends are invisible — consistency not penalised     |

### ⚠️ Timezone bug (fixed)

**Was:** `d.toISOString().split('T')[0]`  
`toISOString()` converts to UTC. A user in `UTC+2` at 11 PM would see the _previous_ calendar day as today — causing completions logged at local midnight to be invisible until the next UTC rollover.

**Fix:** All date strings now use `toLocalDateString(d)` backed by `date-fns/format(d, 'yyyy-MM-dd')` — always using the user's **local wall-clock date**.

### Why scheduled days are the denominator (not total days)

Using total days punishes the user for following their own schedule. A `weekdays` habit completed perfectly every Monday–Friday would score only **71%** against a 7-day denominator. Using only the days the habit was _due_, 100% means "I showed up every time I said I would."

---

## 3. `calculateIdentityVotes`

### Purpose

Answers: _"How many votes has this person cast for their identity, and how committed were each of those votes?"_

Inspired by James Clear's _Atomic Habits_:

> _"Every action you take is a vote for the type of person you wish to become."_

### Signature

```ts
calculateIdentityVotes(completions: Map<string, string>): number
```

### Formula

```
totalVotes = Σ weight(tier) for each completion
```

### Tier weights

| Tier        | Weight | Meaning                                                  |
| ----------- | ------ | -------------------------------------------------------- |
| `mini`      | 1      | 2-Minute Rule — the floor. Still a vote.                 |
| `plus`      | 2      | Target action — the standard commitment.                 |
| `elite`     | 3      | Bonus action — extra depth of commitment.                |
| _(unknown)_ | 0      | Silently ignored. Cannot occur under DB enum constraint. |

### Design decisions

- **Weighted, not binary.** A "mini" completion is still a vote. Showing up in any capacity matters more than skipping entirely. "Elite" carries more weight because it reflects deeper commitment.
- **Lifetime, not windowed.** Votes accumulate forever. This is a measure of _total evidence_ gathered for an identity. It grows monotonically and never decreases.
- **Not normalised.** Total votes is an absolute count, not a percentage — it gives users a concrete, growing number reflecting their history.

---

## 4. `isScheduledOnDate` / `isScheduledOn`

**Location:** `apps/desktop/src/utils/consistency.ts` (relies on `apps/desktop/src/utils/date.ts`)

### Purpose

Determines whether a habit is due on a given calendar date.

### Logic

| `frequency` | Rule                                                                              |
| ----------- | --------------------------------------------------------------------------------- |
| `every_day` | Always `true`                                                                     |
| `weekdays`  | `true` for Mon–Fri (`getDay()` 1–5)                                               |
| `weekends`  | `true` for Sat–Sun (`getDay()` 0 or 6)                                            |
| `custom`    | Parses `daysOfWeek` comma-separated string and checks if the day name is included |

> **`getDay()` mapping:** Returns `0 = Sunday, 1 = Monday, ..., 6 = Saturday`. The internal `dayNames[]` array matches this exactly.

### Two variants

- `isScheduledOnDate(date: Date, ...)` — takes a JS `Date`. Used inside loops.
- `isScheduledOn(dateStr: string, ...)` — takes a `YYYY-MM-DD` string. Convenience wrapper via `date-fns/parseISO`.

---

## 5. "Never Miss Twice" Detection

### Purpose

Surfaces a gentle recovery prompt when a user missed a scheduled day yesterday **and has not yet completed today** — the critical moment to prevent a slip from becoming a slide.

### Logic

```
yesterdayStr = today − 1 day
missedYesterday = isScheduledOn(yesterday) && !completedYesterday && !completedToday
```

All three conditions must be simultaneously true:

1. The habit was scheduled yesterday (it was a "due" day)
2. It was NOT completed yesterday
3. It has NOT been completed today yet

### Why all three conditions?

- Condition 1: Prevents the alert on rest days
- Condition 2: The slip must have actually occurred
- Condition 3: **Auto-dismisses on recovery** — once the user casts today's vote, the warning silently disappears. No lingering guilt after taking action.

---

## 6. `getLast30DaysList`

**Location:** `apps/desktop/src/utils/date.ts`

### Purpose

Generates the ordered array of `YYYY-MM-DD` strings for the last 30 calendar days, used to render the Evidence Log grid.

### Output

`['2025-05-13', ..., '2025-06-11']` (oldest → newest, chronological order)

### Implementation note

- Iterates `i = 0..29`, subtracting `i` days from `now`
- Uses `toLocalDateString()` (timezone-safe)
- `.reverse()`d so the array is chronological for left-to-right grid rendering

---

## 7. Date Handling & Cross-System Mismatches

Managing dates across a full stack introduces several common pitfalls due to how different systems handle timezones and date boundaries. Sanctuary employs strict rules to prevent these mismatches.

### Known Potential Mismatches

#### 1. Database (SQLite/PostgreSQL) vs. JavaScript (Client/Server)

- **The Problem:** Databases often store timestamps in UTC. JavaScript's `new Date(utcString)` creates a Date object that is immediately adjusted to the browser's local timezone. If a user completes a habit at `23:30` on `2025-06-10` in `UTC-5` (New York), the UTC timestamp saved in the DB might be `04:30` on `2025-06-11`. If the UI extracts the date string from the UTC timestamp, it will look like the user completed it on the 11th.
- **The Solution:** The `HabitCompletion` table relies on an explicit `completedAt` string (format `YYYY-MM-DD`). This date string is generated **on the client** using `toLocalDateString()` at the exact moment of completion. The database stores the _local date string_ the user perceived, circumventing the UTC offset problem entirely for rendering logic.

#### 2. `toISOString()` vs. `toLocalDateString()` (The Timezone Bug)

- **The Problem:** As noted above, `d.toISOString().split('T')[0]` relies on UTC. A user in `UTC+2` at 1:00 AM on `2025-06-11` will have a UTC date of `2025-06-10T23:00:00.000Z`. Calling `.split('T')[0]` results in `2025-06-10`, creating an off-by-one error for the consistency loops.
- **The Solution:** We exclusively use `toLocalDateString()` from `utils/consistency.ts`, which leverages `date-fns/format` (`format(d, 'yyyy-MM-dd')`). This strictly uses the JS runtime's local timezone rules (derived from the OS).

#### 3. Client OS Timezone Changes

- **The Problem:** If a user travels across timezones (e.g., from New York `UTC-5` to London `UTC+0`), their local calendar day shifts. A habit scheduled for "every day" might suddenly appear missed or double-completed if the transition crosses midnight.
- **The Solution:** Because Sanctuary ties completions to the `YYYY-MM-DD` string generated _at the time of interaction_, traveling can result in a "missed" day (if jumping forward) or a "long" day (if jumping backward). This is an accepted limitation of local-first date logging. The system prioritizes the user's perceived calendar day at the time they hit the button.

---

## Accuracy Audit Summary

| Calculation                             | Status     | Notes                                                  |
| --------------------------------------- | ---------- | ------------------------------------------------------ |
| `buildCompletionMap`                    | ✅ Correct | Simple indexing. DB constraint prevents duplicates.    |
| `calculateConsistency` — timezone       | ✅ Fixed   | Was using UTC (`toISOString`) — now uses local date.   |
| `calculateConsistency` — denominator    | ✅ Correct | Schedule-aware. Off-days excluded from denominator.    |
| `calculateConsistency` — bonus cap      | ✅ Correct | `Math.min(100, ...)` prevents scores above 100%.       |
| `calculateIdentityVotes` — tier weights | ✅ Correct | Intentionally weighted 1/2/3.                          |
| `calculateIdentityVotes` — unknown tier | ⚠️ Silent  | Returns 0. Acceptable given DB enum enforcement.       |
| `isScheduledOnDate` — day mapping       | ✅ Correct | `getDay()` 0=Sun matches `dayNames[]` array index.     |
| "Never Miss Twice" detection            | ✅ Correct | All 3 conditions required. Auto-dismisses on recovery. |
| `getLast30DaysList` — timezone          | ✅ Correct | Uses `toLocalDateString`, not `toISOString`.           |
