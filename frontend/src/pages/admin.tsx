import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Briefcase, CheckCircle, Clock, AlertCircle, Star, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Nav from "@/components/nav";
import { StatusBadge } from "@/components/status-badge";
import { useGetAdminDashboard, useListBookings, useListCraftsmen, useUpdateBooking, getListBookingsQueryKey, getGetAdminDashboardQueryKey } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useGetRevenueReport } from "@/api";

const STATUSES = ["pending", "confirmed", "in_progress", "completed", "cancelled"] as const;

export default function Admin() {
  const { data: dashboard } = useGetAdminDashboard();
  const { data: bookings } = useListBookings();
  const { data: craftsmen } = useListCraftsmen();
  const { data: revenue } = useGetRevenueReport({ days: 14 });
  const updateBooking = useUpdateBooking();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
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

  const handleStatusChange = async (bookingId: number, status: string) => {
    try {
      await updateBooking.mutateAsync({ id: bookingId, data: { status: status as "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" } });
      queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
      toast({ title: "Status updated" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const metricCards = [
    { label: "Total Bookings", value: dashboard?.totalBookings ?? 0, icon: Briefcase, color: "text-primary", bg: "bg-primary/10" },
    { label: "Pending", value: dashboard?.pendingBookings ?? 0, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Completed", value: dashboard?.completedBookings ?? 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Active", value: dashboard?.activeBookings ?? 0, icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "GMV This Month", value: `₹${((dashboard?.gmvThisMonth ?? 0) / 100000).toFixed(1)}L`, icon: IndianRupee, color: "text-primary", bg: "bg-primary/10" },
    { label: "Revenue This Month", value: `₹${((dashboard?.revenueThisMonth ?? 0)).toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Craftsmen", value: `${dashboard?.availableCraftsmen ?? 0} / ${dashboard?.totalCraftsmen ?? 0}`, icon: Users, color: "text-purple-600", bg: "bg-purple-50", sub: "available" },
    { label: "Avg Rating", value: `${(dashboard?.avgRating ?? 0).toFixed(1)} / 5`, icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  const pendingBookings = bookings?.filter((b) => b.status === "pending") ?? [];
  const recentBookings = [...(bookings ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20);
  const availableCraftsmen = craftsmen?.filter((c) => c.isAvailable) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage bookings, dispatch craftsmen, and monitor platform health.</p>
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
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setSelectedBooking(b as any)}>View</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* All Bookings */}
        <Card className="p-5">
          <h2 className="font-semibold text-foreground mb-4">All Bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">#</th>
                  <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Customer</th>
                  <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Service</th>
                  <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Craftsman</th>
                  <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 text-muted-foreground">{b.id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-foreground">{b.customerName}</div>
                      <div className="text-xs text-muted-foreground">{b.customerPhone}</div>
                    </td>
                    <td className="py-2.5 px-3 text-foreground">{b.serviceCategory}</td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{b.scheduledDate}</td>
                    <td className="py-2.5 px-3">
                      <Select value={b.craftsmanId ? String(b.craftsmanId) : "unassigned"} onValueChange={(val) => val !== "unassigned" && handleAssign(b.id, Number(val))}>
                        <SelectTrigger className="w-32 h-7 text-xs border-dashed">
                          <SelectValue placeholder="Assign" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned" className="text-xs italic text-muted-foreground">Unassigned</SelectItem>
                          {(craftsmen ?? []).map((c) => (
                            <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2.5 px-3"><StatusBadge status={b.status} /></td>
                    <td className="py-2.5 px-3">
                      <div className="flex gap-2">
                        <Select value={b.status} onValueChange={(val) => handleStatusChange(b.id, val)}>
                          <SelectTrigger className="w-28 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">{s.replace("_", " ")}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {b.status === "completed" && !b.rating && (
                          <Button size="sm" variant="outline" className="h-7 text-xs px-2 border-[#D4C5B0]" onClick={() => { setRatingBookingId(b.id); setRating(0); setReview(""); }}>
                            <Star className="w-3 h-3 mr-1" /> Rate
                          </Button>
                        )}
                        {b.rating ? (
                          <div className="flex items-center text-xs text-amber-500 font-medium border px-1.5 rounded bg-amber-50 h-7 shrink-0"><Star className="w-3 h-3 fill-current mr-0.5" />{b.rating}</div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
                {recentBookings.length === 0 && (
                  <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">No bookings yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
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
    </div>
  );
}

