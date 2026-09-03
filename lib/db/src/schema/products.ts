import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const productsTable = pgTable("product_items", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  shortDesc: text("short_desc").notNull().default(""),
  description: text("description"),
  imageUrl: text("image_url"),
  categories: jsonb("categories").$type<string[]>().notNull().default([]),
  specs: jsonb("specs").$type<Record<string, string>>().notNull().default({}),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  iconName: text("icon_name").notNull().default("Package"),
  accentColor: text("accent_color").notNull().default("#D4920C"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Product = typeof productsTable.$inferSelect;