import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, Calendar, MapPin, FileText, Wrench, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Nav from "@/components/nav";
import { useListServices, useCreateBooking } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const SERVICE_ICONS: Record<string, string> = {
  wrench: "🔧", zap: "⚡", paint: "🖌️", hammer: "🔨", wind: "❄️", sparkles: "✨", bug: "🛡️", camera: "📷"
};

const TIME_SLOTS = [
  { value: "morning", label: "Morning", time: "8 AM – 12 PM" },
  { value: "afternoon", label: "Afternoon", time: "12 PM – 4 PM" },
  { value: "evening", label: "Evening", time: "4 PM – 8 PM" },
];

const STEPS = [
  { id: 1, label: "Service", icon: Wrench },
  { id: 2, label: "Location", icon: MapPin },
  { id: 3, label: "Schedule", icon: Calendar },
  { id: 4, label: "Details", icon: FileText },
  { id: 5, label: "Confirm", icon: Check },
];

type FormData = {
  serviceCategory: string;
  serviceName: string;
  servicePriceRange: string;
  address: string;
  scheduledDate: string;
  timeSlot: string;
  description: string;
  customerName: string;
  customerPhone: string;
};

const fadeSlide = {
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export default function Book() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: services } = useListServices();
  const createBooking = useCreateBooking();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    serviceCategory: "", serviceName: "", servicePriceRange: "",
    address: "", scheduledDate: "", timeSlot: "",
    description: "", customerName: "", customerPhone: "",
  });

  const update = (key: keyof FormData, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const canNext = () => {
    if (step === 1) return !!form.serviceCategory;
    if (step === 2) return form.address.length > 5;
    if (step === 3) return !!form.scheduledDate && !!form.timeSlot;
    if (step === 4) return form.description.length > 5;
    if (step === 5) return form.customerName.length > 1 && form.customerPhone.length === 10;
    return true;
  };

  const minDate = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  };

  const handleSubmit = async () => {
    try {
      await createBooking.mutateAsync({
        data: {
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          serviceCategory: form.serviceCategory,
          serviceName: form.serviceName || form.serviceCategory,
          address: form.address,
          scheduledDate: form.scheduledDate,
          timeSlot: form.timeSlot as "morning" | "afternoon" | "evening",
          description: form.description,
        },
      });
      toast({ title: "Booking Submitted!", description: "We'll confirm your booking within 30 minutes via WhatsApp." });
      navigate("/bookings");
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    }
  };

  const groupedServices: Record<string, typeof services> = {};
  services?.forEach((s) => {
    if (!groupedServices[s.category]) groupedServices[s.category] = [];
    groupedServices[s.category]!.push(s);
  });

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Progress */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex flex-col items-center gap-1 ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${step > s.id ? "bg-primary text-primary-foreground" : step === s.id ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-muted text-muted-foreground"}`}>
                  {step > s.id ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span className={`text-xs hidden sm:block ${step === s.id ? "text-primary font-semibold" : "text-muted-foreground"}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 rounded-full transition-all duration-300 ${step > s.id ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} variants={fadeSlide} initial="hidden" animate="show" exit="exit" transition={{ duration: 0.25 }}>
            {/* Step 1: Service Selection */}
            {step === 1 && (
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">What service do you need?</h1>
                <p className="text-muted-foreground mb-6">Choose from our trusted service categories.</p>
                <div className="grid grid-cols-2 gap-3">
                  {(services ?? FALLBACK_SERVICES).map((service) => (
                    <Card
                      key={service.id}
                      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${form.serviceCategory === service.category ? "border-primary ring-2 ring-primary/20 bg-accent" : "hover:border-primary/30"}`}
                      onClick={() => { update("serviceCategory", service.category); update("serviceName", service.name); update("servicePriceRange", `₹${service.avgMinPrice.toLocaleString("en-IN")} – ₹${service.avgMaxPrice.toLocaleString("en-IN")}`); }}
                    >
                      <div className="text-3xl mb-2">{SERVICE_ICONS[service.iconName] ?? "🔨"}</div>
                      <h3 className="font-semibold text-sm text-foreground">{service.category}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">₹{service.avgMinPrice.toLocaleString("en-IN")}+</p>
                      {form.serviceCategory === service.category && (
                        <Badge className="mt-2 bg-primary text-primary-foreground text-xs">Selected</Badge>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Where is the job?</h1>
                <p className="text-muted-foreground mb-6">Enter your complete address in Indore.</p>
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Full Address</Label>
                    <Textarea
                      placeholder="e.g. 42, Sukhliya Colony, Vijay Nagar, Indore — 452010"
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      className="min-h-28 resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">Include flat/house number, colony, and landmark for faster dispatch.</p>
                  </div>
                  <Card className="p-4 bg-accent border-accent-border">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Coverage Area</p>
                        <p className="text-xs text-muted-foreground mt-0.5">We currently serve all major areas in Indore: Vijay Nagar, Palasia, Scheme 54, Sukhliya, AB Road, and more.</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 3: Schedule */}
            {step === 3 && (
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">When should we come?</h1>
                <p className="text-muted-foreground mb-6">Choose a date and time slot that works for you.</p>
                <div className="space-y-6">
                  <div>
                    <Label className="mb-2 block">Preferred Date</Label>
                    <Input
                      type="date"
                      value={form.scheduledDate}
                      min={minDate()}
                      onChange={(e) => update("scheduledDate", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">Same-day bookings available if booked before 12 PM.</p>
                  </div>
                  <div>
                    <Label className="mb-3 block">Time Slot</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {TIME_SLOTS.map((slot) => (
                        <Card
                          key={slot.value}
                          className={`p-4 cursor-pointer text-center transition-all duration-200 hover:shadow-md ${form.timeSlot === slot.value ? "border-primary ring-2 ring-primary/20 bg-accent" : "hover:border-primary/30"}`}
                          onClick={() => update("timeSlot", slot.value)}
                        >
                          <p className="font-semibold text-sm text-foreground">{slot.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{slot.time}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Description */}
            {step === 4 && (
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Describe the job</h1>
                <p className="text-muted-foreground mb-6">The more detail you give, the better we can prepare your professional.</p>
                <div className="space-y-4">
                  <Textarea
                    placeholder="e.g. Kitchen tap is leaking from the base — dripping constantly. Need a replacement. Also one bathroom flush is not working properly."
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    className="min-h-36 resize-none"
                  />
                  <Card className="p-4 bg-accent border-accent-border">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Tip:</span> Mention the problem clearly, how long it has been happening, and any specific materials or brand preferences.
                    </p>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 5: Contact & Confirm */}
            {step === 5 && (
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Your contact details</h1>
                <p className="text-muted-foreground mb-6">We'll send your booking confirmation via WhatsApp.</p>
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Your Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Priya Sharma"
                        value={form.customerName}
                        onChange={(e) => update("customerName", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">WhatsApp Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="9876543210"
                        value={form.customerPhone}
                        onChange={(e) => update("customerPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="pl-10"
                        type="tel"
                        maxLength={10}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">10-digit mobile number without country code.</p>
                  </div>

                  {/* Summary */}
                  <Card className="p-5 bg-muted/50 border-border mt-6">
                    <h3 className="font-semibold text-foreground mb-3 text-sm">Booking Summary</h3>
                    <div className="space-y-2 text-sm">
                      <SummaryRow label="Service" value={form.serviceCategory} />
                      <SummaryRow label="Address" value={form.address} />
                      <SummaryRow label="Date" value={form.scheduledDate} />
                      <SummaryRow label="Time" value={TIME_SLOTS.find((t) => t.value === form.timeSlot)?.label ?? form.timeSlot} />
                      {form.servicePriceRange && <SummaryRow label="Est. Cost" value={form.servicePriceRange} />}
                    </div>
                  </Card>

                  <Card className="p-4 bg-accent border-accent-border">
                    <p className="text-xs text-foreground">
                      By booking, you agree to our terms of service. A convenience fee of <span className="font-semibold">₹49–99</span> applies on confirmed bookings. Final price is determined after professional inspection.
                    </p>
                  </Card>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
          >
            <ChevronLeft className="mr-1 w-4 h-4" /> Back
          </Button>
          {step < 5 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
              Continue <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canNext() || createBooking.isPending}
              className="min-w-32"
            >
              {createBooking.isPending ? "Submitting..." : "Confirm Booking"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground w-20 shrink-0">{label}:</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

const FALLBACK_SERVICES = [
  { id: 1, category: "Plumbing", name: "Plumbing", iconName: "wrench", avgMinPrice: 500, avgMaxPrice: 2000, priority: "P0", description: "" },
  { id: 2, category: "Carpentry", name: "Carpentry", iconName: "hammer", avgMinPrice: 800, avgMaxPrice: 5000, priority: "P0", description: "" },
  { id: 3, category: "Electrical", name: "Electrical", iconName: "zap", avgMinPrice: 400, avgMaxPrice: 3000, priority: "P0", description: "" },
  { id: 4, category: "Painting", name: "Painting", iconName: "paint", avgMinPrice: 5000, avgMaxPrice: 40000, priority: "P0", description: "" },
];
