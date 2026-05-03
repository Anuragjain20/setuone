import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Wrench, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Nav from "@/components/nav";
import { useToast } from "@/hooks/use-toast";

const ALL_SKILLS = ["Plumbing", "Carpentry", "Electrical", "Painting", "AC Service", "Home Cleaning", "Pest Control", "CCTV/Security", "Welding", "Tiling", "Waterproofing", "Appliance Repair"];
const ALL_AREAS = ["Vijay Nagar", "Palasia", "New Palasia", "Sukhliya", "Scheme 54", "Scheme 78", "AB Road", "LIG Colony", "Nipania", "Rajendra Nagar", "Annapurna", "Indore Central", "MG Road", "Sadar Bazar"];

export default function Join() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", experience: "", bio: "", photoUrl: "",
    skills: [] as string[], serviceAreas: [] as string[],
  });
  const { toast } = useToast();

  const toggleSkill = (s: string) => setForm((p) => ({ ...p, skills: p.skills.includes(s) ? p.skills.filter((x) => x !== s) : [...p.skills, s] }));
  const toggleArea = (a: string) => setForm((p) => ({ ...p, serviceAreas: p.serviceAreas.includes(a) ? p.serviceAreas.filter((x) => x !== a) : [...p.serviceAreas, a] }));

  const submit = async () => {
    if (!form.name || !form.phone || form.skills.length === 0 || form.serviceAreas.length === 0) {
      toast({ title: "Please fill all required fields", variant: "destructive" }); return;
    }
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) {
      toast({ title: "Enter a valid 10-digit phone number", variant: "destructive" }); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/craftsmen/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: form.phone.replace(/\s/g, ""), experience: Number(form.experience) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
    } catch (e: any) {
      toast({ title: e.message ?? "Failed to submit application", variant: "destructive" });
    } finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <Nav />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </motion.div>
          <h1 className="text-2xl font-bold text-[#1A1209] mb-3">Application Submitted!</h1>
          <p className="text-[#5C5043] mb-2">Thank you for applying to join SevaSetu. Our team will review your application and contact you within 2–3 business days.</p>
          <p className="text-sm text-[#8A7A68]">For any queries, WhatsApp us at +91 77777 77777</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <Nav />
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-[#1A1209] mb-3">Join SevaSetu as a Karigar</h1>
          <p className="text-[#5C5043] max-w-md mx-auto">Get regular work, guaranteed payments, and build your reputation in Indore. 50+ verified craftsmen already trust us.</p>
          <div className="flex justify-center gap-6 mt-5">
            {[["₹0", "Joining fee"], ["30+", "Jobs/month avg"], ["24h", "Payment after job"]].map(([v, l]) => (
              <div key={l} className="text-center">
                <p className="text-xl font-bold text-primary">{v}</p>
                <p className="text-xs text-[#8A7A68]">{l}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <Card className="p-7 border-[#EDE8E0] space-y-6">
          {/* Personal Info */}
          <div>
            <h2 className="font-semibold text-[#1A1209] mb-4">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name <span className="text-red-500">*</span></Label>
                <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ramesh Sharma" />
              </div>
              <div className="space-y-1.5">
                <Label>Mobile Number <span className="text-red-500">*</span></Label>
                <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="9876543210" />
              </div>
              <div className="space-y-1.5">
                <Label>Years of Experience</Label>
                <Input type="number" value={form.experience} onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))} placeholder="5" min="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Profile Photo URL (optional)</Label>
                <Input value={form.photoUrl} onChange={(e) => setForm((p) => ({ ...p, photoUrl: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Short Bio (optional)</Label>
                <Textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Tell customers about your expertise and experience..." rows={3} className="resize-none" />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label className="mb-3 block">Skills / Services you offer <span className="text-red-500">*</span></Label>
            <div className="flex flex-wrap gap-2">
              {ALL_SKILLS.map((s) => (
                <button key={s} onClick={() => toggleSkill(s)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${form.skills.includes(s) ? "bg-primary text-white border-primary" : "border-[#D4C5B0] text-[#5C5043] hover:border-primary hover:text-primary"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Service Areas */}
          <div>
            <Label className="mb-3 block">Areas you cover in Indore <span className="text-red-500">*</span></Label>
            <div className="flex flex-wrap gap-2">
              {ALL_AREAS.map((a) => (
                <button key={a} onClick={() => toggleArea(a)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${form.serviceAreas.includes(a) ? "bg-primary text-white border-primary" : "border-[#D4C5B0] text-[#5C5043] hover:border-primary hover:text-primary"}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-[#F5F1EB] rounded-xl p-4">
            <p className="text-sm font-semibold text-[#1A1209] mb-2">What you get by joining</p>
            <ul className="space-y-1.5">
              {["Regular job assignments matched to your skills", "Customers rate you — build your reputation", "Guaranteed payment within 24 hours of job completion", "Free training and skill certification program"].map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-[#3D3020]">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />{b}
                </li>
              ))}
            </ul>
          </div>

          <Button className="w-full h-12 bg-primary text-white rounded-xl text-base font-semibold gap-2" onClick={submit} disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            Submit Application
          </Button>
        </Card>
      </div>
    </div>
  );
}

