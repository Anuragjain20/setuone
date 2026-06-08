import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Phone, MapPin, Briefcase, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AdminLayout from "@/components/admin-layout";
import { useListCraftsmen, useUpdateCraftsman, getListCraftsmenQueryKey, getGetAdminDashboardQueryKey } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminApplications() {
  const { data: applications, isLoading } = useListCraftsmen({ applicationStatus: "pending" });
  const updateCraftsman = useUpdateCraftsman();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListCraftsmenQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
  };

  const handleApprove = async (id: number, name: string) => {
    try {
      await updateCraftsman.mutateAsync({
        id,
        data: { isVerified: true, isAvailable: true, applicationStatus: "approved" } as any,
      });
      invalidate();
      toast({ title: "Application Approved", description: `${name} is now a verified SnapFix pro.` });
    } catch {
      toast({ title: "Failed to approve", variant: "destructive" });
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    const app = applications?.find((a) => a.id === rejectId);
    try {
      await updateCraftsman.mutateAsync({
        id: rejectId,
        data: { applicationStatus: "rejected" } as any,
      });
      invalidate();
      toast({
        title: "Application Rejected",
        description: app ? `${app.name}'s application has been declined.` : undefined,
      });
      setRejectId(null);
      setRejectReason("");
    } catch {
      toast({ title: "Failed to reject", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Applications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review craftsman applications to join the SnapFix network.
          </p>
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5 animate-pulse">
                <div className="h-5 bg-muted rounded w-1/2 mb-3" />
                <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                <div className="h-4 bg-muted rounded w-full" />
              </Card>
            ))}
          </div>
        )}

        {!isLoading && (applications ?? []).length === 0 && (
          <Card className="p-14 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">All caught up!</h2>
            <p className="text-muted-foreground">No pending applications at the moment.</p>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {(applications ?? []).map((app, idx) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-5 border-l-4 border-l-yellow-400 hover:shadow-md transition-all">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                    {app.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{app.name}</h3>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-yellow-300 text-yellow-700 bg-yellow-50">
                        <Clock className="w-2.5 h-2.5 mr-1" /> Pending
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Phone className="w-3 h-3" /> {app.phone}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  {app.city && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{app.city}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Briefcase className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{app.experience} yrs experience</span>
                  </div>
                  {app.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {app.skills.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  )}
                  {app.serviceAreas.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Areas: {app.serviceAreas.join(", ")}
                    </p>
                  )}
                  {app.bio && (
                    <p className="text-xs text-muted-foreground italic line-clamp-2">"{app.bio}"</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button
                    className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprove(app.id, app.name)}
                    disabled={updateCraftsman.isPending}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => { setRejectId(app.id); setRejectReason(""); }}
                    disabled={updateCraftsman.isPending}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={!!rejectId} onOpenChange={(o) => !o && setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              The applicant will be marked as rejected. You can add an internal note below.
            </p>
            <div>
              <Label className="mb-2 block text-sm">Internal Note (optional)</Label>
              <Textarea
                placeholder="e.g. Skills don't match current demand in this city."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-20 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setRejectId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleReject}
                disabled={updateCraftsman.isPending}
              >
                {updateCraftsman.isPending ? "Rejecting..." : "Confirm Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
