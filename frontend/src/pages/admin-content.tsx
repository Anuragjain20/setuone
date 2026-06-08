import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Plus, Trash2, Image, Globe, Star, Type, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AdminLayout from "@/components/admin-layout";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useListServices } from "@/api";

type Config = Record<string, string>;
type Testimonial = {
  id: number; name: string; location: string; text: string; rating: number;
  avatarUrl: string | null; isActive: boolean; sortOrder: number;
};

const SERVICE_ICONS: Record<string, string> = {
  wrench: "🔧",
  zap: "⚡",
  paint: "🎨",
  hammer: "🔨",
  wind: "❄️",
  sparkles: "✨",
  bug: "🛡️",
  camera: "📷",
};

const TABS = ["Company", "Hero", "Services", "Testimonials", "Pricing"] as const;
type Tab = typeof TABS[number];

function useSiteConfig() {
  return useQuery<Config>({
    queryKey: ["site-config"],
    queryFn: () => fetch("/api/site-config").then((r) => r.json()),
  });
}

function useUpdateConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Config) => fetch("/api/site-config", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-config"] }),
  });
}

function useTestimonials() {
  return useQuery<Testimonial[]>({
    queryKey: ["testimonials"],
    queryFn: () => fetch("/api/testimonials").then((r) => r.json()),
  });
}

export default function AdminContent() {
  const [tab, setTab] = useState<Tab>("Company");
  const { data: config, isLoading: configLoading } = useSiteConfig();
  const { data: testimonials = [] } = useTestimonials();
  const { data: services = [] } = useListServices();
  const updateConfig = useUpdateConfig();
  const qc = useQueryClient();
  const { toast } = useToast();

  const cfg = (key: string) => config?.[key] ?? "";
  const save = async (updates: Config) => {
    try {
      await updateConfig.mutateAsync(updates);
      toast({ title: "Saved successfully" });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
    <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-0.5">Site Content</h1>
            <p className="text-sm text-muted-foreground">Configure everything displayed on the public landing page.</p>
          </div>
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">CMS</Badge>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-xl mb-8 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 min-w-fit py-2 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${tab === t ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Gate tab content on config being loaded so useState inits pick up real DB values */}
        {configLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading content settings…</div>
        ) : (
          <>
            {tab === "Company" && <CompanyTab cfg={cfg} save={save} loading={updateConfig.isPending} />}
            {tab === "Hero" && <HeroTab cfg={cfg} save={save} loading={updateConfig.isPending} />}
            {tab === "Services" && <ServicesTab services={services as any} toast={toast} qc={qc} />}
            {tab === "Testimonials" && <TestimonialsTab testimonials={testimonials} toast={toast} qc={qc} />}
            {tab === "Pricing" && <PricingTab cfg={cfg} save={save} loading={updateConfig.isPending} />}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}

function SaveBtn({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <Button onClick={onClick} disabled={loading} className="gap-2">
      <Save className="w-4 h-4" />
      {loading ? "Saving…" : "Save Changes"}
    </Button>
  );
}

function CompanyTab({ cfg, save, loading }: { cfg: (k: string) => string; save: (u: Config) => void; loading: boolean }) {
  const [name, setName] = useState(cfg("company_name") || "SnapFix");
  const [tagline, setTagline] = useState(cfg("company_tagline") || "Book a Fix in a Snap");
  const [phone, setPhone] = useState(cfg("company_phone") || "+91 93998 58706");
  const [whatsapp, setWhatsapp] = useState(cfg("company_whatsapp") || "919399858706");
  const [city, setCity] = useState(cfg("company_city") || "Indore");

  // re-sync when config loads
  useState(() => {
    setName(cfg("company_name") || "SnapFix");
    setTagline(cfg("company_tagline") || "Book a Fix in a Snap");
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Company Info</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Company Name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="SnapFix" /></Field>
          <Field label="Primary City (legacy)"><Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Indore" /></Field>
          <Field label="Tagline (Hindi/English)"><Input value={tagline} onChange={(e) => setTagline(e.target.value)} /></Field>
          <Field label="Display Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 93998 58706" /></Field>
          <Field label="WhatsApp Number (digits only, with country code)"><Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="919399858706" /></Field>
        </div>
      </Card>
      <div className="flex justify-end">
        <SaveBtn loading={loading} onClick={() => save({ company_name: name, company_tagline: tagline, company_phone: phone, company_whatsapp: whatsapp, company_city: city })} />
      </div>
    </motion.div>
  );
}

function HeroTab({ cfg, save, loading }: { cfg: (k: string) => string; save: (u: Config) => void; loading: boolean }) {
  const [headline, setHeadline] = useState(cfg("hero_headline") || "The fastest way to fix your home.");
  const [sub, setSub] = useState(cfg("hero_subheadline") || "");
  const [photo, setPhoto] = useState(cfg("hero_craftsman_photo") || "");
  const [craftsmanName, setCraftsmanName] = useState(cfg("hero_craftsman_name") || "");
  const [craftsmanTitle, setCraftsmanTitle] = useState(cfg("hero_craftsman_title") || "");
  const [statPros, setStatPros] = useState(cfg("hero_stat_pros") || "50+");
  const [statJobs, setStatJobs] = useState(cfg("hero_stat_jobs") || "1.3k");
  const [statRating, setStatRating] = useState(cfg("hero_stat_rating") || "4.8");
  const [howTitle, setHowTitle] = useState(cfg("how_it_works_title") || "");
  const [craftsmenTitle, setCraftsmenTitle] = useState(cfg("craftsmen_section_title") || "");
  const [testimonialsTitle, setTestimonialsTitle] = useState(cfg("testimonials_section_title") || "");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Type className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Hero Section</h2>
        </div>
        <Field label="Main Headline (city name will be highlighted in orange)">
          <Textarea value={headline} onChange={(e) => setHeadline(e.target.value)} rows={2} />
        </Field>
        <Field label="Subheadline">
          <Textarea value={sub} onChange={(e) => setSub(e.target.value)} rows={3} />
        </Field>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Stat — Pros (e.g. 50+)"><Input value={statPros} onChange={(e) => setStatPros(e.target.value)} /></Field>
          <Field label="Stat — Jobs Done (e.g. 1.3k)"><Input value={statJobs} onChange={(e) => setStatJobs(e.target.value)} /></Field>
          <Field label="Stat — Rating (e.g. 4.8)"><Input value={statRating} onChange={(e) => setStatRating(e.target.value)} /></Field>
        </div>
      </Card>

      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Image className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Featured Craftsman (Hero Photo Card)</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-5">
            <Field label="Craftsman Name"><Input value={craftsmanName} onChange={(e) => setCraftsmanName(e.target.value)} /></Field>
            <Field label="Craftsman Title / Specialty"><Input value={craftsmanTitle} onChange={(e) => setCraftsmanTitle(e.target.value)} /></Field>
            <Field label="Photo URL">
              <Input value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="https://..." />
              <p className="text-xs text-muted-foreground mt-1">Paste a direct image URL (Unsplash, Google Drive public link, etc.)</p>
            </Field>
          </div>
          <div>
            {photo ? (
              <div className="rounded-xl overflow-hidden aspect-[3/2] bg-muted">
                <img src={photo} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            ) : (
              <div className="rounded-xl aspect-[3/2] bg-muted flex items-center justify-center text-muted-foreground text-sm">Photo preview</div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Type className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Section Titles</h2>
        </div>
        <Field label="How It Works — Title"><Input value={howTitle} onChange={(e) => setHowTitle(e.target.value)} /></Field>
        <Field label="Craftsmen Section — Title"><Input value={craftsmenTitle} onChange={(e) => setCraftsmenTitle(e.target.value)} /></Field>
        <Field label="Testimonials Section — Title"><Input value={testimonialsTitle} onChange={(e) => setTestimonialsTitle(e.target.value)} /></Field>
      </Card>

      <div className="flex justify-end">
        <SaveBtn loading={loading} onClick={() => save({
          hero_headline: headline, hero_subheadline: sub,
          hero_craftsman_photo: photo, hero_craftsman_name: craftsmanName, hero_craftsman_title: craftsmanTitle,
          hero_stat_pros: statPros, hero_stat_jobs: statJobs, hero_stat_rating: statRating,
          how_it_works_title: howTitle, craftsmen_section_title: craftsmenTitle, testimonials_section_title: testimonialsTitle,
        })} />
      </div>
    </motion.div>
  );
}

function ServicesTab({ services, toast, qc }: { services: any[]; toast: any; qc: any }) {
  const [editing, setEditing] = useState<Record<number, string>>({});
  const [adding, setAdding] = useState(false);
  const [newSvc, setNewSvc] = useState({ category: "", name: "", description: "", avgMinPrice: 100, avgMaxPrice: 200, iconName: "wrench" });

  const saveImage = async (id: number) => {
    const url = editing[id];
    if (url === undefined) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageUrl: url }) });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: ["services"] });
      toast({ title: "Image updated" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const removeService = async (id: number) => {
    if (!confirm("Delete this service?")) return;
    try {
      await fetch(`/api/services/${id}`, { method: "DELETE" });
      qc.invalidateQueries({ queryKey: ["services"] });
      toast({ title: "Deleted" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const createService = async () => {
    if (!newSvc.category || !newSvc.name) { toast({ title: "Category and Name required", variant: "destructive" }); return; }
    try {
      const res = await fetch("/api/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newSvc) });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: ["services"] });
      setAdding(false);
      setNewSvc({ category: "", name: "", description: "", avgMinPrice: 100, avgMaxPrice: 200, iconName: "wrench" });
      toast({ title: "Service added" });
    } catch {
      toast({ title: "Failed to add", variant: "destructive" });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Manage your services and set photo URLs for the landing page cards.</p>
        <Button onClick={() => setAdding(!adding)} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Service</Button>
      </div>

      {adding && (
        <Card className="p-5 border-primary/20 bg-primary/5">
          <h3 className="font-semibold mb-4">Add New Service</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Field label="Category / Display Name (e.g. Plumbing)"><Input value={newSvc.category} onChange={(e) => setNewSvc({ ...newSvc, category: e.target.value, name: e.target.value })} /></Field>
            <Field label="Description"><Input value={newSvc.description} onChange={(e) => setNewSvc({ ...newSvc, description: e.target.value })} /></Field>
            <Field label="Min Price"><Input type="number" value={newSvc.avgMinPrice} onChange={(e) => setNewSvc({ ...newSvc, avgMinPrice: parseInt(e.target.value) || 0 })} /></Field>
            <Field label="Max Price"><Input type="number" value={newSvc.avgMaxPrice} onChange={(e) => setNewSvc({ ...newSvc, avgMaxPrice: parseInt(e.target.value) || 0 })} /></Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            <Button onClick={createService}>Save Service</Button>
          </div>
        </Card>
      )}

      {services.map((svc) => {
        const url = editing[svc.id] !== undefined ? editing[svc.id] : (svc.imageUrl ?? "");
        return (
          <Card key={svc.id} className="p-5">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-24 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                {url ? (
                  <img src={url} alt={svc.category} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">{SERVICE_ICONS[svc.iconName] ?? "🔨"}</div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-foreground">{svc.category}</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeService(svc.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-2">₹{svc.avgMinPrice.toLocaleString("en-IN")} – ₹{svc.avgMaxPrice.toLocaleString("en-IN")}</p>
                <div className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => setEditing((p) => ({ ...p, [svc.id]: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="text-sm flex-1"
                  />
                  <Button size="sm" onClick={() => saveImage(svc.id)} disabled={editing[svc.id] === undefined}>
                    <Save className="w-3.5 h-3.5 mr-1" /> Save Image
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </motion.div>
  );
}

function TestimonialsTab({ testimonials, toast, qc }: { testimonials: Testimonial[]; toast: any; qc: any }) {
  const [adding, setAdding] = useState(false);
  const [newT, setNewT] = useState({ name: "", location: "", text: "", rating: 5, avatarUrl: "" });

  const toggleActive = async (t: Testimonial) => {
    await fetch(`/api/testimonials/${t.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !t.isActive }) });
    qc.invalidateQueries({ queryKey: ["testimonials"] });
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    qc.invalidateQueries({ queryKey: ["testimonials"] });
    toast({ title: "Deleted" });
  };

  const create = async () => {
    if (!newT.name || !newT.location || !newT.text) { toast({ title: "Name, location and review are required", variant: "destructive" }); return; }
    try {
      const res = await fetch("/api/testimonials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newT, avatarUrl: newT.avatarUrl || null }) });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: ["testimonials"] });
      setAdding(false);
      setNewT({ name: "", location: "", text: "", rating: 5, avatarUrl: "" });
      toast({ title: "Testimonial added" });
    } catch {
      toast({ title: "Failed to add", variant: "destructive" });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Active testimonials show on the landing page.</p>
        <Button size="sm" onClick={() => setAdding(true)} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Testimonial
        </Button>
      </div>

      {adding && (
        <Card className="p-5 border-primary/30 bg-primary/5">
          <h3 className="font-semibold mb-4">New Testimonial</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Customer Name"><Input value={newT.name} onChange={(e) => setNewT((p) => ({ ...p, name: e.target.value }))} /></Field>
            <Field label="Location (e.g. Vijay Nagar, Indore)"><Input value={newT.location} onChange={(e) => setNewT((p) => ({ ...p, location: e.target.value }))} /></Field>
            <Field label="Avatar Image URL (optional)"><Input value={newT.avatarUrl} onChange={(e) => setNewT((p) => ({ ...p, avatarUrl: e.target.value }))} placeholder="https://..." /></Field>
            <Field label="Rating (1–5)">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setNewT((p) => ({ ...p, rating: s }))} className={`w-8 h-8 rounded-lg text-lg transition-all ${s <= newT.rating ? "text-amber-400" : "text-muted-foreground/30"}`}>
                    ★
                  </button>
                ))}
              </div>
            </Field>
            <div className="md:col-span-2">
              <Field label="Review Text">
                <Textarea value={newT.text} onChange={(e) => setNewT((p) => ({ ...p, text: e.target.value }))} rows={3} placeholder="What the customer said…" />
              </Field>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={create}>Add Testimonial</Button>
            <Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {testimonials.map((t) => (
        <Card key={t.id} className={`p-5 ${!t.isActive ? "opacity-60" : ""}`}>
          <div className="flex gap-4 items-start">
            {t.avatarUrl ? (
              <img src={t.avatarUrl} alt={t.name} className="w-10 h-10 rounded-full object-cover bg-muted shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">{t.name.charAt(0)}</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-sm text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">· {t.location}</p>
                <div className="flex gap-0.5 ml-1">
                  {[1, 2, 3, 4, 5].map((s) => <span key={s} className={`text-xs ${s <= t.rating ? "text-amber-400" : "text-muted-foreground/30"}`}>★</span>)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed truncate">"{t.text}"</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{t.isActive ? "Visible" : "Hidden"}</span>
                <Switch checked={t.isActive} onCheckedChange={() => toggleActive(t)} />
              </div>
              <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0" onClick={() => remove(t.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {testimonials.length === 0 && !adding && (
        <div className="text-center py-12 text-muted-foreground">No testimonials yet. Add your first one above.</div>
      )}
    </motion.div>
  );
}

function PricingTab({ cfg, save, loading }: { cfg: (k: string) => string; save: (u: Config) => void; loading: boolean }) {
  const [odLabel, setOdLabel] = useState(cfg("pricing_on_demand_label") || "On Demand");
  const [stdLabel, setStdLabel] = useState(cfg("pricing_amc_standard_label") || "AMC Standard");
  const [stdPrice, setStdPrice] = useState(cfg("pricing_amc_standard_price") || "1999");
  const [premLabel, setPremLabel] = useState(cfg("pricing_amc_premium_label") || "AMC Premium");
  const [premPrice, setPremPrice] = useState(cfg("pricing_amc_premium_price") || "2999");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card className="p-6 space-y-5">
        <h2 className="font-semibold">Pricing Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">On Demand</p>
            <Field label="Plan Label"><Input value={odLabel} onChange={(e) => setOdLabel(e.target.value)} /></Field>
            <p className="text-xs text-muted-foreground">Price is always "Free" for on-demand</p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-primary uppercase tracking-wide">AMC Standard</p>
            <Field label="Plan Label"><Input value={stdLabel} onChange={(e) => setStdLabel(e.target.value)} /></Field>
            <Field label="Annual Price (₹)"><Input value={stdPrice} onChange={(e) => setStdPrice(e.target.value)} type="number" /></Field>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-[#8A6A35] uppercase tracking-wide">AMC Premium</p>
            <Field label="Plan Label"><Input value={premLabel} onChange={(e) => setPremLabel(e.target.value)} /></Field>
            <Field label="Annual Price (₹)"><Input value={premPrice} onChange={(e) => setPremPrice(e.target.value)} type="number" /></Field>
          </div>
        </div>
      </Card>
      <div className="flex justify-end">
        <SaveBtn loading={loading} onClick={() => save({
          pricing_on_demand_label: odLabel,
          pricing_amc_standard_label: stdLabel, pricing_amc_standard_price: stdPrice,
          pricing_amc_premium_label: premLabel, pricing_amc_premium_price: premPrice,
        })} />
      </div>
    </motion.div>
  );
}
