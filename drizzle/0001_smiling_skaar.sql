PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_cross_links` (
	`id` text PRIMARY KEY NOT NULL,
	`map_id` text NOT NULL,
	`source_node_id` text NOT NULL,
	`target_node_id` text NOT NULL,
	`label` text,
	`created_at` integer DEFAULT '"2026-03-31T13:24:49.851Z"',
	`updated_at` integer DEFAULT '"2026-03-31T13:24:49.851Z"',
	FOREIGN KEY (`map_id`) REFERENCES `maps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_node_id`) REFERENCES `nodes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_node_id`) REFERENCES `nodes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_cross_links`("id", "map_id", "source_node_id", "target_node_id", "label", "created_at", "updated_at") SELECT "id", "map_id", "source_node_id", "target_node_id", "label", "created_at", "updated_at" FROM `cross_links`;--> statement-breakpoint
DROP TABLE `cross_links`;--> statement-breakpoint
ALTER TABLE `__new_cross_links` RENAME TO `cross_links`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_maps` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`gravity_strength` real DEFAULT 0.05,
	`repulsion_force` real DEFAULT 100,
	`friction` real DEFAULT 0.9,
	`theme_json` text,
	`created_at` integer DEFAULT '"2026-03-31T13:24:49.849Z"',
	`updated_at` integer DEFAULT '"2026-03-31T13:24:49.849Z"'
);
--> statement-breakpoint
INSERT INTO `__new_maps`("id", "title", "description", "gravity_strength", "repulsion_force", "friction", "theme_json", "created_at", "updated_at") SELECT "id", "title", "description", "gravity_strength", "repulsion_force", "friction", "theme_json", "created_at", "updated_at" FROM `maps`;--> statement-breakpoint
DROP TABLE `maps`;--> statement-breakpoint
ALTER TABLE `__new_maps` RENAME TO `maps`;--> statement-breakpoint
CREATE TABLE `__new_nodes` (
	`id` text PRIMARY KEY NOT NULL,
	`map_id` text NOT NULL,
	`parent_id` text,
	`title` text NOT NULL,
	`content` text,
	`image_url` text,
	`distance` real DEFAULT 150,
	`angle` real DEFAULT 0,
	`mass` real DEFAULT 1,
	`is_collapsed` integer DEFAULT false,
	`style_json` text,
	`sort_order` integer DEFAULT 0,
	`created_at` integer DEFAULT '"2026-03-31T13:24:49.850Z"',
	`updated_at` integer DEFAULT '"2026-03-31T13:24:49.850Z"',
	FOREIGN KEY (`map_id`) REFERENCES `maps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_id`) REFERENCES `nodes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_nodes`("id", "map_id", "parent_id", "title", "content", "image_url", "distance", "angle", "mass", "is_collapsed", "style_json", "sort_order", "created_at", "updated_at") SELECT "id", "map_id", "parent_id", "title", "content", "image_url", "distance", "angle", "mass", "is_collapsed", "style_json", "sort_order", "created_at", "updated_at" FROM `nodes`;--> statement-breakpoint
DROP TABLE `nodes`;--> statement-breakpoint
ALTER TABLE `__new_nodes` RENAME TO `nodes`;