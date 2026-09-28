import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut, Inbox, CalendarCheck, CheckCircle2, LayoutGrid, Loader2, MessageCircle,
  Phone, Mail, X, ImageIcon, MapPin, RefreshCw, DollarSign, Copy, CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import api, { API } from "@/lib/api";

const STATUS_META = {
  new: { label: "New", cls: "bg-glow-purple/20 text-glow-soft border-glow-purple/40" },
  approved: { label: "Approved", cls: "bg-sky-500/15 text-glow-soft border-glow-purple/30" },
  scheduled: { label: "Scheduled", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  "in-progress": { label: "In Progress", cls: "bg-purple-400/15 text-purple-200 border-purple-400/30" },
  paid: { label: "Paid", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  completed: { label: "Completed", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
};
const STATUS_FLOW = ["new", "scheduled", "in-progress", "completed"];

const PhotoThumb = ({ path }) => {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let blobUrl;
    api.get(`/files/${path}`, { responseType: "blob" })
      .then((res) => { blobUrl = URL.createObjectURL(res.data); setUrl(blobUrl); })
      .catch(() => {});
    return () => blobUrl && URL.revokeObjectURL(blobUrl);
  }, [path]);
  if (!url) return <div className="h-24 w-24 rounded-xl bg-white/5 flex items-center justify-center"><ImageIcon size={20} className="text-white/30" /></div>;
  return <a href={url} target="_blank" rel="noreferrer"><img src={url} alt="upload" className="h-24 w-24 rounded-xl object-cover ring-1 ring-white/10 hover:ring-glow-purple transition-all" /></a>;
};

const AdminDashboard = () => {
  const { user, ready, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, new: 0, scheduled: 0, completed: 0 });
  const [quotes, setQuotes] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    if (ready && (!user || !user.role)) navigate("/admin/login");
  }, [ready, user, navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, q] = await Promise.all([
        api.get("/quotes/stats"),
        api.get("/quotes", { params: filter !== "all" ? { status: filter } : {} }),
      ]);
      setStats(s.data);
      setQuotes(q.data.quotes);
    } catch {
      toast.error("Failed to load quotes.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { if (user && user.role) load(); }, [user, load]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/quotes/${id}`, { status });
      toast.success(`Marked ${STATUS_META[status].label}`);
      load();
      setSelected((s) => (s && s.id === id ? { ...s, status } : s));
    } catch {
      toast.error("Update failed.");
    }
  };

  const waLink = (q) => {
    const msg = encodeURIComponent(`Hi ${q.name}, thank you for your Glow Quote™ request with Garwood Glow JA! We'd love to help make your space glow.`);
    const phone = (q.phone || "").replace(/\D/g, "");
    return `https://wa.me/${phone}?text=${msg}`;
  };

  const payUrl = (q) => `${window.location.origin}/pay/${q.id}`;

  const approve = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) { toast.error("Enter a valid amount."); return; }
    try {
      await api.post(`/quotes/${selected.id}/approve`, { amount: val, currency });
      toast.success(`Approved — ${currency} $${val.toFixed(2)}. Pay Now link ready.`);
      setAmount("");
      load();
      setSelected((s) => ({ ...s, status: "approved", price: val, currency, paid: false }));
    } catch {
      toast.error("Approval failed.");
    }
  };

  const copyPayLink = (q) => {
    navigator.clipboard?.writeText(payUrl(q));
    toast.success("Pay Now link copied.");
  };

  const sendPayWhatsApp = (q) => {
    const msg = encodeURIComponent(`Hi ${q.name}, your Garwood Glow JA quote is approved: ${q.currency || "USD"} $${Number(q.price).toFixed(2)}. Pay securely here: ${payUrl(q)}`);
    const phone = (q.phone || "").replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  if (!ready || !user) {
    return <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center"><Loader2 className="animate-spin text-glow-soft" /></div>;
  }

  const cards = [
    { key: "total", label: "Total Requests", value: stats.total, icon: LayoutGrid },
    { key: "new", label: "New", value: stats.new, icon: Inbox },
    { key: "scheduled", label: "Scheduled", value: stats.scheduled, icon: CalendarCheck },
    { key: "completed", label: "Completed", value: stats.completed, icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white" data-testid="admin-dashboard">
      <header className="border-b border-white/10 backdrop-blur-xl bg-[#0A0A0C]/85 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[72px] flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <button onClick={load} className="glass-card h-10 w-10 rounded-full flex items-center justify-center text-white/70 hover:text-white" data-testid="admin-refresh"><RefreshCw size={16} /></button>
            <button onClick={() => { logout(); navigate("/admin/login"); }} data-testid="admin-logout" className="glass-card inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm text-white/80 hover:text-white">
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold">Glow Quote™ Dashboard</h1>
        <p className="text-white/50 mt-1">Review, contact and manage incoming requests.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {cards.map((c) => (
            <div key={c.key} className="glass-card rounded-2xl p-5" data-testid={`stat-${c.key}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-white/45">{c.label}</span>
                <c.icon size={18} className="text-glow-soft" />
              </div>
              <div className="font-heading text-3xl font-bold mt-3">{c.value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mt-10" data-testid="admin-filters">
          {["all", ...STATUS_FLOW].map((f) => (
            <button key={f} onClick={() => setFilter(f)} data-testid={`admin-filter-${f}`}
              className={`px-4 py-2 rounded-full text-sm transition-all ${filter === f ? "glow-btn text-white" : "glass-card text-white/60 hover:text-white"}`}>
              {f === "all" ? "All" : STATUS_META[f].label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="py-20 text-center"><Loader2 className="animate-spin text-glow-soft mx-auto" /></div>
          ) : quotes.length === 0 ? (
            <div className="glass-card rounded-2xl py-16 text-center text-white/50" data-testid="admin-empty">No quote requests yet.</div>
          ) : (
            quotes.map((q) => (
              <div key={q.id} className="glass-card rounded-2xl p-5 flex flex-wrap items-center gap-4 justify-between hover:border-glow-purple/40 transition-colors" data-testid={`quote-row-${q.id}`}>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-white">{q.name}</span>
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${STATUS_META[q.status]?.cls || ""}`}>{STATUS_META[q.status]?.label || q.status}</span>
                  </div>
                  <div className="text-sm text-white/50 mt-1">{q.service || q.property_type} · {q.email}</div>
                  <div className="text-xs text-white/35 mt-0.5">{new Date(q.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  {q.photo_paths?.length > 0 && <span className="text-xs text-glow-soft flex items-center gap-1"><ImageIcon size={13} /> {q.photo_paths.length}</span>}
                  <button onClick={() => setSelected(q)} data-testid={`quote-view-${q.id}`} className="glass-card px-4 py-2 rounded-full text-sm text-white/80 hover:text-white">View</button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-5" onClick={() => setSelected(null)} data-testid="quote-detail-modal">
          <div className="glass-card rounded-3xl w-full max-w-2xl max-h-[88vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-heading text-2xl font-semibold">{selected.name}</h2>
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${STATUS_META[selected.status]?.cls || ""}`}>{STATUS_META[selected.status]?.label || selected.status}</span>
                </div>
                <div className="text-sm text-white/50 mt-1">{new Date(selected.created_at).toLocaleString()}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/50 hover:text-white" data-testid="modal-close"><X size={22} /></button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {[
                ["Email", selected.email], ["Phone", selected.phone], ["Preferred Contact", selected.preferred_contact],
                ["Property Type", selected.property_type], ["Service", selected.service], ["Size", selected.size],
                ["Bedrooms", selected.bedrooms], ["Bathrooms", selected.bathrooms], ["Frequency", selected.frequency],
                ["Preferred Date", selected.preferred_date], ["Preferred Time", selected.preferred_time],
                ["Recommended Pkg", selected.recommended_package],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k}><div className="text-xs text-white/40">{k}</div><div className="text-white/85 mt-0.5">{v}</div></div>
              ))}
            </div>

            {selected.extras?.length > 0 && (
              <div className="mt-4"><div className="text-xs text-white/40 mb-1.5">Extra Services</div><div className="flex flex-wrap gap-2">{selected.extras.map((e) => <span key={e} className="glass-card px-3 py-1 rounded-full text-xs text-white/75">{e}</span>)}</div></div>
            )}

            {selected.notes && (
              <div className="mt-4"><div className="text-xs text-white/40 mb-1.5">Notes</div><p className="text-sm text-white/75 leading-relaxed glass-card rounded-xl p-4">{selected.notes}</p></div>
            )}

            {selected.photo_paths?.length > 0 && (
              <div className="mt-5">
                <div className="text-xs text-white/40 mb-2">Uploaded Photos</div>
                <div className="flex flex-wrap gap-3">{selected.photo_paths.map((p) => <PhotoThumb key={p} path={p} />)}</div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2 pt-5 border-t border-white/10">
              <a href={waLink(selected)} target="_blank" rel="noreferrer" data-testid="modal-whatsapp" className="glass-card inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm hover:text-glow-soft"><MessageCircle size={15} /> WhatsApp</a>
              <a href={`tel:${selected.phone}`} className="glass-card inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm hover:text-glow-soft"><Phone size={15} /> Call</a>
              <a href={`mailto:${selected.email}`} className="glass-card inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm hover:text-glow-soft"><Mail size={15} /> Email</a>
            </div>

            {/* Payment / Approval */}
            <div className="mt-5 rounded-2xl bg-white/[0.03] border border-white/10 p-5" data-testid="approve-section">
              <div className="flex items-center gap-2 text-glow-soft text-sm font-medium mb-3"><CreditCard size={15} /> Approve & Collect Payment</div>
              {selected.paid ? (
                <div className="flex items-center gap-2 text-emerald-300 text-sm" data-testid="payment-paid"><CheckCircle2 size={16} /> Paid — {selected.currency} ${Number(selected.price).toFixed(2)}</div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} data-testid="approve-currency" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-glow-purple">
                      <option value="USD">USD</option>
                      <option value="JMD">JMD</option>
                    </select>
                    <div className="relative flex-1">
                      <DollarSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={selected.price ? String(selected.price) : "Set price"} data-testid="approve-amount" className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-glow-purple" />
                    </div>
                    <button onClick={approve} data-testid="approve-submit" className="glow-btn px-4 py-2.5 rounded-xl text-white text-sm font-medium whitespace-nowrap">{selected.price ? "Update Price" : "Approve"}</button>
                  </div>
                  {selected.price != null && (
                    <div className="mt-3 flex flex-wrap items-center gap-2" data-testid="pay-link-row">
                      <span className="text-xs text-white/50">Pay Now link ready ({selected.currency} ${Number(selected.price).toFixed(2)}):</span>
                      <button onClick={() => copyPayLink(selected)} data-testid="copy-pay-link" className="glass-card inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs hover:text-glow-soft"><Copy size={12} /> Copy link</button>
                      <button onClick={() => sendPayWhatsApp(selected)} data-testid="send-pay-whatsapp" className="glass-card inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs hover:text-glow-soft"><MessageCircle size={12} /> Send via WhatsApp</button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mt-4">
              <div className="text-xs text-white/40 mb-2">Update Status</div>
              <div className="flex flex-wrap gap-2">
                {STATUS_FLOW.map((s) => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)} data-testid={`set-status-${s}`}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${selected.status === s ? "glow-btn text-white" : "glass-card text-white/60 hover:text-white"}`}>
                    {STATUS_META[s].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
