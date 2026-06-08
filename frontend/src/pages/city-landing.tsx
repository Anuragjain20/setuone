import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { Star, ArrowRight, CheckCircle, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Nav from "@/components/nav";
import { useListCraftsmen, useListServices } from "@/api";
import { useCity, CITIES } from "@/context/CityContext";

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const SERVICE_ICONS: Record<string, string> = {
  wrench: "🔧", zap: "⚡", paint: "🎨", hammer: "🔨", wind: "❄️", sparkles: "✨",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

export default function CityLanding() {
  const { slug } = useParams<{ slug: string }>();
  const { setCity, city } = useCity();
  const cityData = CITIES.find((c) => c.slug === slug);
  const { data: craftsmen } = useListCraftsmen({ city: cityData?.name });
  const { data: services } = useListServices();

  useEffect(() => {
    if (cityData && city?.slug !== cityData.slug) {
      setCity(cityData);
    }
    if (cityData) {
      document.title = `Home Services in ${cityData.name} | SnapFix — Verified Plumbers, Electricians & More`;

      // Update meta description
      let metaDesc = document.querySelector("meta[name='description']");
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", `Book verified plumbers, electricians, carpenters, and home service professionals in ${cityData.name}, ${cityData.state}. Same-day visits. Pay cash on completion. Starting ₹100.`);

      // Update canonical URL
      let canonical = document.querySelector("link[rel='canonical']");
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", `https://snapfix.pro/city/${cityData.slug}`);
    }
    return () => {
      // Restore default canonical and title on unmount
      const canonical = document.querySelector("link[rel='canonical']");
      if (canonical) canonical.setAttribute("href", "https://snapfix.pro/");
      const metaDesc = document.querySelector("meta[name='description']");
      if (metaDesc) metaDesc.setAttribute("content", "SnapFix connects you with verified home service professionals across India — plumbers, electricians, carpenters, painters and more. Book in 2 minutes. Confirmed within 30 minutes.");
    };
  }, [slug, cityData]);

  if (!cityData) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <Nav />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-[#1A1209] mb-3">City Not Found</h1>
          <p className="text-[#5C5043] mb-6">We don't serve this city yet — but we're expanding fast!</p>
          <Link href="/"><Button>Back to Home</Button></Link>
        </div>
      </div>
    );
  }

  const verifiedPros = (craftsmen ?? []).filter((c) => c.isVerified);
  const topPros = verifiedPros.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <Nav />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-14 pb-16">
        <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-2xl">
          <motion.p variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> {cityData.name}, {cityData.state}
          </motion.p>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-[#1A1209] leading-tight mb-4">
            Home Services in <span className="text-primary">{cityData.name}</span> — Book in a Snap.
          </motion.h1>
          <motion.p variants={fadeUp} className="text-[#5C5043] text-base leading-relaxed mb-8 max-w-lg">
            Verified plumbers, electricians, carpenters & more in {cityData.name}. Dispatched to your door in hours. Fair prices, real reviews, satisfaction guaranteed.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
            <Link href="/book">
              <Button size="lg" className="bg-primary text-white h-12 px-7 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90">
                Book in {cityData.name} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <a href="https://wa.me/917777777777" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-[#D4C5B0] text-[#1A1209] h-12 px-7 rounded-xl font-semibold hover:bg-[#F0EBE1]">
                <Phone className="mr-2 w-4 h-4" /> WhatsApp Us
              </Button>
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Services */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="mb-7">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Services in {cityData.name}</p>
              <h2 className="text-3xl font-bold text-[#1A1209]">Every fix your home will ever need.</h2>
            </motion.div>
            <motion.div variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(services ?? []).slice(0, 6).map((service) => (
                <motion.div key={service.id} variants={fadeUp}>
                  <Link href={`/book?service=${encodeURIComponent(service.category)}`}>
                    <div className="group rounded-xl border border-[#EDE8E0] bg-[#FAF8F4] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{SERVICE_ICONS[service.iconName] ?? "🔨"}</div>
                        <div>
                          <h3 className="font-semibold text-sm text-[#1A1209] group-hover:text-primary transition-colors">{service.category}</h3>
                          <p className="text-xs text-[#8A7A68]">From ₹{service.avgMinPrice}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 ml-auto text-[#B8A894] group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Local Pros */}
      {topPros.length > 0 && (
        <section className="py-14 bg-[#FAF8F4]">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              <motion.div variants={fadeUp} className="mb-8">
                <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Local Professionals</p>
                <h2 className="text-3xl font-bold text-[#1A1209]">Verified pros in {cityData.name}.</h2>
              </motion.div>
              <div className="grid md:grid-cols-3 gap-5">
                {topPros.map((c) => (
                  <motion.div key={c.id} variants={fadeUp}>
                    <Card className="overflow-hidden border-[#EDE8E0] hover:shadow-lg transition-all duration-200 bg-white">
                      <div className="h-44 bg-[#E8DFD0] flex items-center justify-center overflow-hidden">
                        {c.photoUrl
                          ? <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          : <div className="text-5xl font-bold text-primary/30">{c.name.charAt(0)}</div>
                        }
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3 className="font-bold text-[#1A1209]">{c.name}</h3>
                            <p className="text-xs text-[#8A7A68]">{c.skills.slice(0, 2).join(" · ")}</p>
                          </div>
                          {c.isVerified && (
                            <span className="flex items-center gap-1 bg-green-50 text-green-700 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                              <CheckCircle className="w-3 h-3" /> Verified
                            </span>
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

      {/* Areas */}
      <section className="py-14 bg-white border-t border-[#EDE8E0]">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="mb-6">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Coverage</p>
              <h2 className="text-2xl font-bold text-[#1A1209]">Areas we serve in {cityData.name}</h2>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
              {cityData.areas.map((area) => (
                <Badge key={area} variant="outline" className="border-[#D4C5B0] text-[#5C5043] px-3 py-1.5">
                  {area}
                </Badge>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#2C1F0E]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to book in {cityData.name}?</h2>
          <p className="text-[#C4B49A] mb-7">Fill a 2-minute form — we'll assign a verified pro within 30 minutes.</p>
          <Link href="/book">
            <Button size="lg" className="bg-primary text-white h-12 px-10 rounded-xl font-semibold hover:bg-primary/90 text-base">
              Book Now — It's Free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
