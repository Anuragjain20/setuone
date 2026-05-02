import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const siteConfigTable = pgTable("site_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type SiteConfig = typeof siteConfigTable.$inferSelect;
