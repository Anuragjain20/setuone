import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Invoice() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data: booking, isLoading } = useQuery<any>({
    queryKey: ["booking", id],
    queryFn: () => fetch(`/api/bookings/${id}`).then((r) => r.json()),
    enabled: !isNaN(id),
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><p>Loading…</p></div>;
  if (!booking || booking.error) return <div className="min-h-screen flex items-center justify-center"><p>Booking not found.</p></div>;

  const subtotal = booking.totalAmount ?? 0;
  const platform = booking.platformFee ?? Math.round(subtotal * 0.15);
  const convenience = booking.convenienceFee ?? 75;
  const grand = subtotal + convenience;
  const date = new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <div className="max-w-2xl mx-auto px-4 py-8 print:py-0">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href="/bookings"><Button variant="outline" size="sm" className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <Button onClick={() => window.print()} className="gap-2 bg-primary text-white"><Printer className="w-4 h-4" />Print / Save PDF</Button>
        </div>

        <div className="bg-white border border-[#EDE8E0] rounded-2xl p-8 print:rounded-none print:border-none shadow-sm">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><span className="text-white text-xs font-black">SF</span></div>
                <span className="text-xl font-bold text-[#1A1209]">SnapFix</span>
              </div>
              <p className="text-sm text-[#8A7A68]">India</p>
              <p className="text-sm text-[#8A7A68]">+91 77777 77777</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-[#1A1209]">INVOICE</p>
              <p className="text-sm text-[#8A7A68] mt-1">#{String(booking.id).padStart(6, "0")}</p>
              <p className="text-sm text-[#8A7A68]">{date}</p>
            </div>
          </div>

          {/* Billed To + Service Info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-xs font-semibold text-[#8A7A68] uppercase tracking-wider mb-2">Billed To</p>
              <p className="font-semibold text-[#1A1209]">{booking.customerName}</p>
              <p className="text-sm text-[#5C5043]">{booking.customerPhone}</p>
              <p className="text-sm text-[#5C5043] mt-1 leading-relaxed">{booking.address}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#8A7A68] uppercase tracking-wider mb-2">Service Details</p>
              <p className="font-semibold text-[#1A1209]">{booking.serviceCategory}</p>
              <p className="text-sm text-[#5C5043]">Date: {booking.scheduledDate}</p>
              <p className="text-sm text-[#5C5043]">Slot: {booking.timeSlot}</p>
              {booking.craftsmanName && <p className="text-sm text-[#5C5043]">By: {booking.craftsmanName}</p>}
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b border-[#EDE8E0]">
                <th className="text-left py-2 text-xs text-[#8A7A68] font-semibold uppercase tracking-wider">Description</th>
                <th className="text-right py-2 text-xs text-[#8A7A68] font-semibold uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#EDE8E0]">
                <td className="py-3">
                  <p className="font-medium text-[#1A1209]">{booking.serviceCategory} Service</p>
                  {booking.description && <p className="text-sm text-[#8A7A68] mt-0.5 line-clamp-2">{booking.description}</p>}
                  {booking.completionNotes && <p className="text-sm text-[#8A7A68] mt-0.5">Work done: {booking.completionNotes}</p>}
                </td>
                <td className="py-3 text-right font-medium text-[#1A1209]">₹{subtotal.toLocaleString("en-IN")}</td>
              </tr>
              <tr className="border-b border-[#EDE8E0]">
                <td className="py-3 text-sm text-[#5C5043]">Convenience Fee</td>
                <td className="py-3 text-right text-sm text-[#5C5043]">₹{convenience.toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-4 font-bold text-[#1A1209]">Total</td>
                <td className="pt-4 text-right font-black text-xl text-[#1A1209]">₹{grand.toLocaleString("en-IN")}</td>
              </tr>
            </tfoot>
          </table>

          {/* Payment Status */}
          <div className={`rounded-xl p-4 mb-6 ${booking.paymentStatus === "paid" ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
            <p className={`text-sm font-semibold ${booking.paymentStatus === "paid" ? "text-green-700" : "text-amber-700"}`}>
              Payment Status: {booking.paymentStatus === "paid" ? "✅ Paid" : "⏳ Pending"}
            </p>
          </div>

          {/* Rating */}
          {booking.rating && (
            <div className="border-t border-[#EDE8E0] pt-4">
              <p className="text-xs font-semibold text-[#8A7A68] uppercase tracking-wider mb-2">Customer Rating</p>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((s) => <span key={s} className={s <= booking.rating ? "text-amber-400" : "text-[#D4C5B0]"}>★</span>)}
                <span className="text-sm text-[#5C5043] ml-2">{booking.rating}/5</span>
              </div>
              {booking.review && <p className="text-sm text-[#5C5043] mt-1 italic">"{booking.review}"</p>}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-[#EDE8E0] pt-4 mt-6 text-center">
            <p className="text-xs text-[#8A7A68]">Thank you for choosing SnapFix · Book a Fix in a Snap</p>
            <p className="text-xs text-[#8A7A68]">For support: +91 77777 77777 · snapfix.in</p>
          </div>
        </div>
      </div>
    </div>
  );
}

