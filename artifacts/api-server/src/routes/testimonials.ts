import { Router } from "express";
import { eq, asc } from "drizzle-orm";
import { db, testimonialsTable } from "@workspace/db";

const router = Router();

router.get("/testimonials", async (req, res) => {
  try {
    const rows = await db.select().from(testimonialsTable).orderBy(asc(testimonialsTable.sortOrder), asc(testimonialsTable.id));
    res.json(rows.map(fmt));
  } catch (err) {
    req.log.error({ err }, "Failed to list testimonials");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/testimonials", async (req, res) => {
  try {
    const { name, location, text, rating, avatarUrl, isActive, sortOrder } = req.body;
    if (!name || !location || !text) return res.status(400).json({ error: "name, location, text required" });
    const [row] = await db.insert(testimonialsTable).values({
      name, location, text,
      rating: rating ?? 5,
      avatarUrl: avatarUrl ?? null,
      isActive: isActive ?? true,
      sortOrder: sortOrder ?? 0,
    }).returning();
    res.status(201).json(fmt(row));
  } catch (err) {
    req.log.error({ err }, "Failed to create testimonial");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/testimonials/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const { name, location, text, rating, avatarUrl, isActive, sortOrder } = req.body;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (location !== undefined) updates.location = location;
    if (text !== undefined) updates.text = text;
    if (rating !== undefined) updates.rating = rating;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    if (isActive !== undefined) updates.isActive = isActive;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;
    const [updated] = await db.update(testimonialsTable).set(updates as any).where(eq(testimonialsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(fmt(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update testimonial");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/testimonials/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    await db.delete(testimonialsTable).where(eq(testimonialsTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete testimonial");
    res.status(500).json({ error: "Internal server error" });
  }
});

function fmt(t: typeof testimonialsTable.$inferSelect) {
  return { ...t, avatarUrl: t.avatarUrl ?? null, createdAt: t.createdAt.toISOString() };
}

export default router;
