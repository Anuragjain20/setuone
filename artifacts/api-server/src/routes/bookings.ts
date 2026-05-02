import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, bookingsTable, craftsmenTable, notificationsTable } from "@workspace/db";
import { CreateBookingBody, UpdateBookingBody, ListBookingsQueryParams, GetBookingParams, UpdateBookingParams } from "@workspace/api-zod";

const router = Router();

// Notify helper — queues notification (simulated; hook up SMS/WA in prod)
async function notify(opts: {
  type: string;
  phone: string;
  name: string | null;
  message: string;
  bookingId?: number;
  channel?: "sms" | "whatsapp";
}) {
  await db.insert(notificationsTable).values({
    type: opts.type,
    recipientPhone: opts.phone,
    recipientName: opts.name ?? null,
    message: opts.message,
    channel: opts.channel ?? "sms",
    status: "sent", // simulated
    bookingId: opts.bookingId ?? null,
  });
}

router.get("/bookings", async (req, res) => {
  try {
    const parsed = ListBookingsQueryParams.safeParse(req.query);
    const status = parsed.success ? parsed.data.status : undefined;
    const limit = parsed.success ? (parsed.data.limit ?? 50) : 50;
    const phone = req.query.phone as string | undefined;

    let rows = await db.select().from(bookingsTable).limit(limit);
    if (status) rows = rows.filter((b) => b.status === status);
    if (phone) rows = rows.filter((b) => b.customerPhone === phone);
    res.json(rows.map(formatBooking));
  } catch (err) {
    req.log.error({ err }, "Failed to list bookings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bookings", async (req, res) => {
  try {
    const parsed = CreateBookingBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request", details: parsed.error.issues });

    const [booking] = await db.insert(bookingsTable).values({ ...parsed.data, status: "pending" }).returning();

    // Notify customer
    await notify({
      type: "booking_created",
      phone: booking.customerPhone,
      name: booking.customerName,
      message: `Hi ${booking.customerName}, your SevaSetu booking #${booking.id} for ${booking.serviceCategory} on ${booking.scheduledDate} (${booking.timeSlot}) has been received. We'll confirm your pro within 30 minutes.`,
      bookingId: booking.id,
      channel: "whatsapp",
    });

    res.status(201).json(formatBooking(booking));
  } catch (err) {
    req.log.error({ err }, "Failed to create booking");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bookings/:id", async (req, res) => {
  try {
    const parsed = GetBookingParams.safeParse(req.params);
    if (!parsed.success) return res.status(400).json({ error: "Invalid id" });
    const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, parsed.data.id));
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(formatBooking(booking));
  } catch (err) {
    req.log.error({ err }, "Failed to get booking");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/bookings/:id", async (req, res) => {
  try {
    const paramsParsed = UpdateBookingParams.safeParse(req.params);
    if (!paramsParsed.success) return res.status(400).json({ error: "Invalid id" });

    const bodyParsed = UpdateBookingBody.safeParse(req.body);
    if (!bodyParsed.success) return res.status(400).json({ error: "Invalid request", details: bodyParsed.error.issues });

    const updates: Record<string, unknown> = { ...bodyParsed.data };

    // Look up craftsman name if assigning
    if (updates.craftsmanId) {
      const [craftsman] = await db.select().from(craftsmenTable).where(eq(craftsmenTable.id, Number(updates.craftsmanId)));
      if (craftsman) updates.craftsmanName = craftsman.name;
    }

    const [old] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, paramsParsed.data.id));
    const [updated] = await db.update(bookingsTable).set(updates as any).where(eq(bookingsTable.id, paramsParsed.data.id)).returning();
    if (!updated) return res.status(404).json({ error: "Booking not found" });

    // Notifications on status changes
    if (updates.status && updates.status !== old?.status) {
      if (updates.status === "confirmed") {
        await notify({
          type: "booking_confirmed",
          phone: updated.customerPhone,
          name: updated.customerName,
          message: `Hi ${updated.customerName}, booking #${updated.id} confirmed! ${updated.craftsmanName ?? "A craftsman"} will arrive on ${updated.scheduledDate} (${updated.timeSlot}). Call us if you need anything.`,
          bookingId: updated.id,
          channel: "whatsapp",
        });
      } else if (updates.status === "completed") {
        await notify({
          type: "booking_completed",
          phone: updated.customerPhone,
          name: updated.customerName,
          message: `Hi ${updated.customerName}, booking #${updated.id} for ${updated.serviceCategory} is marked complete. Please rate your experience in the SevaSetu app. Thank you!`,
          bookingId: updated.id,
          channel: "whatsapp",
        });
      } else if (updates.status === "cancelled") {
        await notify({
          type: "booking_cancelled",
          phone: updated.customerPhone,
          name: updated.customerName,
          message: `Hi ${updated.customerName}, your booking #${updated.id} for ${updated.serviceCategory} has been cancelled. Book again anytime at SevaSetu.`,
          bookingId: updated.id,
          channel: "sms",
        });
      }
    }

    res.json(formatBooking(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update booking");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Cancel booking
router.post("/bookings/:id/cancel", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
    if (!booking) return res.status(404).json({ error: "Not found" });
    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({ error: "Only pending or confirmed bookings can be cancelled" });
    }
    const [updated] = await db.update(bookingsTable).set({ status: "cancelled" }).where(eq(bookingsTable.id, id)).returning();
    await notify({
      type: "booking_cancelled",
      phone: updated.customerPhone,
      name: updated.customerName,
      message: `Hi ${updated.customerName}, your booking #${updated.id} for ${updated.serviceCategory} has been cancelled. We hope to serve you again soon.`,
      bookingId: updated.id,
      channel: "sms",
    });
    res.json(formatBooking(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to cancel booking");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Flag/dispute booking
router.post("/bookings/:id/flag", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: "Reason required" });
    const [updated] = await db.update(bookingsTable)
      .set({ isFlagged: true, flagReason: reason })
      .where(eq(bookingsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(formatBooking(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to flag booking");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Complete booking with notes + photo
router.post("/bookings/:id/complete", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { completionNotes, completionPhotoUrl, totalAmount } = req.body;
    const updates: Record<string, unknown> = {
      status: "completed",
      completionNotes: completionNotes ?? null,
      completionPhotoUrl: completionPhotoUrl ?? null,
    };
    if (totalAmount) {
      updates.totalAmount = totalAmount;
      updates.platformFee = Math.round(totalAmount * 0.15);
      updates.convenienceFee = 75;
    }
    const [updated] = await db.update(bookingsTable).set(updates as any).where(eq(bookingsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    await notify({
      type: "booking_completed",
      phone: updated.customerPhone,
      name: updated.customerName,
      message: `Hi ${updated.customerName}, your ${updated.serviceCategory} job #${updated.id} is done! Please rate your experience. Thank you for choosing SevaSetu.`,
      bookingId: updated.id,
      channel: "whatsapp",
    });
    res.json(formatBooking(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to complete booking");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Payment
router.post("/bookings/:id/pay", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { method } = req.body; // upi | card | cash
    const [updated] = await db.update(bookingsTable)
      .set({ paymentStatus: "paid" })
      .where(eq(bookingsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true, booking: formatBooking(updated), paymentMethod: method });
  } catch (err) {
    req.log.error({ err }, "Failed to process payment");
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatBooking(b: typeof bookingsTable.$inferSelect) {
  return {
    ...b,
    craftsmanId: b.craftsmanId ?? null,
    craftsmanName: b.craftsmanName ?? null,
    totalAmount: b.totalAmount ?? null,
    platformFee: b.platformFee ?? null,
    convenienceFee: b.convenienceFee ?? null,
    rating: b.rating ?? null,
    review: b.review ?? null,
    isFlagged: b.isFlagged,
    flagReason: b.flagReason ?? null,
    completionNotes: b.completionNotes ?? null,
    completionPhotoUrl: b.completionPhotoUrl ?? null,
    paymentStatus: b.paymentStatus ?? "unpaid",
    createdAt: b.createdAt.toISOString(),
  };
}

export default router;
