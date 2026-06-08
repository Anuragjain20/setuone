import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Nav() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const isAdmin = location.startsWith("/admin");

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#EDE8E0] shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#1A1209] select-none shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-black">SF</span>
            </div>
            SnapFix
          </Link>

          <div className="hidden md:flex items-center gap-1 ml-auto">
            <NavLink href="/" label="Home" current={location} />
            <NavLink href="/book" label="Book a Service" current={location} />

            <Link href="/book">
              <Button size="sm" className="ml-4 bg-primary text-white hover:bg-primary/90 rounded-lg">Book Now</Button>
            </Link>
          </div>

          <button className="md:hidden p-2 rounded-md hover:bg-[#F0EBE1] transition-colors" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-[#EDE8E0] bg-white px-4 pb-4 pt-2 flex flex-col gap-1">
            <MobileNavLink href="/" label="Home" onClick={() => setOpen(false)} />
            <MobileNavLink href="/book" label="Book a Service" onClick={() => setOpen(false)} />
          </div>
        )}
      </nav>
    </>
  );
}

function NavLink({ href, label, current }: { href: string; label: string; current: string }) {
  const active = href === "/" ? current === "/" : current.startsWith(href);
  return (
    <Link href={href} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${active ? "bg-[#F0EBE1] text-primary" : "text-[#5C5043] hover:text-[#1A1209] hover:bg-[#F5F1EB]"}`}>
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block px-3 py-2.5 rounded-md text-sm font-medium text-[#1A1209] hover:bg-[#F5F1EB] transition-colors">
      {label}
    </Link>
  );
}
