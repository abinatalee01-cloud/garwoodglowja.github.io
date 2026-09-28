import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";

function formatErr(detail) {
  if (!detail) return "Login failed. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e.msg || JSON.stringify(e)).join(" ");
  return String(detail);
}

const AdminLogin = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user && user.role) navigate("/admin"); }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back.");
      navigate("/admin");
    } catch (err) {
      toast.error(formatErr(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center px-5 grain relative overflow-hidden" data-testid="admin-login-page">
      <div className="absolute inset-0 ambient-glow" />
      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-8"><Logo /></div>
        <div className="glass-card rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl glow-btn flex items-center justify-center text-white"><Lock size={18} /></div>
            <div>
              <h1 className="font-heading text-lg font-semibold text-white">Admin Portal</h1>
              <p className="text-xs text-white/50">Sign in to manage Glow Quotes™</p>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4" data-testid="admin-login-form">
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" data-testid="admin-email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-glow-purple" />
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" data-testid="admin-password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-glow-purple" />
            <button type="submit" disabled={loading} data-testid="admin-login-submit" className="glow-btn w-full py-3.5 rounded-full text-white font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><Loader2 size={17} className="animate-spin" /> Signing in…</> : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
