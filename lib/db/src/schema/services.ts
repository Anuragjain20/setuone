import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const servicesTable = pgTable("services", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  avgMinPrice: integer("avg_min_price").notNull(),
  avgMaxPrice: integer("avg_max_price").notNull(),
  priority: text("priority").notNull().default("P0"),
  iconName: text("icon_name").notNull(),
});

export const insertServiceSchema = createInsertSchema(servicesTable).omit({ id: true });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof servicesTable.$inferSelect;
