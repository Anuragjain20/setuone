import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { TrendingUp, Users, Briefcase, CheckCircle, Clock, AlertCircle, Star, IndianRupee, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/admin-layout";
import { useGetAdminDashboard, useListBookings, useListCraftsmen, useUpdateBooking, getListBookingsQueryKey, getGetAdminDashboardQueryKey } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useGetRevenueReport } from "@/api";

export default function Admin() {
  const { data: dashboard } = useGetAdminDashboard();
  const { data: bookings } = useListBookings();
  const { data: craftsmen } = useListCraftsmen();
  const { data: revenue } = useGetRevenueReport({ days: 14 });
  const updateBooking = useUpdateBooking();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [ratingBookingId, setRatingBookingId] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");

  const handleRate = async () => {
    if (!ratingBookingId || !rating) return;
    try {
      await updateBooking.mutateAsync({ id: ratingBookingId, data: { rating, review } });
      queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
      toast({ title: "Rating submitted" });
      setRatingBookingId(null); setRating(0); setReview("");
    } catch { toast({ title: "Failed to submit rating", variant: "destructive" }); }
  };

  const handleAssign = async (bookingId: number, craftsmanId: number) => {
    const craftsman = craftsmen?.find((c) => c.id === craftsmanId);
    try {
      await updateBooking.mutateAsync({ id: bookingId, data: { craftsmanId, status: "confirmed" } });
      queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
      toast({ title: "Craftsman Assigned", description: `${craftsman?.name} assigned and booking confirmed.` });
    } catch {
      toast({ title: "Failed to assign", variant: "destructive" });
    }
  };

  const metricCards = [
    { label: "Total Bookings", value: dashboard?.totalBookings ?? 0, icon: Briefcase, color: "text-primary", bg: "bg-primary/10" },
    { label: "Pending Dispatch", value: dashboard?.pendingBookings ?? 0, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Completed", value: dashboard?.completedBookings ?? 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Active", value: dashboard?.activeBookings ?? 0, icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "GMV", value: `₹${((dashboard?.gmvThisMonth ?? 0) / 1000).toFixed(1)}k`, icon: IndianRupee, color: "text-primary", bg: "bg-primary/10" },
    { label: "Revenue", value: `₹${((dashboard?.revenueThisMonth ?? 0)).toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Craftsmen", value: `${dashboard?.availableCraftsmen ?? 0} / ${dashboard?.totalCraftsmen ?? 0}`, icon: Users, color: "text-purple-600", bg: "bg-purple-50", sub: "available" },
    { label: "Avg Rating", value: `${(dashboard?.avgRating ?? 0).toFixed(1)} / 5`, icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  const pendingBookings = bookings?.filter((b) => b.status === "pending") ?? [];
  const availableCraftsmen = craftsmen?.filter((c) => c.isAvailable) ?? [];

  return (
    <AdminLayout>
    <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-0.5">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Platform overview and pending dispatch.</p>
          </div>
          <Badge className="bg-green-100 text-green-700 border-green-200 font-medium">Live</Badge>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {metricCards.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 hover:shadow-md transition-all duration-200">
                <div className={`w-9 h-9 rounded-lg ${m.bg} flex items-center justify-center mb-3`}>
                  <m.icon className={`w-4.5 h-4.5 ${m.color}`} />
                </div>
                <p className="text-xs text-muted-foreground mb-0.5">{m.label}</p>
                <p className="text-xl font-bold text-foreground">{m.value}</p>
                {m.sub && <p className="text-xs text-muted-foreground">{m.sub}</p>}
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <Card className="p-5 md:col-span-2">
            <h2 className="font-semibold text-foreground mb-4">Revenue (Last 14 Days)</h2>
            {revenue && revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenue} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} labelFormatter={(l) => `Date: ${l}`} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No revenue data yet</div>
            )}
          </Card>

          {/* Bookings by Category */}
          <Card className="p-5">
            <h2 className="font-semibold text-foreground mb-4">Bookings by Category</h2>
            <div className="space-y-3">
              {(dashboard?.bookingsByCategory ?? []).map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{cat.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(100, (cat.count / (dashboard?.totalBookings || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-5 text-right">{cat.count}</span>
                  </div>
                </div>
              ))}
              {(dashboard?.bookingsByCategory ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No data yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Pending Dispatch */}
        {pendingBookings.length > 0 && (
          <Card className="p-5 mb-6 border-yellow-200 bg-yellow-50/30">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              Pending Dispatch ({pendingBookings.length})
            </h2>
            <div className="space-y-3">
              {pendingBookings.map((b) => (
                <div key={b.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-card rounded-lg border border-border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground">{b.customerName}</span>
                      <Badge variant="outline" className="text-xs">{b.serviceCategory}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{b.scheduledDate} · {b.timeSlot} · {b.address.slice(0, 50)}...</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select onValueChange={(val) => handleAssign(b.id, Number(val))}>
                      <SelectTrigger className="w-44 h-8 text-xs">
                        <SelectValue placeholder="Assign craftsman" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCraftsmen.filter((c) => c.skills.some((s) => s.toLowerCase().includes(b.serviceCategory.toLowerCase()) || b.serviceCategory.toLowerCase().includes(s.toLowerCase()))).concat(availableCraftsmen.filter((c) => !c.skills.some((s) => s.toLowerCase().includes(b.serviceCategory.toLowerCase())))).map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name} ({c.rating.toFixed(1)}★)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Link href="/admin/bookings"><Button size="sm" variant="outline" className="h-8 text-xs">View All</Button></Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quick links */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { href: "/admin/bookings", label: "All Bookings", desc: `${(bookings ?? []).length} total bookings`, icon: "📋" },
            { href: "/admin/analytics", label: "Analytics", desc: "City & service breakdown", icon: "📊" },
            { href: "/admin/customers", label: "Customers", desc: "View customer database", icon: "👥" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="p-4 hover:shadow-md transition-all cursor-pointer group hover:border-primary/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl mb-1">{item.icon}</div>
                    <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Rating Dialog */}
      <Dialog open={!!ratingBookingId} onOpenChange={(o) => !o && setRatingBookingId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rate Craftsman / Job</DialogTitle></DialogHeader>
          <div className="space-y-5 py-2">
            <div>
              <Label className="mb-3 block">Rating</Label>
              <div className="flex gap-2 justify-center">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(s)} className="transition-transform hover:scale-110">
                    <Star className={`w-8 h-8 ${s <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Review (optional)</Label>
              <Textarea placeholder="Share experience..." value={review} onChange={(e) => setReview(e.target.value)} className="min-h-24 resize-none" />
            </div>
            <Button className="w-full" onClick={handleRate} disabled={!rating || updateBooking.isPending}>
              {updateBooking.isPending ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

