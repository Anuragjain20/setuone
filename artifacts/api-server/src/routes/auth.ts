import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, notificationsTable } from "@workspace/db";

declare module "express-session" {
  interface SessionData {
    userId: number;
    userPhone: string;
    userName: string | null;
  }
}

const router = Router();

function generateOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

router.post("/auth/request-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10}$/.test(phone.replace(/\s/g, ""))) {
      return res.status(400).json({ error: "Valid 10-digit phone number required" });
    }
    const cleanPhone = phone.replace(/\s/g, "");
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const existing = await db.select().from(usersTable).where(eq(usersTable.phone, cleanPhone));
    if (existing.length > 0) {
      await db.update(usersTable).set({ lastOtp: otp, otpExpiresAt: expiresAt }).where(eq(usersTable.phone, cleanPhone));
    } else {
      await db.insert(usersTable).values({ phone: cleanPhone, lastOtp: otp, otpExpiresAt: expiresAt });
    }

    // Log notification (in production, send SMS via MSG91/Twilio)
    await db.insert(notificationsTable).values({
      type: "otp",
      recipientPhone: cleanPhone,
      message: `Your SevaSetu OTP is ${otp}. Valid for 10 minutes. Do not share this with anyone.`,
      channel: "sms",
      status: "sent", // simulated
    });

    req.log.info({ phone: cleanPhone }, "OTP generated");

    // In dev, return OTP so it can be used without SMS
    res.json({
      ok: true,
      message: "OTP sent",
      ...(process.env.NODE_ENV !== "production" ? { devOtp: otp } : {}),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to send OTP");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/verify-otp", async (req, res) => {
  try {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: "Phone and OTP required" });
    const cleanPhone = phone.replace(/\s/g, "");

    const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, cleanPhone));
    if (!user) return res.status(401).json({ error: "Phone not registered. Request OTP first." });
    if (user.lastOtp !== otp) return res.status(401).json({ error: "Invalid OTP" });
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(401).json({ error: "OTP expired. Request a new one." });
    }

    const [updated] = await db.update(usersTable)
      .set({ isVerified: true, name: name ?? user.name, lastOtp: null, otpExpiresAt: null })
      .where(eq(usersTable.phone, cleanPhone))
      .returning();

    req.session.userId = updated.id;
    req.session.userPhone = updated.phone;
    req.session.userName = updated.name ?? null;

    res.json({ ok: true, user: { id: updated.id, phone: updated.phone, name: updated.name } });
  } catch (err) {
    req.log.error({ err }, "Failed to verify OTP");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", async (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  res.json({
    user: {
      id: req.session.userId,
      phone: req.session.userPhone,
      name: req.session.userName,
    },
  });
});

router.patch("/auth/me", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });
  await db.update(usersTable).set({ name }).where(eq(usersTable.id, req.session.userId));
  req.session.userName = name;
  res.json({ ok: true });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

export default router;
