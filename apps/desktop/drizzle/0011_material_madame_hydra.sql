ALTER TABLE `user_preferences` RENAME COLUMN "first_name" TO "name";--> statement-breakpoint
CREATE TABLE `habit_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
DROP TABLE `custom_prompts`;--> statement-breakpoint
ALTER TABLE `user_preferences` DROP COLUMN `showPromptInspire`;--> statement-breakpoint
ALTER TABLE `user_preferences` DROP COLUMN `showBreathingSpace`;--> statement-breakpoint
ALTER TABLE `user_preferences` DROP COLUMN `showHabits`;--> statement-breakpoint
ALTER TABLE `user_preferences` DROP COLUMN `showDailyIntention`;--> statement-breakpoint
ALTER TABLE `habits` ADD `interval` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `habits` ADD `category_id` integer REFERENCES habit_categories(id);--> statement-breakpoint
ALTER TABLE `habits` DROP COLUMN `difficulty`;--> statement-breakpoint
ALTER TABLE `habits` DROP COLUMN `category`;