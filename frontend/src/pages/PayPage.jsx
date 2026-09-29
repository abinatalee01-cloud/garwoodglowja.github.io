import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, ShieldCheck, Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import api from "@/lib/api";

const fmtUsd = (v) => `USD $${Number(v).toFixed(2)}`;
const fmtJmd = (v, rate) => `~JMD $${Math.round(Number(v) * rate).toLocaleString()}`;

const PayPage = () => {
  const { id } = useParams();
  const [summary, setSummary] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("full"); // full | deposit

  const load = async () => {
    try {
      const [s, c] = await Promise.all([api.get(`/pay/${id}`), api.get("/paypal/config")]);
      setSummary(s.data);
      setConfig(c.data);
    } catch {
      setSummary(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const Shell = ({ children }) => (
    <div className="min-h-screen bg-[#0A0A0C] text-white grain relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 ambient-glow" />
      <header className="relative border-b border-white/10">
        <div className="max-w-3xl mx-auto px-5 py-5"><Logo /></div>
      </header>
      <main className="relative flex-1 flex items-center justify-center px-5 py-14">{children}</main>
    </div>
  );

  if (loading) return <Shell><Loader2 className="animate-spin text-glow-soft" /></Shell>;
  if (summary === false) {
    return <Shell><div className="text-center"><h1 className="font-heading text-2xl font-semibold">Request not found</h1><Link to="/" className="text-glow-soft text-sm mt-4 inline-block">Back to home</Link></div></Shell>;
  }

  const rate = summary.jmd_rate || 158;
  const notReady = summary.amount == null;
  const remaining = summary.remaining;
  const isPaid = summary.paid || (remaining != null && remaining <= 0);
  const hasDeposited = summary.amount_paid > 0 && !isPaid;
  const showChoice = summary.allow_deposit && summary.amount_paid === 0;
  const chargeAmount = mode === "deposit" && showChoice ? summary.deposit_amount : remaining;

  if (isPaid) {
    return (
      <Shell>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-3xl p-10 max-w-md text-center" data-testid="pay-success">
          <div className="h-16 w-16 rounded-full glow-btn flex items-center justify-center text-white mx-auto mb-6"><CheckCircle2 size={30} /></div>
          <h1 className="font-heading text-2xl font-semibold">Payment complete — thank you!</h1>
          <p className="text-white/60 mt-3">Your payment for {summary.service} is confirmed. A receipt has been emailed to you. We'll be in touch to finalise your Signature Glow™.</p>
          <Link to="/" className="glow-btn inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-medium mt-7"><Sparkles size={17} /> Back to Home</Link>
        </motion.div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="w-full max-w-md" data-testid="pay-page">
        <div className="glass-card rounded-3xl p-8">
          <span className="overline-label">Secure Payment</span>
          <h1 className="font-heading text-2xl font-semibold mt-3">Pay your Glow Quote™</h1>
          <p className="text-white/55 text-sm mt-1">Hi {summary.name?.split(" ")[0] || "there"}, here's your approved quote.</p>

          <div className="mt-6 rounded-2xl bg-white/[0.03] border border-white/10 p-5">
            <div className="flex justify-between text-sm"><span className="text-white/50">Service</span><span className="text-white/85">{summary.service}</span></div>
            {summary.amount != null && (
              <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/10">
                <span className="text-white/50 text-sm">{hasDeposited ? "Balance due" : "Amount due"}</span>
                <div className="text-right">
                  <div className="font-heading text-3xl font-bold text-shimmer" data-testid="pay-amount">{fmtUsd(hasDeposited ? remaining : summary.amount)}</div>
                  <div className="text-xs text-glow-soft mt-1" data-testid="pay-amount-jmd">{fmtJmd(hasDeposited ? remaining : summary.amount, rate)}</div>
                </div>
              </div>
            )}
            {hasDeposited && (
              <div className="text-xs text-white/40 mt-2" data-testid="deposit-note">Deposit of {fmtUsd(summary.amount_paid)} already received.</div>
            )}
          </div>

          {/* Deposit / Full choice */}
          {!notReady && config?.configured && showChoice && (
            <div className="grid grid-cols-2 gap-2.5 mt-5" data-testid="pay-mode-choice">
              <button onClick={() => setMode("deposit")} data-testid="pay-mode-deposit"
                className={`rounded-xl border p-3 text-left transition-all ${mode === "deposit" ? "border-glow-purple bg-glow-purple/15" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}>
                <div className="text-xs text-white/50">50% Deposit now</div>
                <div className="text-sm font-semibold text-white mt-0.5">{fmtUsd(summary.deposit_amount)}</div>
                <div className="text-[11px] text-glow-soft">{fmtJmd(summary.deposit_amount, rate)}</div>
              </button>
              <button onClick={() => setMode("full")} data-testid="pay-mode-full"
                className={`rounded-xl border p-3 text-left transition-all ${mode === "full" ? "border-glow-purple bg-glow-purple/15" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}>
                <div className="text-xs text-white/50">Pay in full</div>
                <div className="text-sm font-semibold text-white mt-0.5">{fmtUsd(summary.amount)}</div>
                <div className="text-[11px] text-glow-soft">{fmtJmd(summary.amount, rate)}</div>
              </button>
            </div>
          )}

          {notReady ? (
            <div className="mt-6 text-center text-sm text-white/60 flex items-center justify-center gap-2" data-testid="pay-not-ready">
              <Clock size={16} className="text-glow-soft" /> This quote isn't ready for payment yet. We'll email you once it's approved.
            </div>
          ) : !config?.configured ? (
            <div className="mt-6 text-center text-sm text-white/60" data-testid="pay-not-configured">
              Online payments are being set up. Please reach out and we'll arrange payment directly.
            </div>
          ) : (
            <div className="mt-5" data-testid="paypal-buttons">
              <div className="text-xs text-white/45 mb-2 text-center">Paying {fmtUsd(chargeAmount)} now</div>
              <PayPalScriptProvider options={{ clientId: config.client_id, currency: "USD", intent: "capture" }}>
                <PayPalButtons
                  forceReRender={[mode, chargeAmount]}
                  style={{ layout: "vertical", color: "gold", shape: "pill", label: "pay" }}
                  createOrder={async () => {
                    const { data } = await api.post(`/payments/${id}/create-order`, null, { params: { mode } });
                    return data.id;
                  }}
                  onApprove={async (data) => {
                    try {
                      const { data: res } = await api.post(`/payments/${id}/capture`, { order_id: data.orderID });
                      if (res.status === "COMPLETED") { toast.success("Payment successful! Receipt emailed."); await load(); }
                      else toast.error("Payment not completed. Please try again.");
                    } catch { toast.error("Could not confirm payment. Please contact us."); }
                  }}
                  onError={() => toast.error("Payment error. Please try again.")}
                />
              </PayPalScriptProvider>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40">
            <ShieldCheck size={14} className="text-glow-soft" /> Secured by PayPal · {config?.mode === "live" ? "Live" : "Sandbox test mode"}
          </div>
        </div>
      </div>
    </Shell>
  );
};

export default PayPage;
