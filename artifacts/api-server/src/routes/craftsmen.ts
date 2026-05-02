import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, craftsmenTable, bookingsTable } from "@workspace/db";
import { CreateCraftsmanBody, UpdateCraftsmanBody, ListCraftsmenQueryParams, GetCraftsmanParams, UpdateCraftsmanParams } from "@workspace/api-zod";

const router = Router();

router.get("/craftsmen", async (req, res) => {
  try {
    const parsed = ListCraftsmenQueryParams.safeParse(req.query);
    const { skill, available } = parsed.success ? parsed.data : { skill: undefined, available: undefined };
    const applicationStatus = req.query.applicationStatus as string | undefined;

    let rows = await db.select().from(craftsmenTable);
    if (typeof available === "boolean") rows = rows.filter((c) => c.isAvailable === available);
    if (skill) {
      const lc = skill.toLowerCase();
      rows = rows.filter((c) => c.skills.some((s) => s.toLowerCase().includes(lc)));
    }
    if (applicationStatus) rows = rows.filter((c) => c.applicationStatus === applicationStatus);

    res.json(rows.map(formatCraftsman));
  } catch (err) {
    req.log.error({ err }, "Failed to list craftsmen");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/craftsmen", async (req, res) => {
  try {
    const parsed = CreateCraftsmanBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
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

// Public self-registration (application)
router.post("/craftsmen/apply", async (req, res) => {
  try {
    const { name, phone, skills, serviceAreas, experience, bio, photoUrl } = req.body;
    if (!name || !phone || !skills || !serviceAreas) {
      return res.status(400).json({ error: "name, phone, skills, serviceAreas required" });
    }
    // Check duplicate phone
    const existing = await db.select().from(craftsmenTable).where(eq(craftsmenTable.phone, phone));
    if (existing.length > 0) return res.status(409).json({ error: "A craftsman with this phone already exists" });

    const [craftsman] = await db.insert(craftsmenTable).values({
      name, phone,
      skills: Array.isArray(skills) ? skills : [skills],
      serviceAreas: Array.isArray(serviceAreas) ? serviceAreas : [serviceAreas],
      experience: Number(experience) || 0,
      bio: bio ?? null,
      photoUrl: photoUrl ?? null,
      isVerified: false,
      isAvailable: false,
      applicationStatus: "pending",
    }).returning();
    res.status(201).json(formatCraftsman(craftsman));
  } catch (err) {
    req.log.error({ err }, "Failed to submit application");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Craftsman portal: get jobs by phone
router.get("/craftsmen/my-jobs", async (req, res) => {
  try {
    const phone = req.query.phone as string;
    if (!phone) return res.status(400).json({ error: "phone required" });
    const [craftsman] = await db.select().from(craftsmenTable).where(eq(craftsmenTable.phone, phone));
    if (!craftsman) return res.status(404).json({ error: "Craftsman not found" });
    const jobs = await db.select().from(bookingsTable).where(eq(bookingsTable.craftsmanId, craftsman.id));
    const sorted = jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ craftsman: formatCraftsman(craftsman), jobs: sorted.map(fmtJob) });
  } catch (err) {
    req.log.error({ err }, "Failed to get craftsman jobs");
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
    if (!bodyParsed.success) return res.status(400).json({ error: "Invalid request", details: bodyParsed.error.issues });

    // Allow applicationStatus patch without going through zod schema
    const extra: Record<string, unknown> = {};
    if (req.body.applicationStatus !== undefined) extra.applicationStatus = req.body.applicationStatus;

    const [updated] = await db.update(craftsmenTable)
      .set({ ...(bodyParsed.data as any), ...extra })
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
  return { ...c, photoUrl: c.photoUrl ?? null, bio: c.bio ?? null, joinedAt: c.joinedAt.toISOString() };
}

function fmtJob(b: typeof bookingsTable.$inferSelect) {
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
