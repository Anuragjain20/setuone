import { pgTable, serial, text, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  serviceCategory: text("service_category").notNull(),
  serviceName: text("service_name").notNull(),
  address: text("address").notNull(),
  scheduledDate: text("scheduled_date").notNull(),
  timeSlot: text("time_slot").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  craftsmanId: integer("craftsman_id"),
  craftsmanName: text("craftsman_name"),
  totalAmount: integer("total_amount"),
  platformFee: integer("platform_fee"),
  convenienceFee: integer("convenience_fee"),
  rating: real("rating"),
  review: text("review"),
  isFlagged: boolean("is_flagged").notNull().default(false),
  flagReason: text("flag_reason"),
  completionNotes: text("completion_notes"),
  completionPhotoUrl: text("completion_photo_url"),
  paymentStatus: text("payment_status").default("unpaid"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
