import { Router } from "express";
import { eq, sql, gte, and } from "drizzle-orm";
import { db, bookingsTable, craftsmenTable } from "@workspace/db";
import { GetRevenueReportQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/admin/dashboard", async (req, res) => {
  try {
    const allBookings = await db.select().from(bookingsTable);
    const allCraftsmen = await db.select().from(craftsmenTable);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const completedBookings = allBookings.filter((b) => b.status === "completed");
    const pendingBookings = allBookings.filter((b) => b.status === "pending");
    const activeBookings = allBookings.filter((b) => b.status === "in_progress" || b.status === "confirmed");
    const thisMonthCompleted = completedBookings.filter((b) => b.createdAt >= startOfMonth);
    const thisWeekBookings = allBookings.filter((b) => b.createdAt >= startOfWeek);

    const gmvThisMonth = thisMonthCompleted.reduce((sum, b) => sum + (b.totalAmount ?? 0), 0);
    const revenueThisMonth = thisMonthCompleted.reduce((sum, b) => sum + (b.platformFee ?? 0) + (b.convenienceFee ?? 0), 0);

    const avgRating = completedBookings.filter((b) => b.rating != null).length > 0
      ? completedBookings.filter((b) => b.rating != null).reduce((sum, b) => sum + (b.rating ?? 0), 0) / completedBookings.filter((b) => b.rating != null).length
      : 0;

    // Group by category
    const categoryCount: Record<string, number> = {};
    allBookings.forEach((b) => {
      categoryCount[b.serviceCategory] = (categoryCount[b.serviceCategory] ?? 0) + 1;
    });
    const bookingsByCategory = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      totalBookings: allBookings.length,
      pendingBookings: pendingBookings.length,
      completedBookings: completedBookings.length,
      activeBookings: activeBookings.length,
      totalCraftsmen: allCraftsmen.length,
      verifiedCraftsmen: allCraftsmen.filter((c) => c.isVerified).length,
      availableCraftsmen: allCraftsmen.filter((c) => c.isAvailable).length,
      gmvThisMonth,
      revenueThisMonth,
      avgRating: Math.round(avgRating * 10) / 10,
      bookingsThisWeek: thisWeekBookings.length,
      bookingsByCategory,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/revenue", async (req, res) => {
  try {
    const parsed = GetRevenueReportQueryParams.safeParse(req.query);
    const days = parsed.success ? (parsed.data.days ?? 30) : 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const bookings = await db.select().from(bookingsTable)
      .where(and(
        eq(bookingsTable.status, "completed"),
        gte(bookingsTable.createdAt, startDate),
      ));

    // Group by date
    const byDate: Record<string, { gmv: number; revenue: number; completedJobs: number }> = {};

    // Fill all days with zeros
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      byDate[key] = { gmv: 0, revenue: 0, completedJobs: 0 };
    }

    bookings.forEach((b) => {
      const key = b.createdAt.toISOString().split("T")[0];
      if (!byDate[key]) byDate[key] = { gmv: 0, revenue: 0, completedJobs: 0 };
      byDate[key].gmv += b.totalAmount ?? 0;
      byDate[key].revenue += (b.platformFee ?? 0) + (b.convenienceFee ?? 0);
      byDate[key].completedJobs += 1;
    });

    const result = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get revenue report");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
