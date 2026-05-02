import { pgTable, serial, text, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const craftsmenTable = pgTable("craftsmen", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  photoUrl: text("photo_url"),
  skills: text("skills").array().notNull().default([]),
  serviceAreas: text("service_areas").array().notNull().default([]),
  rating: real("rating").notNull().default(0),
  totalJobs: integer("total_jobs").notNull().default(0),
  isVerified: boolean("is_verified").notNull().default(false),
  isAvailable: boolean("is_available").notNull().default(true),
  experience: integer("experience").notNull().default(0),
  bio: text("bio"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const insertCraftsmanSchema = createInsertSchema(craftsmenTable).omit({ id: true, joinedAt: true });
export type InsertCraftsman = z.infer<typeof insertCraftsmanSchema>;
export type Craftsman = typeof craftsmenTable.$inferSelect;
