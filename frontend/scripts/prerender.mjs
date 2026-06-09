/**
 * Post-build prerender script.
 * Generates per-route static HTML files with correct meta tags so Google
 * sees city-specific titles, descriptions, and structured data on first crawl —
 * before React hydrates.
 *
 * Run automatically via: npm run build
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "../dist");
const template = readFileSync(join(distDir, "index.html"), "utf-8");

const CITIES = [
  { slug: "indore",    name: "Indore",     state: "Madhya Pradesh" },
  { slug: "bhopal",    name: "Bhopal",     state: "Madhya Pradesh" },
  { slug: "jaipur",    name: "Jaipur",     state: "Rajasthan" },
  { slug: "lucknow",   name: "Lucknow",    state: "Uttar Pradesh" },
  { slug: "nagpur",    name: "Nagpur",     state: "Maharashtra" },
  { slug: "mumbai",    name: "Mumbai",     state: "Maharashtra" },
  { slug: "pune",      name: "Pune",       state: "Maharashtra" },
  { slug: "delhi",     name: "Delhi",      state: "Delhi" },
  { slug: "bangalore", name: "Bangalore",  state: "Karnataka" },
  { slug: "hyderabad", name: "Hyderabad",  state: "Telangana" },
];

const SERVICES = [
  "Plumbing", "Electrical", "Carpentry", "Painting",
  "AC Service", "Home Cleaning", "Flooring",
];

function escape(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function injectMeta(html, { title, description, canonical, ogTitle, ogDescription, ogUrl, extraSchema }) {
  let out = html;

  out = out.replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`);

  out = out.replace(
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    `$1${escape(description)}$2`
  );
  out = out.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
    `$1${escape(canonical)}$2`
  );
  out = out.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/,       `$1${escape(ogTitle)}$2`);
  out = out.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/,  `$1${escape(ogDescription)}$2`);
  out = out.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/,          `$1${escape(ogUrl)}$2`);
  out = out.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,       `$1${escape(ogTitle)}$2`);
  out = out.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,`$1${escape(ogDescription)}$2`);

  if (extraSchema) {
    out = out.replace("</head>", `<script type="application/ld+json">${JSON.stringify(extraSchema)}</script>\n</head>`);
  }

  return out;
}

let count = 0;

// ── City pages ──────────────────────────────────────────────────────────────
for (const city of CITIES) {
  const title       = `Plumber, Electrician & Home Services in ${city.name} | SnapFix`;
  const description = `Book verified plumbers, electricians, carpenters, AC repair & home cleaning in ${city.name}, ${city.state}. Same-day visits. Pay cash on completion. Starts ₹100.`;
  const canonical   = `https://snapfix.pro/city/${city.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `SnapFix ${city.name}`,
    "description": `Verified home service professionals in ${city.name}, ${city.state}.`,
    "url": canonical,
    "telephone": "+91-77777-77777",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": city.name,
      "addressRegion": city.state,
      "addressCountry": "IN"
    },
    "areaServed": { "@type": "City", "name": city.name },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `Home Services in ${city.name}`,
      "itemListElement": SERVICES.map((s) => ({
        "@type": "Offer",
        "itemOffered": { "@type": "Service", "name": `${s} in ${city.name}` },
      })),
    },
    "priceRange": "₹₹",
  };

  const html = injectMeta(template, { title, description, canonical, ogTitle: title, ogDescription: description, ogUrl: canonical, extraSchema: schema });

  const outDir = join(distDir, "city", city.slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html, "utf-8");
  count++;
  console.log(`  ✓ /city/${city.slug}`);
}

// ── /book ────────────────────────────────────────────────────────────────────
{
  const title       = "Book a Home Service | SnapFix — Plumber, Electrician & More";
  const description = "Book a verified plumber, electrician, carpenter, AC repair, or home cleaning service. Quick form, 30-minute confirmation, cash on completion.";
  const canonical   = "https://snapfix.pro/book";

  const html = injectMeta(template, { title, description, canonical, ogTitle: title, ogDescription: description, ogUrl: canonical, extraSchema: null });
  mkdirSync(join(distDir, "book"), { recursive: true });
  writeFileSync(join(distDir, "book", "index.html"), html, "utf-8");
  count++;
  console.log("  ✓ /book");
}

// ── /join ────────────────────────────────────────────────────────────────────
{
  const title       = "Join SnapFix as a Professional | Earn More with Verified Jobs";
  const description = "Apply to become a SnapFix verified professional. Plumbers, electricians, carpenters and other skilled tradespeople welcome. Get jobs directly to your phone.";
  const canonical   = "https://snapfix.pro/join";

  const html = injectMeta(template, { title, description, canonical, ogTitle: title, ogDescription: description, ogUrl: canonical, extraSchema: null });
  mkdirSync(join(distDir, "join"), { recursive: true });
  writeFileSync(join(distDir, "join", "index.html"), html, "utf-8");
  count++;
  console.log("  ✓ /join");
}

console.log(`\n✓ Prerendered ${count} routes`);
