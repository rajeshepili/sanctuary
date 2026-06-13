CREATE TABLE `custom_prompts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `entry_media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entry_id` integer NOT NULL,
	`file_path` text NOT NULL,
	`thumbnail_path` text NOT NULL,
	`mime_type` text NOT NULL,
	`file_size` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `journal_entries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `habit_completions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`habit_id` integer NOT NULL,
	`completed_at` text NOT NULL,
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `habits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`frequency` text DEFAULT 'every_day' NOT NULL,
	`days_of_week` text,
	`priority` text DEFAULT 'medium' NOT NULL,
	`category` text DEFAULT 'growth' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`intention` text,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`mood` text NOT NULL,
	`tags` text,
	`isPinned` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`disclaimerAgreed` integer DEFAULT false NOT NULL,
	`showPromptInspire` integer DEFAULT true NOT NULL,
	`showBreathingSpace` integer DEFAULT true NOT NULL,
	`showHabits` integer DEFAULT true NOT NULL,
	`showDailyIntention` integer DEFAULT true NOT NULL
);
