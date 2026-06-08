import { MapPin, TrendingUp, Users, Briefcase, IndianRupee } from "lucide-react";
import { Card } from "@/components/ui/card";
import AdminLayout from "@/components/admin-layout";
import { useGetAdminDashboard, useGetRevenueReport } from "@/api";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

type CityStats = { city: string; bookings: number; craftsmen: number; gmv: number };

function useCityStats() {
  return useQuery<CityStats[]>({
    queryKey: ["admin-city-stats"],
    queryFn: () => fetch("/api/admin/city-stats", { credentials: "include" }).then((r) => r.json()),
  });
}

const CHART_COLORS = [
  "#E87B35", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B",
  "#EF4444", "#06B6D4", "#84CC16", "#EC4899", "#14B8A6",
];

export default function AdminAnalytics() {
  const { data: dashboard } = useGetAdminDashboard();
  const { data: cityStats } = useCityStats();
  const { data: revenue } = useGetRevenueReport({ days: 30 });

  const topCities = (cityStats ?? []).slice(0, 10);

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Platform performance across all cities and services.</p>
        </div>

        {/* Top-line metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Bookings", value: dashboard?.totalBookings ?? 0, icon: Briefcase, color: "text-primary", bg: "bg-primary/10" },
            { label: "Completed Jobs", value: dashboard?.completedBookings ?? 0, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
            { label: "Platform GMV", value: `₹${((dashboard?.gmvThisMonth ?? 0) / 1000).toFixed(1)}k`, icon: IndianRupee, color: "text-primary", bg: "bg-primary/10" },
            { label: "Active Craftsmen", value: `${dashboard?.availableCraftsmen ?? 0}/${dashboard?.totalCraftsmen ?? 0}`, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
          ].map((m) => (
            <Card key={m.label} className="p-4">
              <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center mb-3`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <p className="text-xs text-muted-foreground mb-0.5">{m.label}</p>
              <p className="text-xl font-bold text-foreground">{m.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Revenue trend */}
          <Card className="p-5">
            <h2 className="font-semibold text-foreground mb-4">Revenue — Last 30 Days</h2>
            {revenue && revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenue} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            )}
          </Card>

          {/* Bookings by category */}
          <Card className="p-5">
            <h2 className="font-semibold text-foreground mb-4">Bookings by Service</h2>
            {(dashboard?.bookingsByCategory ?? []).length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={dashboard!.bookingsByCategory}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {dashboard!.bookingsByCategory.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [v, "bookings"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            )}
          </Card>
        </div>

        {/* City Breakdown Table */}
        <Card className="p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> City Breakdown
          </h2>
          {topCities.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No city data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">City</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Bookings</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Craftsmen</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">GMV</th>
                    <th className="py-2 px-3 w-32"></th>
                  </tr>
                </thead>
                <tbody>
                  {topCities.map((row, idx) => {
                    const maxBookings = topCities[0]?.bookings || 1;
                    return (
                      <tr key={row.city} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-4">{idx + 1}</span>
                            <span className="font-medium text-foreground">{row.city}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-foreground">{row.bookings}</td>
                        <td className="py-2.5 px-3 text-right text-muted-foreground">{row.craftsmen}</td>
                        <td className="py-2.5 px-3 text-right text-green-600 font-medium">
                          {row.gmv > 0 ? `₹${row.gmv.toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(row.bookings / maxBookings) * 100}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
