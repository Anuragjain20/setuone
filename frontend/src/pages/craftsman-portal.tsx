import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Calendar, MapPin, Clock, CheckCircle, Loader2, Play, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Nav from "@/components/nav";
import { StatusBadge } from "@/components/status-badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const TIME_LABELS: Record<string, string> = {
  morning: "8 AM – 12 PM", afternoon: "12 PM – 4 PM", evening: "4 PM – 8 PM",
};

export default function CraftsmanPortal() {
  const [phone, setPhone] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [completeJobId, setCompleteJobId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [amount, setAmount] = useState("");
  const [completingLoading, setCompletingLoading] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery<{ craftsman: any; jobs: any[] }>({
    queryKey: ["craftsman-jobs", searchPhone],
    queryFn: () => fetch(`/api/craftsmen/my-jobs?phone=${searchPhone}`).then((r) => {
      if (!r.ok) return r.json().then((d) => Promise.reject(new Error(d.error)));
      return r.json();
    }),
    enabled: !!searchPhone,
    retry: false,
  });

  const updateStatus = async (jobId: number, status: string) => {
    try {
      await fetch(`/api/bookings/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      qc.invalidateQueries({ queryKey: ["craftsman-jobs", searchPhone] });
      toast({ title: `Status updated to ${status.replace("_", " ")}` });
    } catch { toast({ title: "Failed to update", variant: "destructive" }); }
  };

  const completeJob = async () => {
    if (!completeJobId) return;
    setCompletingLoading(true);
    try {
      await fetch(`/api/bookings/${completeJobId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completionNotes: notes, totalAmount: amount ? Number(amount) : undefined }),
      });
      qc.invalidateQueries({ queryKey: ["craftsman-jobs", searchPhone] });
      toast({ title: "Job marked complete!", description: "Customer will be notified." });
      setCompleteJobId(null); setNotes(""); setAmount("");
    } catch { toast({ title: "Failed to complete job", variant: "destructive" }); } finally { setCompletingLoading(false); }
  };

  const activeJobs = data?.jobs.filter((j) => !["completed", "cancelled"].includes(j.status)) ?? [];
  const doneJobs = data?.jobs.filter((j) => j.status === "completed") ?? [];

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <Nav />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1209] mb-1">Karigar Portal</h1>
          <p className="text-[#5C5043]">Enter your registered mobile number to view and manage your assigned jobs.</p>
        </div>

        {/* Phone Search */}
        <Card className="p-5 mb-6 border-[#EDE8E0]">
          <div className="flex gap-3">
            <div className="flex flex-1">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">+91</span>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Your registered number"
                className="rounded-l-none"
                onKeyDown={(e) => e.key === "Enter" && setSearchPhone(phone)}
              />
            </div>
            <Button onClick={() => setSearchPhone(phone)} disabled={phone.length < 10} className="gap-2">
              <Phone className="w-4 h-4" /> View My Jobs
            </Button>
          </div>
        </Card>

        {isLoading && <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>}

        {error && (
          <Card className="p-8 text-center border-red-200 bg-red-50">
            <p className="text-red-700 font-medium">{(error as Error).message}</p>
            <p className="text-sm text-red-500 mt-1">Make sure your number is registered with SevaSetu admin.</p>
          </Card>
        )}

        {data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Craftsman Profile */}
            <Card className="p-5 mb-6 border-[#EDE8E0] bg-white">
              <div className="flex items-center gap-4">
                {data.craftsman.photoUrl ? (
                  <img src={data.craftsman.photoUrl} alt={data.craftsman.name} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">{data.craftsman.name.charAt(0)}</div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-[#1A1209] text-lg">{data.craftsman.name}</h2>
                    {data.craftsman.isVerified && <BadgeCheck className="w-5 h-5 text-primary" />}
                  </div>
                  <p className="text-sm text-[#5C5043]">{data.craftsman.skills.slice(0, 3).join(" · ")}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#8A7A68]">
                    <span>⭐ {data.craftsman.rating.toFixed(1)}</span>
                    <span>·</span>
                    <span>{data.craftsman.totalJobs} jobs done</span>
                    <span>·</span>
                    <Badge className={data.craftsman.isAvailable ? "bg-green-100 text-green-700 border-green-200 text-xs" : "bg-gray-100 text-gray-600 text-xs"}>
                      {data.craftsman.isAvailable ? "Available" : "Busy"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Active Jobs */}
            <h2 className="font-semibold text-[#1A1209] mb-3">Active Jobs ({activeJobs.length})</h2>
            {activeJobs.length === 0 && <Card className="p-8 text-center text-[#8A7A68] border-[#EDE8E0] mb-6">No active jobs assigned right now.</Card>}
            <div className="space-y-3 mb-8">
              {activeJobs.map((job) => (
                <Card key={job.id} className="p-5 border-[#EDE8E0] bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#1A1209]">{job.serviceCategory}</h3>
                        <StatusBadge status={job.status} />
                      </div>
                      <p className="text-xs text-[#8A7A68]">Job #{job.id} · {job.customerName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-[#5C5043] mb-3">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{job.scheduledDate}</div>
                    <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{TIME_LABELS[job.timeSlot] ?? job.timeSlot}</div>
                    <div className="flex items-start gap-1.5 col-span-2"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" /><span className="line-clamp-2">{job.address}</span></div>
                  </div>
                  {job.description && <p className="text-sm text-[#8A7A68] italic mb-3">"{job.description}"</p>}
                  <div className="flex gap-2">
                    {job.status === "confirmed" && (
                      <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => updateStatus(job.id, "in_progress")}>
                        <Play className="w-3.5 h-3.5" /> Start Job
                      </Button>
                    )}
                    {["confirmed", "in_progress"].includes(job.status) && (
                      <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white" onClick={() => { setCompleteJobId(job.id); setNotes(""); setAmount(""); }}>
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Complete
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Done Jobs */}
            {doneJobs.length > 0 && (
              <>
                <h2 className="font-semibold text-[#1A1209] mb-3">Completed ({doneJobs.length})</h2>
                <div className="space-y-3">
                  {doneJobs.slice(0, 5).map((job) => (
                    <Card key={job.id} className="p-4 border-[#EDE8E0] bg-white opacity-75">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-[#1A1209]">{job.serviceCategory} — #{job.id}</p>
                          <p className="text-xs text-[#8A7A68]">{job.scheduledDate} · {job.customerName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {job.rating && <span className="text-sm">⭐ {job.rating}</span>}
                          {job.totalAmount && <span className="text-sm font-medium text-[#1A1209]">₹{job.totalAmount.toLocaleString("en-IN")}</span>}
                          <StatusBadge status={job.status} />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Complete Job Dialog */}
      <Dialog open={!!completeJobId} onOpenChange={(o) => !o && setCompleteJobId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mark Job as Complete</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Total Amount Collected (₹)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 1500" />
            </div>
            <div className="space-y-1.5">
              <Label>Completion Notes (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe what was done..." rows={3} className="resize-none" />
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2" onClick={completeJob} disabled={completingLoading}>
              {completingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Confirm Completion
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

