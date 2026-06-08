import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, CalendarCheck, Users, Wrench, UserCheck,
  BarChart3, FileText, Bell, Menu, X, LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetAdminDashboard } from "@/api";

type NavItem = {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badgeKey?: "pendingApplications";
};

type NavSection = { label: string; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      { path: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Operations",
    items: [
      { path: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
      { path: "/admin/applications", label: "Applications", icon: UserCheck, badgeKey: "pendingApplications" },
    ],
  },
  {
    label: "People",
    items: [
      { path: "/admin/craftsmen", label: "Craftsmen", icon: Wrench },
      { path: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    label: "Platform",
    items: [
      { path: "/admin/content", label: "Content", icon: FileText },
      { path: "/admin/notifications", label: "Notifications", icon: Bell },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { data: dashboard } = useGetAdminDashboard();

  const isActive = (path: string, exact?: boolean) => {
    if (exact || path === "/admin") return location === path;
    return location.startsWith(path);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    window.location.href = "/admin";
  };

  const getBadgeCount = (key?: "pendingApplications") => {
    if (!key || !dashboard) return 0;
    return dashboard[key] ?? 0;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
          SF
        </div>
        <div>
          <p className="font-bold text-foreground text-sm">SnapFix</p>
          <p className="text-[10px] text-muted-foreground">Admin Console</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-1.5">
              {section.label}
            </p>
            {section.items.map((item) => {
              const active = isActive(item.path, item.exact);
              const badgeCount = getBadgeCount(item.badgeKey);
              return (
                <Link key={item.path} href={item.path}>
                  <button
                    onClick={() => setOpen(false)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5 ${
                      active
                        ? "bg-primary text-white shadow-sm"
                        : "text-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-muted-foreground"}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {badgeCount > 0 && (
                      <Badge className={`text-[10px] h-4 px-1.5 py-0 ${active ? "bg-white text-primary" : "bg-primary text-white"}`}>
                        {badgeCount}
                      </Badge>
                    )}
                  </button>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom: view site + logout */}
      <div className="p-3 border-t border-border space-y-1">
        <Link href="/">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150">
            <BarChart3 className="w-4 h-4" />
            View Site
          </button>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-background border-r border-border fixed top-0 left-0 h-screen z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-56 bg-background border-r border-border z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 md:ml-56 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-background border-b border-border sticky top-0 z-20">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white font-bold text-xs">SF</div>
            <span className="font-semibold text-sm text-foreground">SnapFix Admin</span>
          </div>
          {open && (
            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={() => setOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
