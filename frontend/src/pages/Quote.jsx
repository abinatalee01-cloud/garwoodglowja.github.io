import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Upload, X, Loader2, Sparkles, PartyPopper, Home as HomeIcon } from "lucide-react";
import { toast } from "sonner";
import PageHero from "@/components/PageHero";
import { GUIDE_OPTIONS, SERVICES, IMAGES } from "@/data/site";
import api from "@/lib/api";

const CONTACT_METHODS = ["WhatsApp", "Phone Call", "Email"];
const EXTRAS = ["Inside oven", "Inside fridge", "Interior windows", "Laundry & linens", "Carpet shampoo", "Balcony / patio", "Garage", "Pet-friendly products"];
const STEPS = ["Your Details", "Property", "Add-ons", "Photos", "Schedule"];

const Field = ({ label, children }) => (
  <div><label className="text-xs font-mono uppercase tracking-widest text-white/45 block mb-2">{label}</label>{children}</div>
);
const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-glow-purple";

const Chips = ({ options, value, onChange, multi, testid }) => (
  <div className="flex flex-wrap gap-2" data-testid={testid}>
    {options.map((o) => {
      const val = o.value || o;
      const label = o.label || o;
      const active = multi ? value.includes(val) : value === val;
      return (
        <button key={val} type="button" onClick={() => onChange(val)} data-testid={`${testid}-${String(val).replace(/[^a-z0-9]/gi, "").toLowerCase()}`}
          className={`px-4 py-2.5 rounded-xl text-sm border transition-all ${active ? "border-glow-purple bg-glow-purple/15 text-white" : "border-white/10 bg-white/[0.03] text-white/65 hover:border-white/25"}`}>
          {label}
        </button>
      );
    })}
  </div>
);

const Quote = () => {
  const location = useLocation();
  const prefill = location.state || {};
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [photos, setPhotos] = useState([]); // {path, filename}
  const [form, setForm] = useState({
    name: "", email: "", phone: "", preferred_contact: "WhatsApp",
    property_type: prefill.property_type || "apartment",
    service: prefill.recommended_package || "",
    size: prefill.size || "1500-3500",
    bedrooms: "", bathrooms: "",
    frequency: prefill.frequency || "one-time",
    extras: [], notes: "", preferred_date: "", preferred_time: "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleExtra = (v) => setForm((f) => ({ ...f, extras: f.extras.includes(v) ? f.extras.filter((e) => e !== v) : [...f.extras, v] }));

  const canNext = () => {
    if (step === 0) return form.name && form.email && form.phone;
    return true;
  };

  const onUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const { data } = await api.post("/uploads", fd, { headers: { "Content-Type": "multipart/form-data" } });
        setPhotos((p) => [...p, data]);
      }
      toast.success("Photo(s) uploaded.");
    } catch {
      toast.error("Upload failed. Please try a smaller image.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.post("/quotes", {
        ...form,
        preferred_contact: form.preferred_contact.toLowerCase().replace(" ", "-"),
        photo_paths: photos.map((p) => p.path),
        recommended_package: prefill.recommended_package || form.service,
      });
      setDone(true);
      window.scrollTo(0, 0);
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 grain relative overflow-hidden pt-24" data-testid="quote-confirmation">
        <div className="absolute inset-0 ambient-glow" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative text-center max-w-lg glass-card rounded-3xl p-10">
          <div className="h-16 w-16 rounded-full glow-btn flex items-center justify-center text-white mx-auto mb-6"><PartyPopper size={28} /></div>
          <h1 className="font-heading text-3xl font-semibold">Your Glow Quote™ is on its way!</h1>
          <p className="text-white/60 mt-4 leading-relaxed">Thank you, {form.name.split(" ")[0]}. We've received your request and will review your details{photos.length ? " and photos" : ""}. Expect to hear from us within 24 hours via {form.preferred_contact}.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link to="/" data-testid="confirmation-home" className="glow-btn px-7 py-3.5 rounded-full text-white font-medium inline-flex items-center justify-center gap-2"><HomeIcon size={17} /> Back to Home</Link>
            <Link to="/gallery" className="glass-card px-7 py-3.5 rounded-full text-white/80 hover:text-white">See our work</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div data-testid="quote-page">
      <PageHero eyebrow="Request a Glow Quote™" title="Tell us about your space" subtitle="A few quick steps for a free, tailored estimate. Add photos so we can price it precisely." image={IMAGES.marbleBathroom} />

      <section className="py-14">
        <div className="max-w-2xl mx-auto px-5 lg:px-8">
          {/* Progress */}
          <div className="flex items-center justify-between mb-10" data-testid="quote-progress">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1 flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-all ${i < step ? "glow-btn text-white" : i === step ? "border-2 border-glow-purple text-glow-soft" : "border border-white/15 text-white/40"}`}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-1 ${i < step ? "bg-glow-purple" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>
          <div className="text-center mb-8">
            <span className="overline-label">Step {step + 1} of {STEPS.length}</span>
            <h2 className="font-heading text-2xl font-semibold mt-2">{STEPS[step]}</h2>
          </div>

          <div className="glass-card rounded-3xl p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-5">
                {step === 0 && (
                  <>
                    <Field label="Full Name"><input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Brown" data-testid="quote-name" className={inputCls} /></Field>
                    <Field label="Email"><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" data-testid="quote-email" className={inputCls} /></Field>
                    <Field label="Phone / WhatsApp"><input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 (876) 000-0000" data-testid="quote-phone" className={inputCls} /></Field>
                    <Field label="Preferred Contact Method"><Chips options={CONTACT_METHODS} value={form.preferred_contact} onChange={(v) => set("preferred_contact", v)} testid="quote-contact" /></Field>
                  </>
                )}
                {step === 1 && (
                  <>
                    <Field label="Property Type"><Chips options={GUIDE_OPTIONS.property} value={form.property_type} onChange={(v) => set("property_type", v)} testid="quote-property" /></Field>
                    <Field label="Service Required"><Chips options={SERVICES.map((s) => ({ value: s.slug, label: s.title.split(" ").slice(0, 3).join(" ") }))} value={form.service} onChange={(v) => set("service", v)} testid="quote-service" /></Field>
                    <Field label="Approx. Size"><Chips options={GUIDE_OPTIONS.size} value={form.size} onChange={(v) => set("size", v)} testid="quote-size" /></Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Bedrooms"><input value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} placeholder="e.g. 3" data-testid="quote-bedrooms" className={inputCls} /></Field>
                      <Field label="Bathrooms"><input value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} placeholder="e.g. 2" data-testid="quote-bathrooms" className={inputCls} /></Field>
                    </div>
                    <Field label="Cleaning Frequency"><Chips options={GUIDE_OPTIONS.frequency} value={form.frequency} onChange={(v) => set("frequency", v)} testid="quote-frequency" /></Field>
                  </>
                )}
                {step === 2 && (
                  <>
                    <Field label="Extra Services (optional)"><Chips options={EXTRAS} value={form.extras} onChange={toggleExtra} multi testid="quote-extras" /></Field>
                    <Field label="Additional Requirements / Notes"><textarea rows={5} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Tell us about problem areas, access, pets, or anything special…" data-testid="quote-notes" className={`${inputCls} resize-none`} /></Field>
                  </>
                )}
                {step === 3 && (
                  <>
                    <label className="block border-2 border-dashed border-white/15 rounded-2xl p-10 text-center cursor-pointer hover:border-glow-purple/50 transition-colors" data-testid="quote-upload-label">
                      <input type="file" accept="image/*" multiple className="hidden" onChange={onUpload} data-testid="quote-upload-input" />
                      {uploading ? <Loader2 size={26} className="animate-spin text-glow-soft mx-auto" /> : <Upload size={26} className="text-glow-soft mx-auto" />}
                      <div className="text-sm text-white/70 mt-3 font-medium">{uploading ? "Uploading…" : "Upload photos of your space"}</div>
                      <div className="text-xs text-white/40 mt-1">Optional, but helps us price accurately. JPG / PNG / WEBP.</div>
                    </label>
                    {photos.length > 0 && (
                      <div className="flex flex-wrap gap-3" data-testid="quote-photo-list">
                        {photos.map((p, i) => (
                          <div key={i} className="relative glass-card rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-white/70">
                            <Check size={13} className="text-glow-soft" /> {p.filename?.slice(0, 20) || "Photo"}
                            <button onClick={() => setPhotos((ph) => ph.filter((_, idx) => idx !== i))} className="text-white/40 hover:text-white"><X size={13} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {step === 4 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Preferred Date"><input type="date" value={form.preferred_date} onChange={(e) => set("preferred_date", e.target.value)} data-testid="quote-date" className={`${inputCls} [color-scheme:dark]`} /></Field>
                      <Field label="Preferred Time"><Chips options={["Morning", "Afternoon", "Evening", "Flexible"]} value={form.preferred_time} onChange={(v) => set("preferred_time", v)} testid="quote-time" /></Field>
                    </div>
                    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 mt-2" data-testid="quote-review">
                      <div className="flex items-center gap-2 text-glow-soft text-sm font-medium mb-3"><Sparkles size={15} /> Review</div>
                      <ul className="text-sm text-white/70 space-y-1.5">
                        <li><span className="text-white/40">Name:</span> {form.name || "—"}</li>
                        <li><span className="text-white/40">Contact:</span> {form.email} · {form.phone}</li>
                        <li><span className="text-white/40">Property:</span> {form.property_type} · {form.size}</li>
                        <li><span className="text-white/40">Frequency:</span> {form.frequency}</li>
                        {photos.length > 0 && <li><span className="text-white/40">Photos:</span> {photos.length} attached</li>}
                      </ul>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              {step > 0 ? (
                <button onClick={() => setStep((s) => s - 1)} data-testid="quote-back" className="glass-card inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm text-white/80 hover:text-white"><ArrowLeft size={16} /> Back</button>
              ) : <span />}
              {step < STEPS.length - 1 ? (
                <button onClick={() => canNext() ? setStep((s) => s + 1) : toast.error("Please fill in your name, email and phone.")} data-testid="quote-next" className="glow-btn inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium">Continue <ArrowRight size={16} /></button>
              ) : (
                <button onClick={submit} disabled={submitting} data-testid="quote-submit" className="glow-btn inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium disabled:opacity-60">
                  {submitting ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <><Sparkles size={16} /> Submit Glow Quote™</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Quote;
