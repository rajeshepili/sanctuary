ALTER TABLE `habit_completions` ADD `tier` text DEFAULT 'plus' NOT NULL;--> statement-breakpoint
ALTER TABLE `habits` ADD `identity_label` text;--> statement-breakpoint
ALTER TABLE `habits` ADD `mini_desc` text;--> statement-breakpoint
ALTER TABLE `habits` ADD `plus_desc` text;--> statement-breakpoint
ALTER TABLE `habits` ADD `elite_desc` text;--> statement-breakpoint
ALTER TABLE `habits` DROP COLUMN `current_streak`;--> statement-breakpoint
ALTER TABLE `habits` DROP COLUMN `longest_streak`;--> statement-breakpoint
CREATE INDEX `deleted_at_idx` ON `journal_entries` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `pinned_idx` ON `journal_entries` (`isPinned`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `journal_entries` (`created_at`);