import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Star, CheckCircle, AlertCircle, Phone, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Nav from "@/components/nav";
import { useListCraftsmen, useCreateCraftsman, useUpdateCraftsman, getListCraftsmenQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminCraftsmen() {
  const { data: craftsmen, isLoading } = useListCraftsmen();
  const createCraftsman = useCreateCraftsman();
  const updateCraftsman = useUpdateCraftsman();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", skills: "", serviceAreas: "", experience: "", bio: "" });

  const handleAdd = async () => {
    try {
      await createCraftsman.mutateAsync({
        data: {
          name: form.name,
          phone: form.phone,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
          serviceAreas: form.serviceAreas.split(",").map((s) => s.trim()).filter(Boolean),
          experience: Number(form.experience) || 0,
          bio: form.bio || undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListCraftsmenQueryKey() });
      toast({ title: "Craftsman Added", description: `${form.name} has been added to the registry.` });
      setShowAdd(false);
      setForm({ name: "", phone: "", skills: "", serviceAreas: "", experience: "", bio: "" });
    } catch {
      toast({ title: "Failed to add craftsman", variant: "destructive" });
    }
  };

  const handleToggleAvailable = async (id: number, current: boolean) => {
    try {
      await updateCraftsman.mutateAsync({ id, data: { isAvailable: !current } });
      queryClient.invalidateQueries({ queryKey: getListCraftsmenQueryKey() });
      toast({ title: !current ? "Craftsman marked available" : "Craftsman marked unavailable" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleToggleVerified = async (id: number, current: boolean) => {
    try {
      await updateCraftsman.mutateAsync({ id, data: { isVerified: !current } });
      queryClient.invalidateQueries({ queryKey: getListCraftsmenQueryKey() });
      toast({ title: !current ? "Craftsman verified" : "Verification removed" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Craftsmen Registry</h1>
            <p className="text-muted-foreground">Manage and verify your professional workforce.</p>
          </div>
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Craftsman
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{craftsmen?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Craftsmen</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{craftsmen?.filter((c) => c.isVerified).length ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Verified</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{craftsmen?.filter((c) => c.isAvailable).length ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Available Now</p>
          </Card>
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-2 gap-4">
            {[1,2,3,4].map((i) => (
              <Card key={i} className="p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {(craftsmen ?? []).map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-5 hover:shadow-md transition-all duration-200">
                <div className="flex gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-foreground">{c.name}</h3>
                      {c.isVerified && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs px-1.5 py-0">
                          <CheckCircle className="w-2.5 h-2.5 mr-1" /> Verified
                        </Badge>
                      )}
                      {!c.isAvailable && (
                        <Badge variant="outline" className="text-muted-foreground text-xs px-1.5 py-0">Unavailable</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= Math.round(c.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">{c.rating.toFixed(1)} · {c.totalJobs} jobs</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" /> {c.phone}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex flex-wrap gap-1">
                    {c.skills.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Briefcase className="w-3 h-3" />
                    {c.experience} years experience · {c.serviceAreas.join(", ")}
                  </div>
                  {c.bio && <p className="text-xs text-muted-foreground line-clamp-2">{c.bio}</p>}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={c.isAvailable}
                      onCheckedChange={() => handleToggleAvailable(c.id, c.isAvailable)}
                    />
                    <span className="text-xs text-muted-foreground">{c.isAvailable ? "Available" : "Unavailable"}</span>
                  </div>
                  <Button
                    size="sm"
                    variant={c.isVerified ? "outline" : "default"}
                    className="h-7 text-xs"
                    onClick={() => handleToggleVerified(c.id, c.isVerified)}
                  >
                    {c.isVerified ? (
                      <><AlertCircle className="w-3 h-3 mr-1" /> Remove Verify</>
                    ) : (
                      <><CheckCircle className="w-3 h-3 mr-1" /> Verify</>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {craftsmen?.length === 0 && !isLoading && (
          <Card className="p-12 text-center">
            <div className="text-4xl mb-4">👷</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No craftsmen yet</h2>
            <p className="text-muted-foreground mb-6">Add your first craftsman to get started.</p>
            <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-2" /> Add Craftsman</Button>
          </Card>
        )}
      </div>

      {/* Add Craftsman Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Craftsman</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block text-xs">Full Name *</Label>
                <Input placeholder="Suresh Patel" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Phone *</Label>
                <Input placeholder="9876543210" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} type="tel" />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Skills * (comma-separated)</Label>
              <Input placeholder="Plumbing, Pipe Fitting, Drain Cleaning" value={form.skills} onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Service Areas * (comma-separated)</Label>
              <Input placeholder="Vijay Nagar, Palasia, Scheme 54" value={form.serviceAreas} onChange={(e) => setForm((f) => ({ ...f, serviceAreas: e.target.value }))} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Years of Experience *</Label>
              <Input type="number" min={0} placeholder="5" value={form.experience} onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Bio (optional)</Label>
              <Textarea placeholder="Brief introduction about the craftsman..." value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} className="min-h-20 resize-none" />
            </div>
            <Button
              className="w-full"
              onClick={handleAdd}
              disabled={!form.name || !form.phone || !form.skills || !form.serviceAreas || createCraftsman.isPending}
            >
              {createCraftsman.isPending ? "Adding..." : "Add Craftsman"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
