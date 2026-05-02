import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, servicesTable } from "@workspace/db";

const router = Router();

router.get("/services", async (req, res) => {
  try {
    const services = await db.select().from(servicesTable);
    res.json(services);
  } catch (err) {
    req.log.error({ err }, "Failed to list services");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/services/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const { imageUrl } = req.body;
    const updates: Record<string, unknown> = {};
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    const [updated] = await db.update(servicesTable).set(updates as any).where(eq(servicesTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Service not found" });
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update service" );
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
