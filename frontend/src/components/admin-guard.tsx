import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!location.startsWith("/admin")) return;
    setChecking(true);
    fetch("/api/admin/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setAuthed(data.admin === true))
      .catch(() => setAuthed(false))
      .finally(() => setChecking(false));
  }, [location]);

  if (!location.startsWith("/admin")) return <>{children}</>;

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4] text-sm text-[#5C5043]">Checking admin session...</div>;
  }

  if (authed) return <>{children}</>;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      setAuthed(true);
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4] px-4">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm border border-[#EDE8E0]">
        <h1 className="text-2xl font-bold text-[#1A1209] mb-6 text-center">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Enter username"
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Enter password"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full bg-primary text-white">Login</Button>
        </form>
      </div>
    </div>
  );
}
