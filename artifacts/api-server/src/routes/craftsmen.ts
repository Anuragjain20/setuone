import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import { db, craftsmenTable } from "@workspace/db";
import { CreateCraftsmanBody, UpdateCraftsmanBody, ListCraftsmenQueryParams, GetCraftsmanParams, UpdateCraftsmanParams } from "@workspace/api-zod";

const router = Router();

router.get("/craftsmen", async (req, res) => {
  try {
    const parsed = ListCraftsmenQueryParams.safeParse(req.query);
    const { skill, available } = parsed.success ? parsed.data : { skill: undefined, available: undefined };

    let rows = await db.select().from(craftsmenTable);

    if (typeof available === "boolean") {
      rows = rows.filter((c) => c.isAvailable === available);
    }
    if (skill) {
      const lc = skill.toLowerCase();
      rows = rows.filter((c) => c.skills.some((s) => s.toLowerCase().includes(lc)));
    }

    res.json(rows.map(formatCraftsman));
  } catch (err) {
    req.log.error({ err }, "Failed to list craftsmen");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/craftsmen", async (req, res) => {
  try {
    const parsed = CreateCraftsmanBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    }
    const [craftsman] = await db.insert(craftsmenTable).values({
      ...parsed.data,
      photoUrl: parsed.data.photoUrl ?? null,
      bio: parsed.data.bio ?? null,
    }).returning();
    res.status(201).json(formatCraftsman(craftsman));
  } catch (err) {
    req.log.error({ err }, "Failed to create craftsman");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/craftsmen/:id", async (req, res) => {
  try {
    const parsed = GetCraftsmanParams.safeParse(req.params);
    if (!parsed.success) return res.status(400).json({ error: "Invalid id" });
    const [craftsman] = await db.select().from(craftsmenTable).where(eq(craftsmenTable.id, parsed.data.id));
    if (!craftsman) return res.status(404).json({ error: "Craftsman not found" });
    res.json(formatCraftsman(craftsman));
  } catch (err) {
    req.log.error({ err }, "Failed to get craftsman");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/craftsmen/:id", async (req, res) => {
  try {
    const paramsParsed = UpdateCraftsmanParams.safeParse(req.params);
    if (!paramsParsed.success) return res.status(400).json({ error: "Invalid id" });

    const bodyParsed = UpdateCraftsmanBody.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({ error: "Invalid request", details: bodyParsed.error.issues });
    }

    const [updated] = await db.update(craftsmenTable)
      .set(bodyParsed.data as any)
      .where(eq(craftsmenTable.id, paramsParsed.data.id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Craftsman not found" });
    res.json(formatCraftsman(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update craftsman");
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatCraftsman(c: typeof craftsmenTable.$inferSelect) {
  return {
    ...c,
    photoUrl: c.photoUrl ?? null,
    bio: c.bio ?? null,
    joinedAt: c.joinedAt.toISOString(),
  };
}

export default router;
