import { Router } from "express";
import { desc } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";

const router = Router();

router.get("/notifications", async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 100);
    const rows = await db.select().from(notificationsTable)
      .orderBy(desc(notificationsTable.createdAt))
      .limit(limit);
    res.json(rows.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list notifications");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
