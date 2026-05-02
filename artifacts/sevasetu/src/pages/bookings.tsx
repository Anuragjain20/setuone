import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Calendar, MapPin, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Nav from "@/components/nav";
import { StatusBadge } from "@/components/status-badge";
import { useListBookings, useUpdateBooking, getListBookingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const TIME_LABELS: Record<string, string> = { morning: "Morning (8 AM – 12 PM)", afternoon: "Afternoon (12 PM – 4 PM)", evening: "Evening (4 PM – 8 PM)" };

export default function Bookings() {
  const { data: bookings, isLoading } = useListBookings();
  const updateBooking = useUpdateBooking();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [ratingBookingId, setRatingBookingId] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");

  const handleRate = async () => {
    if (!ratingBookingId) return;
    try {
      await updateBooking.mutateAsync({ id: ratingBookingId, data: { rating, review } });
      queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
      toast({ title: "Rating submitted!", description: "Thank you for your feedback." });
      setRatingBookingId(null);
      setRating(0);
      setReview("");
    } catch {
      toast({ title: "Failed to submit rating", variant: "destructive" });
    }
  };

  const sorted = [...(bookings ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Bookings</h1>
          <p className="text-muted-foreground">Track the status of all your service bookings.</p>
        </div>

        {isLoading && (
          <div className="space-y-4">
            {[1,2,3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-5 bg-muted rounded w-1/3 mb-3" />
                <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </Card>
            ))}
          </div>
        )}

        {!isLoading && sorted.length === 0 && (
          <Card className="p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No bookings yet</h2>
            <p className="text-muted-foreground mb-6">Book your first home service and it will appear here.</p>
            <Button onClick={() => window.location.href = "/book"}>Book a Service</Button>
          </Card>
        )}

        <div className="space-y-4">
          {sorted.map((booking, idx) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
            >
              <Card className="p-5 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{booking.serviceCategory}</h3>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">Booking #{booking.id}</p>
                  </div>
                  {booking.totalAmount && (
                    <div className="text-right">
                      <p className="font-bold text-foreground">₹{booking.totalAmount.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{booking.scheduledDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{TIME_LABELS[booking.timeSlot] ?? booking.timeSlot}</span>
                  </div>
                  <div className="flex items-start gap-1.5 sm:col-span-2">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{booking.address}</span>
                  </div>
                </div>

                {booking.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2 italic">"{booking.description}"</p>
                )}

                {booking.craftsmanName && (
                  <div className="flex items-center gap-2 mb-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {booking.craftsmanName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{booking.craftsmanName}</p>
                      <p className="text-xs text-muted-foreground">Assigned Professional</p>
                    </div>
                  </div>
                )}

                {booking.rating ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= Math.round(booking.rating!) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                      ))}
                    </div>
                    {booking.review && <p className="text-sm text-muted-foreground">"{booking.review}"</p>}
                  </div>
                ) : booking.status === "completed" ? (
                  <Button size="sm" variant="outline" onClick={() => { setRatingBookingId(booking.id); setRating(0); setReview(""); }}>
                    <Star className="w-3.5 h-3.5 mr-1.5" /> Rate this Job
                  </Button>
                ) : null}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Rating Dialog */}
      <Dialog open={!!ratingBookingId} onOpenChange={(o) => !o && setRatingBookingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div>
              <Label className="mb-3 block">How was the work quality?</Label>
              <div className="flex gap-2 justify-center">
                {[1,2,3,4,5].map((s) => (
                  <button
                    key={s}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(s)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star className={`w-8 h-8 ${s <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
                </p>
              )}
            </div>
            <div>
              <Label className="mb-2 block">Write a review (optional)</Label>
              <Textarea
                placeholder="Share your experience with the craftsman..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="min-h-24 resize-none"
              />
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
