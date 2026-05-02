import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, ArrowLeft, CreditCard, Smartphone, Banknote, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Nav from "@/components/nav";

const METHODS = [
  { id: "upi", label: "UPI / GPay / PhonePe", icon: Smartphone, desc: "Instant transfer via UPI ID" },
  { id: "card", label: "Debit / Credit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
  { id: "cash", label: "Cash on Delivery", icon: Banknote, desc: "Pay directly to the karigar" },
];

export default function Pay() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [method, setMethod] = useState("upi");
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: booking, isLoading } = useQuery<any>({
    queryKey: ["booking", id],
    queryFn: () => fetch(`/api/bookings/${id}`).then((r) => r.json()),
    enabled: !isNaN(id),
  });

  const handlePay = async () => {
    setPaying(true);
    // Simulate payment gateway delay
    await new Promise((r) => setTimeout(r, 1800));
    try {
      await fetch(`/api/bookings/${id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });
      qc.invalidateQueries({ queryKey: ["booking", id] });
      setPaid(true);
      toast({ title: "Payment successful!" });
    } catch {
      toast({ title: "Payment failed. Try again.", variant: "destructive" });
    } finally { setPaying(false); }
  };

  if (isLoading) return <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!booking || booking.error) return <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center"><p>Booking not found.</p></div>;

  const grand = (booking.totalAmount ?? 0) + (booking.convenienceFee ?? 75);

  if (paid || booking.paymentStatus === "paid") {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <Nav />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1209] mb-3">Payment Successful!</h1>
          <p className="text-[#5C5043] mb-2">₹{grand.toLocaleString("en-IN")} paid via {method.toUpperCase()} for Booking #{id}.</p>
          <p className="text-sm text-[#8A7A68] mb-8">A confirmation message has been sent to your phone.</p>
          <div className="flex gap-3 justify-center">
            <Link href={`/bookings/${id}/invoice`}><Button variant="outline" className="border-[#D4C5B0]">Download Invoice</Button></Link>
            <Link href="/bookings"><Button className="bg-primary text-white">My Bookings</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <Nav />
      <div className="max-w-md mx-auto px-4 py-10">
        <Link href="/bookings"><Button variant="outline" size="sm" className="gap-2 mb-6 border-[#D4C5B0]"><ArrowLeft className="w-4 h-4" />Back to Bookings</Button></Link>

        <h1 className="text-2xl font-bold text-[#1A1209] mb-2">Complete Payment</h1>
        <p className="text-[#5C5043] mb-6">Booking #{id} · {booking.serviceCategory}</p>

        {/* Amount Card */}
        <Card className="p-5 mb-5 border-[#EDE8E0] bg-white">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-[#5C5043]">
              <span>Service Fee</span><span>₹{(booking.totalAmount ?? 0).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm text-[#5C5043]">
              <span>Convenience Fee</span><span>₹{(booking.convenienceFee ?? 75).toLocaleString("en-IN")}</span>
            </div>
            <div className="border-t border-[#EDE8E0] pt-2 flex justify-between font-bold text-[#1A1209]">
              <span>Total</span><span className="text-xl">₹{grand.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </Card>

        {/* Payment Methods */}
        <p className="text-sm font-semibold text-[#1A1209] mb-3">Choose payment method</p>
        <div className="space-y-2 mb-6">
          {METHODS.map((m) => (
            <button key={m.id} onClick={() => setMethod(m.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${method === m.id ? "border-primary bg-primary/5" : "border-[#EDE8E0] bg-white hover:border-primary/40"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${method === m.id ? "bg-primary/10" : "bg-[#F5F1EB]"}`}>
                <m.icon className={`w-5 h-5 ${method === m.id ? "text-primary" : "text-[#8A7A68]"}`} />
              </div>
              <div className="text-left">
                <p className={`font-medium text-sm ${method === m.id ? "text-primary" : "text-[#1A1209]"}`}>{m.label}</p>
                <p className="text-xs text-[#8A7A68]">{m.desc}</p>
              </div>
              <div className={`ml-auto w-4 h-4 rounded-full border-2 ${method === m.id ? "border-primary bg-primary" : "border-[#D4C5B0]"}`} />
            </button>
          ))}
        </div>

        <Button className="w-full h-12 bg-primary text-white rounded-xl text-base font-semibold gap-2" onClick={handlePay} disabled={paying}>
          {paying ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</> : <>Pay ₹{grand.toLocaleString("en-IN")} →</>}
        </Button>
        <p className="text-xs text-center text-[#8A7A68] mt-3">🔒 Secure · Powered by Razorpay (demo)</p>
      </div>
    </div>
  );
}
