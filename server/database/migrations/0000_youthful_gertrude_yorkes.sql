CREATE TABLE `ingredient` (
	`id` integer PRIMARY KEY NOT NULL,
	`recipe_id` integer NOT NULL,
	`name` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit` text NOT NULL,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `recipe` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`hours` integer NOT NULL,
	`minutes` integer NOT NULL,
	`servings` integer NOT NULL,
	`difficulty` text NOT NULL,
	`image_url` text,
	`stars` integer NOT NULL,
	`diet` text NOT NULL,
	`calories` integer NOT NULL,
	`fat` integer NOT NULL,
	`protein` integer NOT NULL,
	`carbs` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `step` (
	`id` integer PRIMARY KEY NOT NULL,
	`recipe_id` integer NOT NULL,
	`description` text NOT NULL,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE no action
);
