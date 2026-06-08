import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Star, ArrowRight, Phone, CheckCircle, MessageCircle, Shield, Zap, Clock, BadgeCheck, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Nav from "@/components/nav";
import { useListServices, useListCraftsmen } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { useCity, CITIES } from "@/context/CityContext";
import { useLocation } from "wouter";

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };

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

const HOW_IT_WORKS = [
  { num: "01", title: "Tell us what you need", desc: "Pick a category or tell us on WhatsApp — in Hindi or English." },
  { num: "02", title: "We match a verified pro", desc: "Every craftsman is background-checked and rated by real customers." },
  { num: "03", title: "Pay only when it's done", desc: "Transparent pricing. No surprises. Pay after you're satisfied." },
];

const PRICING_FEATURES = {
  onDemand: ["Book any service anytime", "Pay per visit", "No hidden charges", "30-min confirmation"],
  standard: ["10 free visits/year", "Priority booking", "10% off all services", "Dedicated support number"],
  premium: ["Unlimited visits", "Same-day guarantee", "20% off all services", "Emergency 24/7 support", "Annual home inspection"],
};

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sz = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${sz} ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

function ServiceCard({ service }: { service: any }) {
  const icon = SERVICE_ICONS[service.iconName] ?? "🔨";
  const description = service.description || "Verified help for repairs, installation, and routine home work.";

  return (
    <Link href={`/book?service=${encodeURIComponent(service.category)}`}>
      <div className="group h-full rounded-xl border border-[#EDE8E0] bg-[#FAF8F4] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-white hover:shadow-md cursor-pointer">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#E8DFD0] text-2xl transition-colors group-hover:bg-primary/10">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-[#1A1209] text-sm leading-tight group-hover:text-primary transition-colors">{service.category}</h3>
              <ArrowRight className="h-4 w-4 shrink-0 text-[#B8A894] transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#6F6254]">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Landing() {
  const { city, setCity } = useCity();
  const [, navigate] = useLocation();
  const { data: services } = useListServices();
  const { data: craftsmen } = useListCraftsmen({ city: city?.name });
  const { data: config } = useQuery<Record<string, string>>({
    queryKey: ["site-config"],
    queryFn: () => fetch("/api/site-config").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });
  const { data: testimonials } = useQuery<any[]>({
    queryKey: ["testimonials"],
    queryFn: () => fetch("/api/testimonials").then((r) => r.json()),
  });

  const cfg = (key: string, fallback: string) => config?.[key] ?? fallback;
  const allServices = services ?? FALLBACK_SERVICES;
  const topCraftsmen = (craftsmen ?? []).filter((c) => c.isVerified).slice(0, 3);
  const activeTestimonials = (testimonials ?? []).filter((t) => t.isActive);
  const heroPhoto = cfg("hero_craftsman_photo", "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80");
  const cityName = city?.name ?? "your city";

  return (
    <div className="min-h-screen bg-[#FAF8F4] font-sans">
      <Nav />

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.p variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
              {city ? `${city.name} · ` : ""}Home Services
            </motion.p>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1209] leading-[1.1] mb-5">
              {city
                ? <>The fastest way to fix your home in <span className="text-primary">{city.name}</span>.</>
                : <>{cfg("hero_headline", "The fastest way to fix your home.")}</>
              }
            </motion.h1>
            <motion.p variants={fadeUp} className="text-base text-[#5C5043] leading-relaxed mb-8 max-w-md">
              {cfg("hero_subheadline", "Verified plumbers, electricians, carpenters & more — dispatched to your door in hours. Fair prices, real reviews, a no-drain guarantee.")}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-8">
              <Link href="/book">
                <Button size="lg" className="bg-primary text-white h-12 px-7 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90">
                  Book on call
                </Button>
              </Link>
              <a href={`https://wa.me/${cfg("company_whatsapp", "917777777777")}`} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-[#D4C5B0] text-[#1A1209] h-12 px-7 text-base font-semibold rounded-xl hover:bg-[#F0EBE1]">
                  <MessageCircle className="mr-2 w-4 h-4 text-green-600" />
                  WhatsApp Us
                </Button>
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-center gap-7">
              <div>
                <p className="text-2xl font-bold text-[#1A1209]">{cfg("hero_stat_pros", "50+")} <span className="text-base font-normal text-[#5C5043]">pros</span></p>
              </div>
              <div className="w-px h-8 bg-[#D4C5B0]" />
              <div>
                <p className="text-2xl font-bold text-[#1A1209]">{cfg("hero_stat_jobs", "1.3k")} <span className="text-base font-normal text-[#5C5043]">jobs done</span></p>
              </div>
              <div className="w-px h-8 bg-[#D4C5B0]" />
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-[#1A1209]">{cfg("hero_stat_rating", "4.8")}</p>
                <StarRating rating={Number(cfg("hero_stat_rating", "4.8"))} size="md" />
              </div>
            </motion.div>
          </motion.div>

          {/* Right — craftsman photo card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative hidden md:block">
            <div className="relative rounded-3xl overflow-hidden h-[440px] bg-[#E8DFD0] shadow-2xl">
              <img
                src={heroPhoto}
                alt={cfg("hero_craftsman_name", "Craftsman")}
                className="w-full h-full object-cover object-center"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              {/* Name card overlay */}
              <div className="absolute bottom-5 left-5 right-5 bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-lg">
                <div>
                  <p className="font-bold text-[#1A1209]">{cfg("hero_craftsman_name", "Ramesh Sharma")}</p>
                  <p className="text-sm text-[#5C5043]">{cfg("hero_craftsman_title", "Master Plumber")}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StarRating rating={4.8} />
                  <p className="text-xs text-[#5C5043]">4.8 · 142 jobs</p>
                </div>
              </div>
              {/* Verified badge */}
              <div className="absolute top-5 right-5 bg-white rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md">
                <BadgeCheck className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-[#1A1209]">Verified Pro</span>
              </div>
            </div>
            {/* Decorative dot */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-primary/10 -z-10" />
            <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-amber-100 -z-10" />
          </motion.div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Our Services</p>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1A1209]">Every fix your home<br />will ever ask for.</h2>
              </div>
              <Link href="/book">
                <Button variant="outline" className="w-fit border-[#D4C5B0] text-[#1A1209] hover:bg-[#F0EBE1]">
                  View booking flow <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
            <motion.div variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allServices.map((service) => (
                <motion.div key={service.id} variants={fadeUp}>
                  <ServiceCard service={service} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-[#2C1F0E] py-20 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="mb-12">
              <p className="text-sm font-semibold text-primary/80 uppercase tracking-widest mb-3">How It Works</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white max-w-lg leading-tight">
                {cfg("how_it_works_title", "Three steps. No phone calls to ten different people.")}
              </h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-10">
              {HOW_IT_WORKS.map((step) => (
                <motion.div key={step.num} variants={fadeUp}>
                  <p className="text-5xl font-black text-primary/30 mb-4 leading-none">{step.num}</p>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-[#C4B49A] text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CRAFTSMEN ── */}
      {topCraftsmen.length > 0 && (
        <section className="py-20 bg-[#FAF8F4]">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              <motion.div variants={fadeUp} className="mb-10">
                <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Our Professionals</p>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1A1209] max-w-md leading-tight">
                  {city
                    ? `Real pros. Verified skills. Right here in ${city.name}.`
                    : cfg("craftsmen_section_title", "Real pros. Verified skills. At your door.")
                  }
                </h2>
              </motion.div>
              <div className="grid md:grid-cols-3 gap-6">
                {topCraftsmen.map((c) => (
                  <motion.div key={c.id} variants={fadeUp}>
                    <Card className="overflow-hidden border-[#EDE8E0] hover:shadow-lg transition-all duration-200 bg-white">
                      <div className="h-52 bg-[#E8DFD0] overflow-hidden">
                        {c.photoUrl ? (
                          <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover object-top" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-primary/30">{c.name.charAt(0)}</div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3 className="font-bold text-[#1A1209]">{c.name}</h3>
                            <p className="text-xs text-[#8A7A68]">{c.skills.slice(0, 2).join(" · ")}</p>
                          </div>
                          {c.isVerified && (
                            <div className="flex items-center gap-1 bg-green-50 text-green-700 rounded-full px-2 py-0.5">
                              <CheckCircle className="w-3 h-3" />
                              <span className="text-[10px] font-semibold">Verified</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <StarRating rating={c.rating} />
                          <span className="text-sm font-semibold text-[#1A1209]">{c.rating.toFixed(1)}</span>
                          <span className="text-xs text-[#8A7A68]">· {c.totalJobs} jobs</span>
                        </div>
                        <p className="text-xs text-[#8A7A68] mt-1">{c.experience} yrs experience</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      {activeTestimonials.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              <motion.div variants={fadeUp} className="mb-10">
                <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Customer Stories</p>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1A1209]">
                  {cfg("testimonials_section_title", "Trusted by 5,000+ households across India.")}
                </h2>
              </motion.div>
              <div className="grid md:grid-cols-3 gap-5">
                {activeTestimonials.map((t) => (
                  <motion.div key={t.id} variants={fadeUp}>
                    <Card className="p-6 border-[#EDE8E0] hover:shadow-md transition-all duration-200 bg-[#FAF8F4] flex flex-col gap-4 h-full">
                      <StarRating rating={t.rating} size="md" />
                      <p className="text-sm text-[#3D3020] leading-relaxed flex-1">"{t.text}"</p>
                      <div className="flex items-center gap-3 pt-2 border-t border-[#EDE8E0]">
                        {t.avatarUrl ? (
                          <img src={t.avatarUrl} alt={t.name} className="w-9 h-9 rounded-full object-cover bg-[#E8DFD0]" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{t.name.charAt(0)}</div>
                        )}
                        <div>
                          <p className="font-semibold text-sm text-[#1A1209]">{t.name}</p>
                          <p className="text-xs text-[#8A7A68]">{t.location}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── PRICING ── */}
      <section className="py-20 bg-[#FAF8F4]">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="mb-12 text-center">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Pricing</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1209]">Pay per job, or save with an AMC.</h2>
              <p className="text-[#5C5043] mt-2 text-base">Basic visit pricing starts around ₹100-₹200. Final job cost is confirmed after inspection.</p>
            </motion.div>
            <motion.div variants={stagger} className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {/* On Demand */}
              <motion.div variants={fadeUp}>
                <Card className="p-6 border-[#EDE8E0] bg-white h-full flex flex-col">
                  <p className="text-xs font-bold text-[#8A7A68] uppercase tracking-wider mb-1">{cfg("pricing_on_demand_label", "On Demand")}</p>
                  <p className="text-3xl font-black text-[#1A1209] mb-1">Free</p>
                  <p className="text-sm text-[#8A7A68] mb-5">No subscription needed</p>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {PRICING_FEATURES.onDemand.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-[#3D3020]">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/book">
                    <Button variant="outline" className="w-full border-primary text-primary rounded-xl hover:bg-primary/5">Book a Service</Button>
                  </Link>
                </Card>
              </motion.div>
              {/* AMC Standard */}
              <motion.div variants={fadeUp}>
                <Card className="p-6 border-primary/40 bg-white h-full flex flex-col relative shadow-lg shadow-primary/10">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-white text-xs px-3">Most Popular</Badge>
                  </div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{cfg("pricing_amc_standard_label", "AMC Standard")}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <p className="text-3xl font-black text-[#1A1209]">₹{Number(cfg("pricing_amc_standard_price", "1999")).toLocaleString("en-IN")}</p>
                    <span className="text-sm text-[#8A7A68]">/year</span>
                  </div>
                  <p className="text-sm text-[#8A7A68] mb-5">Best for homeowners</p>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {PRICING_FEATURES.standard.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-[#3D3020]">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href={`https://wa.me/${cfg("company_whatsapp", "917777777777")}?text=I%20want%20AMC%20Standard`} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-primary text-white rounded-xl hover:bg-primary/90">Get AMC Standard</Button>
                  </a>
                </Card>
              </motion.div>
              {/* AMC Premium */}
              <motion.div variants={fadeUp}>
                <Card className="p-6 border-[#EDE8E0] bg-[#2C1F0E] h-full flex flex-col">
                  <p className="text-xs font-bold text-primary/80 uppercase tracking-wider mb-1">{cfg("pricing_amc_premium_label", "AMC Premium")}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <p className="text-3xl font-black text-white">₹{Number(cfg("pricing_amc_premium_price", "2999")).toLocaleString("en-IN")}</p>
                    <span className="text-sm text-[#9C8C7A]">/year</span>
                  </div>
                  <p className="text-sm text-[#9C8C7A] mb-5">For landlords & large homes</p>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {PRICING_FEATURES.premium.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-[#D4C5B0]">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href={`https://wa.me/${cfg("company_whatsapp", "917777777777")}?text=I%20want%20AMC%20Premium`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full border-[#5C4A35] text-white hover:bg-white/10 rounded-xl">Get AMC Premium</Button>
                  </a>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-white py-20 border-t border-[#EDE8E0]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              <motion.p variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Get Started</motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-[#1A1209] mb-3">Tell us what's broken.<br />We'll handle the rest.</motion.h2>
              <motion.p variants={fadeUp} className="text-[#5C5043] mb-6">Fill in a quick form or send us a WhatsApp — we'll assign a pro within 30 minutes.</motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-8">
                {["Plumbing", "Electrical", "Carpentry", "Painting", "AC Service", "Cleaning"].map((tag) => (
                  <Link key={tag} href={`/book?service=${tag}`}>
                    <Badge variant="outline" className="border-[#D4C5B0] text-[#5C5043] hover:border-primary hover:text-primary cursor-pointer transition-colors px-3 py-1">{tag}</Badge>
                  </Link>
                ))}
              </motion.div>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <Link href="/book">
                  <Button size="lg" className="bg-primary text-white h-12 px-7 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90">
                    Book a Pro <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <a href={`tel:${cfg("company_phone", "+91 93998 58706").replace(/\s/g, "")}`}>
                  <Button size="lg" variant="outline" className="border-[#D4C5B0] text-[#1A1209] h-12 px-7 rounded-xl font-semibold hover:bg-[#F0EBE1]">
                    <Phone className="mr-2 w-4 h-4" />
                    {cfg("company_phone", "+91 93998 58706")}
                  </Button>
                </a>
              </motion.div>
            </motion.div>

            {/* Trust badges */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: "Verified Pros", desc: "Background-checked before joining" },
                { icon: Zap, title: "30-min Confirm", desc: "Fast dispatch, no waiting" },
                { icon: Clock, title: "Same-Day", desc: "Book by 12 PM, done today" },
                { icon: Star, title: "Satisfaction", desc: "Re-do if not satisfied, free" },
              ].map((f) => (
                <div key={f.title} className="bg-[#FAF8F4] rounded-2xl p-5 border border-[#EDE8E0]">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <f.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <p className="font-bold text-sm text-[#1A1209] mb-0.5">{f.title}</p>
                  <p className="text-xs text-[#8A7A68] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CITIES ── */}
      <section className="py-16 bg-white border-t border-[#EDE8E0]">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="mb-8">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">We're Expanding</p>
              <h2 className="text-3xl font-bold text-[#1A1209]">Now serving 10 cities across India.</h2>
              <p className="text-[#5C5043] mt-2 text-sm">Pick your city for local pros and faster service.</p>
            </motion.div>
            <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {CITIES.map((c) => (
                <motion.button
                  key={c.slug}
                  variants={fadeUp}
                  onClick={() => { setCity(c); navigate(`/city/${c.slug}`); }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 hover:shadow-md ${city?.slug === c.slug ? "border-primary bg-primary/5 text-primary" : "border-[#EDE8E0] bg-[#FAF8F4] text-[#1A1209] hover:border-primary/40 hover:bg-white"}`}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{c.name}</span>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 bg-[#FAF8F4] border-t border-[#EDE8E0]">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="mb-8 text-center">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Got Questions?</p>
              <h2 className="text-3xl font-bold text-[#1A1209]">Frequently asked questions</h2>
            </motion.div>
            <motion.div variants={stagger} className="space-y-2">
              {FAQ_ITEMS.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#2C1F0E] text-[#C4B49A] py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 font-bold text-xl text-white mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-white text-xs font-black">SF</span>
                </div>
                {cfg("company_name", "SnapFix")}
              </div>
              <p className="text-sm text-[#9A8A78] leading-relaxed">{cfg("company_tagline", "Book a Fix in a Snap")}</p>
              <p className="text-sm text-[#9A8A78] mt-2">{cfg("company_phone", "+91 77777 77777")}</p>
            </div>
            {/* Services */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6A58] mb-3">Services</p>
              <div className="space-y-2 text-sm">
                <Link href="/book" className="block hover:text-white transition-colors">Book a Service</Link>
                <Link href="/bookings" className="block hover:text-white transition-colors">My Bookings</Link>
                <Link href="/join" className="block hover:text-white transition-colors">Join as a Pro</Link>
              </div>
            </div>
            {/* Cities */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6A58] mb-3">Cities</p>
              <div className="space-y-2 text-sm">
                {CITIES.slice(0, 5).map((c) => (
                  <Link key={c.slug} href={`/city/${c.slug}`} className="block hover:text-white transition-colors">{c.name}</Link>
                ))}
              </div>
            </div>
            {/* Legal */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6A58] mb-3">Legal</p>
              <div className="space-y-2 text-sm">
                <Link href="/terms" className="block hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="block hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/refund" className="block hover:text-white transition-colors">Refund Policy</Link>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#7A6A58]">
            <p>© {new Date().getFullYear()} {cfg("company_name", "SnapFix")}. All rights reserved.</p>
            <p>Serving 10 cities across India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FAQ_ITEMS = [
  {
    q: "How does SnapFix work?",
    a: "Three steps: pick a service and share your address and preferred time → we match you with a nearby verified pro → they visit your home, complete the work, and you pay cash only when you're satisfied.",
  },
  {
    q: "Are your professionals verified?",
    a: "Yes. Every SnapFix professional goes through identity verification, a skill assessment, and reference checks before going live. We also track ratings from every completed job.",
  },
  {
    q: "How much do home services cost?",
    a: "Visit charges start at ₹100–₹200. The final cost depends on the scope of work and you'll get a clear estimate before anything starts. No hidden fees — ever.",
  },
  {
    q: "How quickly can I get help?",
    a: "Most bookings are confirmed within 30 minutes. Same-day visits are available in all our cities. Urgent issues like active leaks or electrical faults are prioritised.",
  },
  {
    q: "Which cities do you serve?",
    a: "We're live in 10 cities: Indore, Bhopal, Jaipur, Lucknow, Nagpur, Mumbai, Pune, Delhi, Bangalore, and Hyderabad — with more launching soon.",
  },
  {
    q: "How do I pay?",
    a: "Cash on completion, paid directly to the professional after the job is done. No upfront charges, no platform fee.",
  },
  {
    q: "What if I'm not satisfied?",
    a: "Contact us immediately and we'll send the professional back at no charge — or dispatch a replacement. You never pay for work you're not happy with.",
  },
  {
    q: "How do I become a SnapFix professional?",
    a: "Go to snapfix.pro/join and submit your details. Our team reviews applications and verified pros start receiving job requests within a few days.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
      className="border border-[#EDE8E0] rounded-xl bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-[#1A1209] hover:bg-[#FAF8F4] transition-colors"
        aria-expanded={open}
      >
        <span>{q}</span>
        <ChevronDown className={`w-4 h-4 text-[#8A7A68] shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-[#5C5043] leading-relaxed border-t border-[#EDE8E0] pt-3">
          {a}
        </div>
      )}
    </motion.div>
  );
}

const FALLBACK_SERVICES = [
  { id: 1, category: "Plumbing", description: "Tap leaks, pipe fittings, bathroom fixtures, and drain issues.", iconName: "wrench", avgMinPrice: 100, avgMaxPrice: 200, priority: "P0", imageUrl: null },
  { id: 2, category: "Carpentry", description: "Door repair, furniture fixes, shelves, cabinets, and fittings.", iconName: "hammer", avgMinPrice: 100, avgMaxPrice: 200, priority: "P0", imageUrl: null },
  { id: 3, category: "Electrical", description: "Switchboards, wiring checks, fan fitting, and basic repairs.", iconName: "zap", avgMinPrice: 100, avgMaxPrice: 200, priority: "P0", imageUrl: null },
  { id: 4, category: "Painting", description: "Touch-ups, wall patches, waterproofing checks, and repaint work.", iconName: "paint", avgMinPrice: 100, avgMaxPrice: 200, priority: "P0", imageUrl: null },
];
