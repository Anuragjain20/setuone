import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // booking_created | booking_confirmed | booking_completed | otp
  recipientPhone: text("recipient_phone").notNull(),
  recipientName: text("recipient_name"),
  message: text("message").notNull(),
  channel: text("channel").notNull().default("sms"), // sms | whatsapp
  status: text("status").notNull().default("queued"), // queued | sent | failed
  bookingId: integer("booking_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Notification = typeof notificationsTable.$inferSelect;
