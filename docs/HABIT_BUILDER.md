# Sanctuary: Habit Builder Documentation

The Habit Builder is the core feature of Sanctuary, designed to help users establish and maintain resilient life practices. It intentionally avoids traditional "streaks" to reduce anxiety and prevent the "all-or-nothing" mindset.

## Core Concepts

### 1. Elastic Tiers
Every habit in Sanctuary supports three levels of intensity:
- **Mini (The Floor):** A version so small it's impossible to fail (e.g., "Mediate for 1 minute").
- **Plus (The Goal):** Your standard daily objective (e.g., "Meditate for 10 minutes").
- **Elite (The Ceiling):** Your best-day performance (e.g., "Meditate for 30 minutes").

**Any tier completion counts as a win.** This ensures that even on your busiest days, you can maintain the identity of someone who practices the habit.

### 2. Identity-Based Tracking
Instead of just tracking tasks, Sanctuary links every habit to an identity (e.g., "I am a mindful person"). Each completion is a "vote" for your future self.
- **Identity Strength:** A weighted score that increases over your lifetime. Mini = 1 vote, Plus = 2 votes, Elite = 3 votes.

### 3. Rolling Consistency
Success is measured by your **30-Day Consistency Score (%)**. 
- Missing a day only slightly lowers your percentage (e.g., 100% → 97%).
- Your progress never resets to zero. This builds resilience and encourages you to return to your practice immediately after a break.

## UI/UX Principles

- **No Failure States:** You will never see red "X" marks or "0 day streak" counters.
- **Ambient Feedback:** The vibrancy of your Sanctuary Landscape reflects your overall consistency.
- **Gentle Language:** Sanctuary welcomes you back after a break rather than punishing you for it.

## For Developers

### Database Schema
- `habits`: Stores identity labels and tier descriptions.
- `habit_completions`: Records the `tier` for every completion.

### Logic
- All metrics are calculated dynamically in the frontend selectors (`habits.selectors.ts`) to ensure accuracy without the need for complex database sync jobs.
- The `consistency.ts` utility handles date calculations for rolling windows.
