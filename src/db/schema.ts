import { sql } from 'drizzle-orm';
import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

// 1. Tabulka pro mapy
export const maps = sqliteTable('maps', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  gravity_strength: real('gravity_strength').default(0.05),
  repulsion_force: real('repulsion_force').default(100.0),
  friction: real('friction').default(0.9),
  theme_json: text('theme_json'),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// 2. Tabulka pro uzly
export const nodes = sqliteTable('nodes', {
  id: text('id').primaryKey(),
  map_id: text('map_id').notNull().references(() => maps.id, { onDelete: 'cascade' }),
  parent_id: text('parent_id').references((): any => nodes.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content'),
  display_type: text('display_type').notNull().default('button'), // 'button', 'collapsible', 'image'
  image_url: text('image_url'),
  force_distance: real('force_distance').default(150.0),
  force_angle: real('force_angle').default(0.0),
  force_mass: real('force_mass').default(1.0),
  flow_x: real('flow_x'),
  flow_y: real('flow_y'),
  is_collapsed: integer('is_collapsed', { mode: 'boolean' }).default(false),
  style_json: text('style_json'),
  sort_order: integer('sort_order').default(0),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// 3. Tabulka pro křížové vazby
export const cross_links = sqliteTable('cross_links', {
    id: text('id').primaryKey(),
    map_id: text('map_id').notNull().references(() => maps.id, { onDelete: 'cascade' }),
    source_node_id: text('source_node_id').notNull().references(() => nodes.id, { onDelete: 'cascade' }),
    target_node_id: text('target_node_id').notNull().references(() => nodes.id, { onDelete: 'cascade' }),
    label: text('label'),
    created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export type Map = typeof maps.$inferSelect;
export type Node = typeof nodes.$inferSelect;
export type CrossLink = typeof cross_links.$inferSelect;
