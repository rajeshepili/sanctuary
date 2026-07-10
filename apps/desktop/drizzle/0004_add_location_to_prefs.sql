ALTER TABLE `user_preferences` ADD `latitude` real;--> statement-breakpoint
ALTER TABLE `user_preferences` ADD `longitude` real;--> statement-breakpoint
ALTER TABLE `user_preferences` ADD `location_label` text;--> statement-breakpoint
CREATE UNIQUE INDEX `habit_completions_habit_id_completed_at_unique` ON `habit_completions` (`habit_id`,`completed_at`);