# Sanctuary Terminology Guide

This guide establishes a unified vocabulary across the Sanctuary application to ensure consistency between technical code, database models, and the user-facing interface.

Strictly adhere to these definitions when writing copy, naming variables, or communicating with the user.

## Core Terminology

### 1. Journal

- **Definition**: The parent domain, feature area, or overarching container.
- **Usage Rules**:
  - Use as a noun to describe the app module (e.g., "The Journal", "Journal Settings").
  - Use as a prefix for technical components (e.g., `JournalEditor`, `useJournalMutations`).
  - **DO NOT** use "Journal" to refer to an individual written record.
- **Examples**:
  - ✅ "Welcome to your journal."
  - ❌ "Delete this journal."

### 2. Entry

- **Definition**: The technical data object and the unit of action for a written record.
- **Usage Rules**:
  - Use strictly for **actions**, **buttons**, **toasts**, and **system dialogs**.
  - Use for all underlying database models, API calls, and component props (e.g., `EntryCard`, `deleteEntry`).
  - When a user performs a direct, literal action on a record, it is an "Entry".
- **Examples**:
  - ✅ "Delete Entry" (Button / Dialog Title)
  - ✅ "Save entry" (Button)
  - ✅ "Entry restored." (Toast)
  - ❌ "Read full entry." (Too technical for passive consumption)

### 3. Reflection

- **Definition**: The poetic, user-facing representation of an Entry.
- **Usage Rules**:
  - Use exclusively in **display labels**, **reading states**, **empty states**, and **headers** to foster a safe, mindful aesthetic.
  - Use when describing the content the user is reading or creating in a passive context.
  - **DO NOT** use in action buttons (e.g., "Delete Reflection" feels too destructive to the user's personal thoughts; "Delete Entry" separates the data from the emotion).
- **Examples**:
  - ✅ "Past Reflections" (Section Header)
  - ✅ "Read full reflection" (Text link)
  - ✅ "Your reflections are securely stored."
  - ❌ "Save reflection" (Action—use "Save entry" instead)

---

## Secondary Terminology

### Habit vs. Completion

- **Habit**: The abstract goal or behavior the user wishes to track over time (e.g., "Drink Water", "Read").
- **Completion**: The specific historical log of a habit being completed on a given date.
  - ✅ "Habit marked as complete."
  - ❌ "Habit logged."

### Media / Attachments

- **Media**: The technical term used in code and APIs for any uploaded file (e.g., `EntryMedia`, `pendingMedia`).
- **Image**: The UI term used when interacting with the user, as the app currently only supports image formats.
  - ✅ "Attach image" (Tooltip)
  - ❌ "Upload media" (Too technical)

### Prompt vs. Intention

- **Prompt**: A question or topic designed to break writer's block (e.g., "What went well today?"). Used in the "Inspiration Widget".
- **Daily Intention**: A single, prominent guiding thought or quote for the day displayed at the very top of the Journal dashboard.
