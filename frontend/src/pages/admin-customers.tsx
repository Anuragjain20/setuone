import { useState, useMemo } from "react";
import { Search, UserCheck, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/admin-layout";
import { useQuery } from "@tanstack/react-query";

type Customer = {
  phone: string;
  name: string;
  city: string | null;
  totalBookings: number;
  completedBookings: number;
  totalSpent: number;
  lastBookingDate: string | null;
  isRegistered: boolean;
};

function useCustomers() {
  return useQuery<Customer[]>({
    queryKey: ["admin-customers"],
    queryFn: () => fetch("/api/admin/customers", { credentials: "include" }).then((r) => r.json()),
  });
}

export default function AdminCustomers() {
  const { data: customers, isLoading } = useCustomers();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const list = customers ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.city || "").toLowerCase().includes(q)
    );
  }, [customers, search]);

  const stats = useMemo(() => {
    const list = customers ?? [];
    return {
      total: list.length,
      registered: list.filter((c) => c.isRegistered).length,
      repeat: list.filter((c) => c.totalBookings > 1).length,
    };
  }, [customers]);

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All customers who have placed bookings on SnapFix.</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Customers</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.registered}</p>
            <p className="text-xs text-muted-foreground mt-1">Registered (OTP)</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.repeat}</p>
            <p className="text-xs text-muted-foreground mt-1">Repeat Customers</p>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4 mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </Card>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">City</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Bookings</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Completed</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Spent</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Last Booking</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted-foreground">Loading customers...</td>
                  </tr>
                )}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No customers found.
                    </td>
                  </tr>
                )}
                {filtered.map((c) => (
                  <tr key={c.phone} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{c.name}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" /> {c.phone}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{c.city || "—"}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-foreground">{c.totalBookings}</span>
                      {c.totalBookings > 1 && (
                        <Badge className="ml-2 text-[10px] py-0 h-4 px-1.5 bg-primary/10 text-primary border-0">repeat</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-green-600 font-medium">{c.completedBookings}</td>
                    <td className="py-3 px-4 text-sm font-medium text-foreground">
                      {c.totalSpent > 0 ? `₹${c.totalSpent.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {c.lastBookingDate ? c.lastBookingDate.slice(0, 10) : "—"}
                    </td>
                    <td className="py-3 px-4">
                      {c.isRegistered ? (
                        <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
                          <UserCheck className="w-3.5 h-3.5" /> Registered
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Guest</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
