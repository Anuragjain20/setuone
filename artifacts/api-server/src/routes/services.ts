import { Router } from "express";
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

export default router;
