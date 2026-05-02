import { Link, useLocation } from "wouter";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LoginModal } from "@/components/login-modal";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Nav() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { user, logout } = useAuth();
  const isAdmin = location.startsWith("/admin");

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#EDE8E0] shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#1A1209] select-none">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-black">SS</span>
            </div>
            SevaSetu
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/" label="Services" current={location} />
            <NavLink href="/book" label="Book" current={location} />
            <NavLink href="/bookings" label="My Bookings" current={location} />
            <NavLink href="/craftsman" label="Karigar Portal" current={location} />

            {isAdmin && (
              <>
                <NavLink href="/admin" label="Dashboard" current={location} />
                <NavLink href="/admin/craftsmen" label="Craftsmen" current={location} />
                <NavLink href="/admin/content" label="Site Content" current={location} />
                <NavLink href="/admin/notifications" label="Notifications" current={location} />
              </>
            )}

            {!isAdmin && (
              <Link href="/admin">
                <Button size="sm" variant="outline" className="ml-2 text-xs border-[#D4C5B0]">Admin</Button>
              </Link>
            )}

            {/* Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="ml-3 gap-1.5 border-[#D4C5B0] text-[#1A1209]">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                      {(user.name ?? user.phone).charAt(0).toUpperCase()}
                    </div>
                    {user.name ?? user.phone.slice(-4)}
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-semibold text-foreground">{user.name ?? "User"}</p>
                    <p className="text-xs text-muted-foreground">+91 {user.phone}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/bookings" className="cursor-pointer"><User className="w-3.5 h-3.5 mr-2" />My Bookings</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                    <LogOut className="w-3.5 h-3.5 mr-2" />Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" variant="outline" className="ml-3 border-[#D4C5B0]" onClick={() => setShowLogin(true)}>
                <User className="w-3.5 h-3.5 mr-1.5" /> Sign In
              </Button>
            )}

            <Link href="/book">
              <Button size="sm" className="ml-2 bg-primary text-white hover:bg-primary/90 rounded-lg">Book Now</Button>
            </Link>
          </div>

          <button className="md:hidden p-2 rounded-md hover:bg-[#F0EBE1] transition-colors" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-[#EDE8E0] bg-white px-4 pb-4 flex flex-col gap-1">
            <MobileNavLink href="/" label="Home" onClick={() => setOpen(false)} />
            <MobileNavLink href="/book" label="Book a Service" onClick={() => setOpen(false)} />
            <MobileNavLink href="/bookings" label="My Bookings" onClick={() => setOpen(false)} />
            <MobileNavLink href="/craftsman" label="Karigar Portal" onClick={() => setOpen(false)} />
            <MobileNavLink href="/join" label="Join as Karigar" onClick={() => setOpen(false)} />
            <MobileNavLink href="/admin" label="Admin Dashboard" onClick={() => setOpen(false)} />
            <MobileNavLink href="/admin/notifications" label="Notifications" onClick={() => setOpen(false)} />
            <div className="pt-2 border-t border-[#EDE8E0]">
              {user ? (
                <button onClick={() => { logout(); setOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4 inline mr-2" />Sign Out ({user.name ?? user.phone})
                </button>
              ) : (
                <button onClick={() => { setShowLogin(true); setOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-md text-sm font-medium text-[#1A1209] hover:bg-[#F5F1EB] transition-colors">
                  <User className="w-4 h-4 inline mr-2" />Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
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
