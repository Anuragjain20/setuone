import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, siteConfigTable } from "@workspace/db";

const router = Router();

router.get("/site-config", async (req, res) => {
  try {
    const rows = await db.select().from(siteConfigTable);
    const map: Record<string, string> = {};
    for (const row of rows) map[row.key] = row.value;
    res.json(map);
  } catch (err) {
    req.log.error({ err }, "Failed to get site config");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/site-config", async (req, res) => {
  try {
    const updates = req.body as Record<string, string>;
    for (const [key, value] of Object.entries(updates)) {
      const existing = await db.select().from(siteConfigTable).where(eq(siteConfigTable.key, key));
      if (existing.length > 0) {
        await db.update(siteConfigTable).set({ value, updatedAt: new Date() }).where(eq(siteConfigTable.key, key));
      } else {
        await db.insert(siteConfigTable).values({ key, value });
      }
    }
    const rows = await db.select().from(siteConfigTable);
    const map: Record<string, string> = {};
    for (const row of rows) map[row.key] = row.value;
    res.json(map);
  } catch (err) {
    req.log.error({ err }, "Failed to update site config");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
