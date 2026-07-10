PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_habits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`identity_label` text,
	`mini_desc` text,
	`plus_desc` text,
	`elite_desc` text,
	`frequency` text DEFAULT 'daily' NOT NULL,
	`days_of_week` text,
	`difficulty` text DEFAULT 'medium' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`category` text DEFAULT 'growth' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`rest_until` integer,
	`intention` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_habits`("id", "name", "identity_label", "mini_desc", "plus_desc", "elite_desc", "frequency", "days_of_week", "difficulty", "priority", "category", "status", "rest_until", "intention", "created_at") SELECT "id", "name", "identity_label", "mini_desc", "plus_desc", "elite_desc", "frequency", "days_of_week", "priority", 'medium', "category", "status", "rest_until", "intention", "created_at" FROM `habits`;--> statement-breakpoint
DROP TABLE `habits`;--> statement-breakpoint
ALTER TABLE `__new_habits` RENAME TO `habits`;--> statement-breakpoint
PRAGMA foreign_keys=ON;