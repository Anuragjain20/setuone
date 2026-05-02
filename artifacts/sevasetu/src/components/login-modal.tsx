import { useState } from "react";
import { Phone, KeyRound, User, ArrowRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Step = "phone" | "otp" | "name";

export function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { refresh } = useAuth();
  const { toast } = useToast();

  const reset = () => { setStep("phone"); setPhone(""); setOtp(""); setName(""); setDevOtp(null); };

  const handleClose = () => { reset(); onClose(); };

  const requestOtp = async () => {
    if (!/^\d{10}$/.test(phone.replace(/\s/g, ""))) {
      toast({ title: "Enter a valid 10-digit phone number", variant: "destructive" }); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.devOtp) setDevOtp(data.devOtp);
      setStep("otp");
      toast({ title: "OTP sent", description: "Check your messages (or use the dev OTP shown below)" });
    } catch (e: any) {
      toast({ title: e.message ?? "Failed to send OTP", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (otp.length < 4) { toast({ title: "Enter the 4-digit OTP", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, name: name || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (!data.user.name) { setStep("name"); setLoading(false); return; }
      await refresh();
      toast({ title: `Welcome back, ${data.user.name}!` });
      handleClose();
    } catch (e: any) {
      toast({ title: e.message ?? "Invalid OTP", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const saveName = async () => {
    if (!name.trim()) { toast({ title: "Please enter your name", variant: "destructive" }); return; }
    setLoading(true);
    try {
      await fetch("/api/auth/me", {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      await refresh();
      toast({ title: `Welcome, ${name}!` });
      handleClose();
    } catch {
      toast({ title: "Failed to save name", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === "phone" && "Sign in to SevaSetu"}
            {step === "otp" && "Enter OTP"}
            {step === "name" && "What's your name?"}
          </DialogTitle>
        </DialogHeader>

        {step === "phone" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">We'll send a one-time password to your mobile number.</p>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">+91</span>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98765 43210"
                  className="rounded-l-none"
                  onKeyDown={(e) => e.key === "Enter" && requestOtp()}
                  autoFocus
                />
              </div>
            </div>
            <Button className="w-full gap-2" onClick={requestOtp} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
              Send OTP
            </Button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">OTP sent to <strong>+91 {phone}</strong>.</p>
            {devOtp && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-700">Dev Mode OTP</p>
                  <p className="text-2xl font-bold tracking-widest text-amber-800">{devOtp}</p>
                </div>
                <button onClick={() => setOtp(devOtp)} className="text-xs text-amber-700 border border-amber-300 px-2 py-1 rounded hover:bg-amber-100">
                  Auto-fill
                </button>
              </div>
            )}
            <div className="space-y-2">
              <Label>4-digit OTP</Label>
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="1234"
                className="text-center text-2xl tracking-widest h-14 font-bold"
                onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
                autoFocus
              />
            </div>
            <Button className="w-full gap-2" onClick={verifyOtp} disabled={loading || otp.length < 4}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Verify OTP
            </Button>
            <button onClick={() => { setStep("phone"); setOtp(""); setDevOtp(null); }} className="w-full text-sm text-muted-foreground hover:text-foreground text-center">
              ← Change phone number
            </button>
          </div>
        )}

        {step === "name" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Just this once — so we can address you properly.</p>
            <div className="space-y-2">
              <Label>Your Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" onKeyDown={(e) => e.key === "Enter" && saveName()} autoFocus />
            </div>
            <Button className="w-full gap-2" onClick={saveName} disabled={loading || !name.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
