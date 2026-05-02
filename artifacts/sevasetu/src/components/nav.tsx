import { Link, useLocation } from "wouter";
import { Wrench, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Nav() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const isAdmin = location.startsWith("/admin");

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-xs">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary select-none">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          SevaSetu
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <NavLink href="/" label="Home" current={location} />
          <NavLink href="/book" label="Book a Service" current={location} />
          <NavLink href="/bookings" label="My Bookings" current={location} />
          {isAdmin && <NavLink href="/admin" label="Dashboard" current={location} />}
          {isAdmin && <NavLink href="/admin/craftsmen" label="Craftsmen" current={location} />}
          {!isAdmin && (
            <Link href="/admin">
              <Button size="sm" variant="outline" className="ml-2 text-xs">Admin</Button>
            </Link>
          )}
          <Link href="/book">
            <Button size="sm" className="ml-3">Book Now</Button>
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-card px-4 pb-4 flex flex-col gap-1">
          <MobileNavLink href="/" label="Home" onClick={() => setOpen(false)} />
          <MobileNavLink href="/book" label="Book a Service" onClick={() => setOpen(false)} />
          <MobileNavLink href="/bookings" label="My Bookings" onClick={() => setOpen(false)} />
          <MobileNavLink href="/admin" label="Admin Dashboard" onClick={() => setOpen(false)} />
          <MobileNavLink href="/admin/craftsmen" label="Craftsmen Registry" onClick={() => setOpen(false)} />
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, label, current }: { href: string; label: string; current: string }) {
  const active = href === "/" ? current === "/" : current.startsWith(href);
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
    >
      {label}
    </Link>
  );
}
