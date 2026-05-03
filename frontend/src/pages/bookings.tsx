import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Calendar, MapPin, Clock, XCircle, AlertTriangle, Receipt, CreditCard, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Nav from "@/components/nav";
import { StatusBadge } from "@/components/status-badge";
import { useUpdateBooking } from "@/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { LoginModal } from "@/components/login-modal";
import { Link } from "wouter";

const TIME_LABELS: Record<string, string> = {
  morning: "Morning (8 AM – 12 PM)",
  afternoon: "Afternoon (12 PM – 4 PM)",
  evening: "Evening (4 PM – 8 PM)",
};

type BookingStatus = "all" | "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

export default function Bookings() {
  const { user, loading: authLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BookingStatus>("all");
  const [ratingBookingId, setRatingBookingId] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [flagBookingId, setFlagBookingId] = useState<number | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [cancelId, setCancelId] = useState<number | null>(null);

  const { data: bookings, isLoading } = useQuery<any[]>({
    queryKey: ["bookings", user?.phone],
    queryFn: () =>
      fetch(`/api/bookings?phone=${encodeURIComponent(user!.phone)}`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!user,
  });
  const updateBooking = useUpdateBooking();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["bookings", user?.phone] });

  const handleRate = async () => {
    if (!ratingBookingId || !rating) return;
    try {
      await updateBooking.mutateAsync({ id: ratingBookingId, data: { rating, review } });
      invalidate();
      toast({ title: "Rating submitted!", description: "Thank you for your feedback." });
      setRatingBookingId(null); setRating(0); setReview("");
    } catch { toast({ title: "Failed to submit rating", variant: "destructive" }); }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      const res = await fetch(`/api/bookings/${cancelId}/cancel`, { method: "POST", credentials: "include" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      invalidate();
      toast({ title: "Booking cancelled" });
      setCancelId(null);
    } catch (e: any) { toast({ title: e.message ?? "Failed to cancel", variant: "destructive" }); }
  };

  const handleFlag = async () => {
    if (!flagBookingId || !flagReason.trim()) return;
    try {
      await fetch(`/api/bookings/${flagBookingId}/flag`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: flagReason }),
      });
      invalidate();
      toast({ title: "Issue reported", description: "Our team will look into this within 24 hours." });
      setFlagBookingId(null); setFlagReason("");
    } catch { toast({ title: "Failed to report issue", variant: "destructive" }); }
  };

  const sorted = [...(bookings ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .filter((b) => statusFilter === "all" || b.status === statusFilter);

  if (authLoading) return <div className="min-h-screen bg-[#FAF8F4]"><Nav /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <Nav />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="text-5xl mb-5">🔐</div>
          <h1 className="text-2xl font-bold text-[#1A1209] mb-3">Sign in to view your bookings</h1>
          <p className="text-[#5C5043] mb-8">Your booking history is tied to your phone number. Sign in with OTP to see all your past and upcoming jobs.</p>
          <Button size="lg" className="bg-primary text-white px-8 h-12 rounded-xl" onClick={() => setShowLogin(true)}>Sign In with OTP</Button>
        </div>
        <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <Nav />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1209] mb-1">Your Bookings</h1>
            <p className="text-[#5C5043]">Hi {user.name ?? user.phone} — here are all your service requests.</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BookingStatus)}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bookings</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-4">
            {[1,2,3].map((i) => <Card key={i} className="p-6 animate-pulse"><div className="h-5 bg-muted rounded w-1/3 mb-3" /><div className="h-4 bg-muted rounded w-2/3" /></Card>)}
          </div>
        )}

        {!isLoading && sorted.length === 0 && (
          <Card className="p-12 text-center border-[#EDE8E0]">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-[#1A1209] mb-2">No bookings yet</h2>
            <p className="text-[#5C5043] mb-6">Book your first home service and it will appear here.</p>
            <Link href="/book"><Button>Book a Service</Button></Link>
          </Card>
        )}

        <div className="space-y-4">
          {sorted.map((booking, idx) => (
            <motion.div key={booking.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card className={`p-5 hover:shadow-md transition-all duration-200 border-[#EDE8E0] ${(booking as any).isFlagged ? "border-red-200 bg-red-50/30" : ""}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-[#1A1209]">{booking.serviceCategory}</h3>
                      <StatusBadge status={booking.status} />
                      {(booking as any).isFlagged && <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Flagged</Badge>}
                      {(booking as any).paymentStatus === "paid" && <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Paid</Badge>}
                    </div>
                    <p className="text-sm text-[#8A7A68]">Booking #{booking.id}</p>
                  </div>
                  {booking.totalAmount && (
                    <div className="text-right shrink-0">
                      <p className="font-bold text-[#1A1209]">₹{booking.totalAmount.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-[#8A7A68]">Total</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#5C5043] mb-3">
                  <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /><span>{booking.scheduledDate}</span></div>
                  <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /><span>{TIME_LABELS[booking.timeSlot] ?? booking.timeSlot}</span></div>
                  <div className="flex items-start gap-1.5 sm:col-span-2"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" /><span className="line-clamp-2">{booking.address}</span></div>
                </div>

                {booking.craftsmanName && (
                  <div className="flex items-center gap-2 mb-3 p-3 rounded-xl bg-[#F5F1EB] border border-[#EDE8E0]">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{booking.craftsmanName.charAt(0)}</div>
                    <div><p className="text-sm font-medium text-[#1A1209]">{booking.craftsmanName}</p><p className="text-xs text-[#8A7A68]">Assigned Professional</p></div>
                  </div>
                )}

                {(booking as any).completionNotes && (
                  <div className="mb-3 p-3 rounded-xl bg-green-50 border border-green-200">
                    <p className="text-xs font-medium text-green-700 mb-1">Completion Notes</p>
                    <p className="text-sm text-green-800">{(booking as any).completionNotes}</p>
                  </div>
                )}

                {booking.rating ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">{[1,2,3,4,5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= Math.round(booking.rating!) ? "fill-amber-400 text-amber-400" : "text-muted"}`} />)}</div>
                    {booking.review && <p className="text-sm text-[#5C5043]">"{booking.review}"</p>}
                  </div>
                ) : booking.status === "completed" ? (
                  <Button size="sm" variant="outline" className="border-[#D4C5B0]" onClick={() => { setRatingBookingId(booking.id); setRating(0); setReview(""); }}>
                    <Star className="w-3.5 h-3.5 mr-1.5" /> Rate this Job
                  </Button>
                ) : null}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#EDE8E0]">
                  {booking.status === "completed" && booking.totalAmount && (booking as any).paymentStatus !== "paid" && (
                    <Link href={`/bookings/${booking.id}/pay`}>
                      <Button size="sm" className="bg-primary text-white h-8 text-xs gap-1">
                        <CreditCard className="w-3 h-3" /> Pay ₹{booking.totalAmount.toLocaleString("en-IN")}
                      </Button>
                    </Link>
                  )}
                  {booking.status === "completed" && (
                    <Link href={`/bookings/${booking.id}/invoice`}>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-[#D4C5B0]">
                        <Receipt className="w-3 h-3" /> Invoice
                      </Button>
                    </Link>
                  )}
                  {["pending", "confirmed"].includes(booking.status) && (
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50" onClick={() => setCancelId(booking.id)}>
                      <XCircle className="w-3 h-3" /> Cancel
                    </Button>
                  )}
                  {!((booking as any).isFlagged) && booking.status !== "cancelled" && (
                    <Button size="sm" variant="ghost" className="h-8 text-xs gap-1 text-[#8A7A68] hover:text-red-600" onClick={() => { setFlagBookingId(booking.id); setFlagReason(""); }}>
                      <AlertTriangle className="w-3 h-3" /> Report Issue
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Rating Dialog */}
      <Dialog open={!!ratingBookingId} onOpenChange={(o) => !o && setRatingBookingId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rate Your Experience</DialogTitle></DialogHeader>
          <div className="space-y-5 py-2">
            <div>
              <Label className="mb-3 block">How was the work quality?</Label>
              <div className="flex gap-2 justify-center">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(s)} className="transition-transform hover:scale-110">
                    <Star className={`w-8 h-8 ${s <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                  </button>
                ))}
              </div>
              {rating > 0 && <p className="text-center text-sm text-muted-foreground mt-2">{["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}</p>}
            </div>
            <div>
              <Label className="mb-2 block">Write a review (optional)</Label>
              <Textarea placeholder="Share your experience..." value={review} onChange={(e) => setReview(e.target.value)} className="min-h-24 resize-none" />
            </div>
            <Button className="w-full" onClick={handleRate} disabled={!rating || updateBooking.isPending}>
              {updateBooking.isPending ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={!!cancelId} onOpenChange={(o) => !o && setCancelId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancel Booking?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to cancel booking #{cancelId}? This cannot be undone.</p>
          <div className="flex gap-3 mt-2">
            <Button variant="destructive" className="flex-1" onClick={handleCancel}>Yes, Cancel It</Button>
            <Button variant="outline" className="flex-1" onClick={() => setCancelId(null)}>Keep Booking</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Flag Dialog */}
      <Dialog open={!!flagBookingId} onOpenChange={(o) => !o && setFlagBookingId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Report an Issue</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Tell us what went wrong. Our team will look into this within 24 hours.</p>
          <Textarea placeholder="Describe the issue..." value={flagReason} onChange={(e) => setFlagReason(e.target.value)} className="min-h-24 resize-none" />
          <div className="flex gap-3">
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleFlag} disabled={!flagReason.trim()}>Submit Report</Button>
            <Button variant="outline" className="flex-1" onClick={() => setFlagBookingId(null)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

