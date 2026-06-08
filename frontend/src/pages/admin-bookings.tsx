import { useState, useMemo } from "react";
import { Search, Filter, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/admin-layout";
import { StatusBadge } from "@/components/status-badge";
import { useListBookings, useListCraftsmen, useUpdateBooking, getListBookingsQueryKey, getGetAdminDashboardQueryKey } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CITIES } from "@/context/CityContext";
import { Star } from "lucide-react";

const STATUSES = ["pending", "confirmed", "in_progress", "completed", "cancelled"] as const;

export default function AdminBookings() {
  const { data: bookings, isLoading } = useListBookings();
  const { data: craftsmen } = useListCraftsmen();
  const updateBooking = useUpdateBooking();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [ratingBookingId, setRatingBookingId] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");

  const filtered = useMemo(() => {
    let list = [...(bookings ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (statusFilter !== "all") list = list.filter((b) => b.status === statusFilter);
    if (cityFilter !== "all") list = list.filter((b) => b.city === cityFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.customerName.toLowerCase().includes(q) ||
          b.customerPhone.includes(q) ||
          b.serviceCategory.toLowerCase().includes(q) ||
          (b.address || "").toLowerCase().includes(q) ||
          (b.craftsmanName || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [bookings, statusFilter, cityFilter, search]);

  const availableCraftsmen = (craftsmen ?? []).filter((c) => c.isAvailable);

  const handleAssign = async (bookingId: number, craftsmanId: number) => {
    const craftsman = craftsmen?.find((c) => c.id === craftsmanId);
    try {
      await updateBooking.mutateAsync({ id: bookingId, data: { craftsmanId, status: "confirmed" } });
      queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
      toast({ title: "Assigned", description: `${craftsman?.name} assigned and booking confirmed.` });
    } catch {
      toast({ title: "Failed to assign", variant: "destructive" });
    }
  };

  const handleStatusChange = async (bookingId: number, status: string) => {
    try {
      await updateBooking.mutateAsync({
        id: bookingId,
        data: { status: status as "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" },
      });
      queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
      toast({ title: "Status updated" });
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const handleRate = async () => {
    if (!ratingBookingId || !rating) return;
    try {
      await updateBooking.mutateAsync({ id: ratingBookingId, data: { rating, review } });
      queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
      toast({ title: "Rating submitted" });
      setRatingBookingId(null); setRating(0); setReview("");
    } catch {
      toast({ title: "Failed to submit rating", variant: "destructive" });
    }
  };

  const pendingCount = (bookings ?? []).filter((b) => b.status === "pending").length;

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filtered.length} of {bookings?.length ?? 0} bookings
              {pendingCount > 0 && <span className="ml-2 text-yellow-600 font-medium">· {pendingCount} need dispatch</span>}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, service, address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-9">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-36 h-9">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {CITIES.map((c) => (
                  <SelectItem key={c.slug} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Pending dispatch callout */}
        {statusFilter === "all" && pendingCount > 0 && !search && cityFilter === "all" && (
          <Card className="p-4 mb-5 border-yellow-200 bg-yellow-50/40">
            <p className="text-sm font-medium text-yellow-700 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {pendingCount} booking{pendingCount > 1 ? "s" : ""} waiting for craftsman assignment
            </p>
          </Card>
        )}

        {/* Bookings Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">#</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Service</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">City</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Date / Slot</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Craftsman</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-muted-foreground">Loading bookings...</td>
                  </tr>
                )}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      No bookings match your filters.
                    </td>
                  </tr>
                )}
                {filtered.map((b) => {
                  const svcCat = b.serviceCategory.toLowerCase();
                  const cityMatchedCraftsmen = availableCraftsmen
                    .filter((c) => !b.city || c.city === b.city)
                    .sort((ca, cb) => {
                      const aMatch = ca.skills.some((s) => s.toLowerCase().includes(svcCat));
                      const bMatch = cb.skills.some((s) => s.toLowerCase().includes(svcCat));
                      return (bMatch ? 1 : 0) - (aMatch ? 1 : 0) || cb.rating - ca.rating;
                    });
                  const otherCraftsmen = availableCraftsmen.filter((c) => b.city && c.city !== b.city);

                  return (
                    <tr key={b.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${b.status === "pending" ? "bg-yellow-50/20" : ""}`}>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{b.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground">{b.customerName}</div>
                        <div className="text-xs text-muted-foreground">{b.customerPhone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="text-xs font-normal">{b.serviceCategory}</Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{b.city || "—"}</td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-foreground font-medium">{b.scheduledDate}</div>
                        <div className="text-xs text-muted-foreground capitalize">{b.timeSlot}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Select
                          value={b.craftsmanId ? String(b.craftsmanId) : "unassigned"}
                          onValueChange={(val) => val !== "unassigned" && handleAssign(b.id, Number(val))}
                        >
                          <SelectTrigger className="w-36 h-7 text-xs border-dashed">
                            <SelectValue placeholder="Assign" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned" className="text-xs italic text-muted-foreground">Unassigned</SelectItem>
                            {cityMatchedCraftsmen.length > 0 && (
                              <>
                                <div className="px-2 py-1 text-[10px] text-muted-foreground font-medium uppercase">In {b.city || "city"}</div>
                                {cityMatchedCraftsmen.map((c) => (
                                  <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                                    {c.name} ({c.rating.toFixed(1)}★)
                                  </SelectItem>
                                ))}
                              </>
                            )}
                            {otherCraftsmen.length > 0 && (
                              <>
                                <div className="px-2 py-1 text-[10px] text-muted-foreground font-medium uppercase">Other cities</div>
                                {otherCraftsmen.map((c) => (
                                  <SelectItem key={c.id} value={String(c.id)} className="text-xs text-muted-foreground">
                                    {c.name} · {c.city}
                                  </SelectItem>
                                ))}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4"><StatusBadge status={b.status} /></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Select value={b.status} onValueChange={(val) => handleStatusChange(b.id, val)}>
                            <SelectTrigger className="w-28 h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs capitalize">{s.replace("_", " ")}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {b.status === "completed" && !b.rating && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2"
                              onClick={() => { setRatingBookingId(b.id); setRating(0); setReview(""); }}
                            >
                              <Star className="w-3 h-3 mr-1" /> Rate
                            </Button>
                          )}
                          {b.rating ? (
                            <div className="flex items-center text-xs text-amber-500 font-medium border px-1.5 rounded bg-amber-50 h-7 shrink-0">
                              <Star className="w-3 h-3 fill-current mr-0.5" />{b.rating}
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Rating Dialog */}
      <Dialog open={!!ratingBookingId} onOpenChange={(o) => !o && setRatingBookingId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rate Job</DialogTitle></DialogHeader>
          <div className="space-y-5 py-2">
            <div>
              <Label className="mb-3 block">Rating</Label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(s)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star className={`w-8 h-8 ${s <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Review (optional)</Label>
              <Textarea
                placeholder="Share experience..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="min-h-20 resize-none"
              />
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
