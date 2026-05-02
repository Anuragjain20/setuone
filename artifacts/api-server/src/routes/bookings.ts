import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, bookingsTable, craftsmenTable } from "@workspace/db";
import { CreateBookingBody, UpdateBookingBody, ListBookingsQueryParams, GetBookingParams, UpdateBookingParams } from "@workspace/api-zod";

const router = Router();

router.get("/bookings", async (req, res) => {
  try {
    const parsed = ListBookingsQueryParams.safeParse(req.query);
    const status = parsed.success ? parsed.data.status : undefined;
    const limit = parsed.success ? (parsed.data.limit ?? 50) : 50;

    let query = db.select().from(bookingsTable);
    if (status) {
      const results = await db.select().from(bookingsTable).where(eq(bookingsTable.status, status)).limit(limit);
      return res.json(results.map(formatBooking));
    }
    const results = await (query as any).limit(limit);
    res.json(results.map(formatBooking));
  } catch (err) {
    req.log.error({ err }, "Failed to list bookings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bookings", async (req, res) => {
  try {
    const parsed = CreateBookingBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    }
    const [booking] = await db.insert(bookingsTable).values({
      ...parsed.data,
      status: "pending",
    }).returning();
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
    if (!bodyParsed.success) {
      return res.status(400).json({ error: "Invalid request", details: bodyParsed.error.issues });
    }

    const updates: Record<string, unknown> = { ...bodyParsed.data };

    // If assigning a craftsman, look up their name
    if (updates.craftsmanId) {
      const [craftsman] = await db.select().from(craftsmenTable).where(eq(craftsmenTable.id, Number(updates.craftsmanId)));
      if (craftsman) {
        updates.craftsmanName = craftsman.name;
      }
    }

    const [updated] = await db.update(bookingsTable)
      .set(updates as any)
      .where(eq(bookingsTable.id, paramsParsed.data.id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Booking not found" });
    res.json(formatBooking(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update booking");
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
    createdAt: b.createdAt.toISOString(),
  };
}

export default router;
