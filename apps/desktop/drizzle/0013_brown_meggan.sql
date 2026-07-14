ALTER TABLE `user_preferences` ADD `backup_enabled` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `user_preferences` ADD `backup_path` text;--> statement-breakpoint
ALTER TABLE `user_preferences` ADD `backup_frequency` text DEFAULT 'daily' NOT NULL;--> statement-breakpoint
ALTER TABLE `user_preferences` ADD `last_backup_at` integer;--> statement-breakpoint
ALTER TABLE `user_preferences` ADD `backup_keep_count` integer DEFAULT 30 NOT NULL;