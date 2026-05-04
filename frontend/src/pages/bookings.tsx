import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Calendar, MapPin, Clock, Filter, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Nav from "@/components/nav";
import { StatusBadge } from "@/components/status-badge";
import { useQuery } from "@tanstack/react-query";

const TIME_LABELS: Record<string, string> = {
  morning: "Morning (8 AM – 12 PM)",
  afternoon: "Afternoon (12 PM – 4 PM)",
  evening: "Evening (4 PM – 8 PM)",
};

export default function Bookings() {
  const [phone, setPhone] = useState("");
  const [searchedPhone, setSearchedPhone] = useState("");

  const { data: bookings, isLoading } = useQuery<any[]>({
    queryKey: ["bookings", searchedPhone],
    queryFn: () =>
      fetch(`/api/bookings?phone=${encodeURIComponent(searchedPhone)}`).then((r) => r.json()),
    enabled: searchedPhone.length === 10,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 10) {
      setSearchedPhone(phone);
    }
  };

  const sorted = [...(bookings ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <Nav />
      <div className="max-w-3xl mx-auto px-4 py-10">
        
        {!searchedPhone ? (
          <div className="max-w-md mx-auto py-24 text-center">
            <div className="text-5xl mb-5">📱</div>
            <h1 className="text-2xl font-bold text-[#1A1209] mb-3">Check Your Bookings</h1>
            <p className="text-[#5C5043] mb-8">Enter the phone number you used during booking.</p>
            <form onSubmit={handleSearch} className="flex gap-2 max-w-sm mx-auto">
              <Input 
                placeholder="10-digit phone number" 
                maxLength={10} 
                value={phone} 
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} 
                className="bg-white"
              />
              <Button type="submit" disabled={phone.length !== 10}>Search</Button>
            </form>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#1A1209] mb-1">Your Bookings</h1>
                <p className="text-[#5C5043]">Showing requests for {searchedPhone}</p>
              </div>
              <Button variant="outline" onClick={() => { setSearchedPhone(""); setPhone(""); }}>
                Search Another Number
              </Button>
            </div>

            {isLoading && (
              <div className="space-y-4">
                {[1,2].map((i) => <Card key={i} className="p-6 animate-pulse"><div className="h-5 bg-muted rounded w-1/3 mb-3" /><div className="h-4 bg-muted rounded w-2/3" /></Card>)}
              </div>
            )}

            {!isLoading && sorted.length === 0 && (
              <Card className="p-12 text-center border-[#EDE8E0]">
                <div className="text-4xl mb-4">📋</div>
                <h2 className="text-xl font-semibold text-[#1A1209] mb-2">No bookings found</h2>
                <p className="text-[#5C5043] mb-6">We couldn't find any service requests for {searchedPhone}.</p>
              </Card>
            )}

            <div className="space-y-4">
              {sorted.map((booking, idx) => (
                <motion.div key={booking.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className="p-5 hover:shadow-md transition-all duration-200 border-[#EDE8E0]">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-[#1A1209]">{booking.serviceCategory}</h3>
                          <StatusBadge status={booking.status} />
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
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
