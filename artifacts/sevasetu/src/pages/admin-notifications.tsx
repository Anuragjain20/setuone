import { motion } from "framer-motion";
import { MessageSquare, Smartphone, RefreshCw, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Nav from "@/components/nav";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useListCraftsmen } from "@workspace/api-client-react";

type Notification = {
  id: number; type: string; recipientPhone: string; recipientName: string | null;
  message: string; channel: string; status: string; bookingId: number | null; createdAt: string;
};

const TYPE_LABELS: Record<string, string> = {
  otp: "OTP Login",
  booking_created: "Booking Created",
  booking_confirmed: "Booking Confirmed",
  booking_completed: "Booking Completed",
  booking_cancelled: "Booking Cancelled",
};

const TYPE_COLORS: Record<string, string> = {
  otp: "bg-purple-100 text-purple-700 border-purple-200",
  booking_created: "bg-blue-100 text-blue-700 border-blue-200",
  booking_confirmed: "bg-green-100 text-green-700 border-green-200",
  booking_completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  booking_cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminNotifications() {
  const qc = useQueryClient();
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/notifications?limit=200").then((r) => r.json()),
    refetchInterval: 15000,
  });

  const { data: craftsmen = [] } = useListCraftsmen();
  const pendingApplications = (craftsmen as any[]).filter((c) => c.applicationStatus === "pending");

  const approveApplicant = async (id: number) => {
    await fetch(`/api/craftsmen/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVerified: true, isAvailable: true, applicationStatus: "approved" }),
    });
    qc.invalidateQueries({ queryKey: ["craftsmen"] });
  };

  const rejectApplicant = async (id: number) => {
    await fetch(`/api/craftsmen/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationStatus: "rejected" }),
    });
    qc.invalidateQueries({ queryKey: ["craftsmen"] });
  };

  const smsCount = notifications.filter((n) => n.channel === "sms").length;
  const waCount = notifications.filter((n) => n.channel === "whatsapp").length;
  const todayCount = notifications.filter((n) => {
    const d = new Date(n.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Notifications & Applicants</h1>
            <p className="text-muted-foreground">Track all outgoing messages and new craftsman applications.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ["notifications"] })} className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Sent", value: notifications.length, icon: MessageSquare, color: "text-primary", bg: "bg-primary/10" },
            { label: "Today", value: todayCount, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Pending Applications", value: pendingApplications.length, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((s) => (
            <Card key={s.label} className="p-4 border-[#EDE8E0]">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
              </div>
              <p className="text-xs text-muted-foreground mb-0.5">{s.label}</p>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </Card>
          ))}
        </div>

        {/* Pending Applicants */}
        {pendingApplications.length > 0 && (
          <Card className="p-5 mb-6 border-amber-200 bg-amber-50/30">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Pending Craftsman Applications ({pendingApplications.length})
            </h2>
            <div className="space-y-3">
              {pendingApplications.map((c: any) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white rounded-xl border border-amber-100">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.phone} · {c.skills?.slice(0, 3).join(", ")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.serviceAreas?.slice(0, 3).join(", ")} · {c.experience} yrs exp</p>
                    {c.bio && <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1">"{c.bio}"</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8 gap-1" onClick={() => approveApplicant(c.id)}>
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 border-red-200 text-red-600 hover:bg-red-50" onClick={() => rejectApplicant(c.id)}>
                      Reject
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        )}

        {/* Notification Log */}
        <Card className="p-5 border-[#EDE8E0]">
          <h2 className="font-semibold text-foreground mb-1">Message Log</h2>
          <p className="text-xs text-muted-foreground mb-4">All SMS and WhatsApp messages queued by the platform. In production, these connect to MSG91 / WhatsApp Business API.</p>

          {isLoading && (
            <div className="space-y-3">
              {[1,2,3].map((i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
            </div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No notifications yet. They appear here when customers book, confirm, or OTP-login.</div>
          )}

          <div className="space-y-2">
            {notifications.map((n, idx) => (
              <motion.div key={n.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}
                className="flex gap-3 items-start p-4 rounded-xl border border-[#EDE8E0] bg-white hover:bg-[#FAF8F4] transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${n.channel === "whatsapp" ? "bg-green-100" : "bg-blue-100"}`}>
                  {n.channel === "whatsapp"
                    ? <MessageSquare className="w-4 h-4 text-green-600" />
                    : <Smartphone className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <Badge className={`text-[10px] px-2 py-0 border ${TYPE_COLORS[n.type] ?? "bg-muted text-muted-foreground"}`}>
                      {TYPE_LABELS[n.type] ?? n.type}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-2 py-0 capitalize">{n.channel}</Badge>
                    {n.bookingId && <span className="text-[10px] text-muted-foreground">Booking #{n.bookingId}</span>}
                  </div>
                  <p className="text-sm font-medium text-foreground">{n.recipientName ?? "Unknown"} · {n.recipientPhone}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-[10px] text-green-600 font-medium">Sent</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
