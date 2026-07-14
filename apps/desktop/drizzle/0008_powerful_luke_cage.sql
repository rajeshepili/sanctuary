ALTER TABLE `user_preferences` ADD `sync_directory` text;--> statement-breakpoint
ALTER TABLE `user_preferences` ADD `sync_passphrase_hash` text;--> statement-breakpoint
ALTER TABLE `user_preferences` ADD `last_synced_at` integer;--> statement-breakpoint
CREATE INDEX `entry_id_idx` ON `entry_media` (`entry_id`);--> statement-breakpoint
CREATE INDEX `completed_at_idx` ON `habit_completions` (`completed_at`);