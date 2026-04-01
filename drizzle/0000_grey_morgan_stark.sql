CREATE TABLE `cross_links` (
	`id` text PRIMARY KEY NOT NULL,
	`map_id` text NOT NULL,
	`source_node_id` text NOT NULL,
	`target_node_id` text NOT NULL,
	`label` text,
	`created_at` integer DEFAULT '"2026-04-01T21:00:55.543Z"',
	`updated_at` integer DEFAULT '"2026-04-01T21:00:55.543Z"',
	FOREIGN KEY (`map_id`) REFERENCES `maps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_node_id`) REFERENCES `nodes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_node_id`) REFERENCES `nodes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `maps` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`gravity_strength` real DEFAULT 0.05,
	`repulsion_force` real DEFAULT 100,
	`friction` real DEFAULT 0.9,
	`theme_json` text,
	`created_at` integer DEFAULT '"2026-04-01T21:00:55.542Z"',
	`updated_at` integer DEFAULT '"2026-04-01T21:00:55.542Z"'
);
--> statement-breakpoint
CREATE TABLE `nodes` (
	`id` text PRIMARY KEY NOT NULL,
	`map_id` text NOT NULL,
	`parent_id` text,
	`title` text NOT NULL,
	`content` text,
	`display_type` text DEFAULT 'button' NOT NULL,
	`image_url` text,
	`force_distance` real DEFAULT 150,
	`force_angle` real DEFAULT 0,
	`force_mass` real DEFAULT 1,
	`flow_x` real,
	`flow_y` real,
	`is_collapsed` integer DEFAULT false,
	`style_json` text,
	`sort_order` integer DEFAULT 0,
	`created_at` integer DEFAULT '"2026-04-01T21:00:55.543Z"',
	`updated_at` integer DEFAULT '"2026-04-01T21:00:55.543Z"',
	FOREIGN KEY (`map_id`) REFERENCES `maps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_id`) REFERENCES `nodes`(`id`) ON UPDATE no action ON DELETE cascade
);
