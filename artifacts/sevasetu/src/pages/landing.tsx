import { Link } from "wouter";
import { motion } from "framer-motion";
import { Wrench, Zap, Shield, Star, ArrowRight, Phone, CheckCircle, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Nav from "@/components/nav";
import { useListServices, useListCraftsmen } from "@workspace/api-client-react";

const SERVICE_ICONS: Record<string, string> = {
  wrench: "🔧", zap: "⚡", paint: "🖌️", hammer: "🔨", wind: "❄️", sparkles: "✨", bug: "🛡️", camera: "📷"
};

const FEATURES = [
  { icon: Shield, title: "Verified Professionals", desc: "Every craftsman is background-checked and skill-verified before joining." },
  { icon: Clock, title: "Same-Day Service", desc: "Book by 12 PM and get your job done the same day in most cases." },
  { icon: Star, title: "Quality Guarantee", desc: "Not satisfied? We'll re-do the job within 48 hours, no questions asked." },
  { icon: Zap, title: "Fast Confirmation", desc: "Receive a confirmed booking within 30 minutes of your inquiry." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Choose a Service", desc: "Select from our catalogue of trusted home services." },
  { step: "02", title: "Book a Slot", desc: "Pick your date, time, and describe the job — takes 2 minutes." },
  { step: "03", title: "Get Confirmed", desc: "We assign the right professional and confirm within 30 minutes." },
  { step: "04", title: "Job Done Right", desc: "Your craftsman arrives on time. Pay after the work is complete." },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", location: "Vijay Nagar, Indore", text: "Got a plumber in under 2 hours. The work was clean and the price was exactly as quoted. Will definitely use again.", rating: 5 },
  { name: "Mr. Verma", location: "New Palasia, Indore", text: "Finally a reliable service for my rental properties. The team is professional and always on time. Best decision.", rating: 5 },
  { name: "Anjali Mehta", location: "Scheme 54, Indore", text: "Booked a carpenter for wardrobe repairs. Suresh ji was excellent — skilled, polite, and done in 3 hours flat.", rating: 5 },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function Landing() {
  const { data: services } = useListServices();
  const { data: craftsmen } = useListCraftsmen();

  const p0Services = services?.filter((s) => s.priority === "P0") ?? [];
  const topCraftsmen = craftsmen?.filter((c) => c.isVerified).slice(0, 3) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 to-primary pt-20 pb-32">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp}>
              <Badge className="mb-6 bg-white/20 text-white border-white/30 text-sm px-4 py-1.5">
                Serving Indore — Trusted by 1,000+ families
              </Badge>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              Bharosemand Karigar,<br />
              <span className="text-white/80">Ek Call Par</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Trusted craftsmen for plumbing, carpentry, electrical work, and more — verified, background-checked, and dispatched within hours.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold text-base px-8 h-14 shadow-xl">
                  Book a Service
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <a href="https://wa.me/917777777777" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-semibold text-base px-8 h-14">
                  <MessageCircle className="mr-2 w-4 h-4" />
                  WhatsApp Us
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "ellipse(60% 100% at 50% 100%)" }} />
      </section>

      {/* Services Grid */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-accent">Our Services</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Whatever Your Home Needs</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">From a dripping tap to a full room repaint — we have a skilled professional for every job.</p>
          </motion.div>
          <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(p0Services.length > 0 ? p0Services : FALLBACK_SERVICES).map((service) => (
              <motion.div key={service.id} variants={fadeUp}>
                <Link href={`/book?service=${encodeURIComponent(service.category)}`}>
                  <Card className="p-5 text-center cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200 group h-full">
                    <div className="text-4xl mb-3">{SERVICE_ICONS[service.iconName] ?? "🔨"}</div>
                    <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">{service.category}</h3>
                    <p className="text-xs text-muted-foreground">₹{service.avgMinPrice.toLocaleString("en-IN")} – ₹{service.avgMaxPrice.toLocaleString("en-IN")}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/40 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-accent">Simple Process</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">How SevaSetu Works</h2>
              <p className="text-muted-foreground text-lg">Book in minutes. Done in hours.</p>
            </motion.div>
            <div className="grid md:grid-cols-4 gap-8">
              {HOW_IT_WORKS.map((step) => (
                <motion.div key={step.step} variants={fadeUp} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary font-bold text-lg">{step.step}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-accent">Why SevaSetu</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Built on Trust, Delivered with Care</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={fadeUp}>
                <Card className="p-6 flex gap-4 items-start hover:shadow-md transition-all duration-200 border-border/60">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Craftsmen */}
      {topCraftsmen.length > 0 && (
        <section className="bg-muted/40 py-20">
          <div className="max-w-5xl mx-auto px-4">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              <motion.div variants={fadeUp} className="text-center mb-12">
                <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-accent">Our Professionals</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Meet Our Verified Craftsmen</h2>
                <p className="text-muted-foreground text-lg">Background-checked, skilled, and ready to serve.</p>
              </motion.div>
              <div className="grid md:grid-cols-3 gap-6">
                {topCraftsmen.map((c) => (
                  <motion.div key={c.id} variants={fadeUp}>
                    <Card className="p-6 text-center hover:shadow-md transition-all duration-200">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                        {c.name.charAt(0)}
                      </div>
                      <h3 className="font-semibold text-foreground">{c.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{c.skills.join(", ")}</p>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(c.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">{c.rating.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.totalJobs} jobs completed</p>
                      {c.isVerified && (
                        <Badge className="mt-3 bg-green-100 text-green-700 border-green-200 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-accent">Customer Stories</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">What Indore Families Say</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <motion.div key={t.name} variants={fadeUp}>
                <Card className="p-6 hover:shadow-md transition-all duration-200 flex flex-col gap-4">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed italic">"{t.text}"</p>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your Home Deserves the Best
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/80 text-lg mb-8">
              Join 1,000+ families in Indore who trust SevaSetu for every home service need.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8 h-12">
                  Book Now — It's Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <a href="tel:+917777777777">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-semibold px-8 h-12">
                  <Phone className="mr-2 w-4 h-4" />
                  Call Us
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-lg text-primary">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Wrench className="w-3.5 h-3.5 text-white" />
              </div>
              SevaSetu
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Connecting Indore homes with trusted local craftsmen.<br />
              Serving Indore, Madhya Pradesh — Phase 1
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="/book"><a className="hover:text-primary transition-colors">Book</a></Link>
              <Link href="/bookings"><a className="hover:text-primary transition-colors">Bookings</a></Link>
              <Link href="/admin"><a className="hover:text-primary transition-colors">Admin</a></Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            © 2025 SevaSetu. All rights reserved. Bharosemand Karigar, Ek Call Par.
          </div>
        </div>
      </footer>
    </div>
  );
}

const FALLBACK_SERVICES = [
  { id: 1, category: "Plumbing", iconName: "wrench", avgMinPrice: 500, avgMaxPrice: 2000, priority: "P0" },
  { id: 2, category: "Carpentry", iconName: "hammer", avgMinPrice: 800, avgMaxPrice: 5000, priority: "P0" },
  { id: 3, category: "Electrical", iconName: "zap", avgMinPrice: 400, avgMaxPrice: 3000, priority: "P0" },
  { id: 4, category: "Painting", iconName: "paint", avgMinPrice: 5000, avgMaxPrice: 40000, priority: "P0" },
];
