import React, { useState } from "react";
import { Phone, Mail, MessageCircle, MapPin, Clock, Instagram, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import PageHero from "@/components/PageHero";
import { Eyebrow } from "@/components/Primitives";
import { BRAND, IMAGES, FAQ_CATEGORIES } from "@/data/site";
import api from "@/lib/api";

const HOURS = [
  { d: "Monday – Friday", h: "8:00 AM – 6:00 PM" },
  { d: "Saturday", h: "9:00 AM – 4:00 PM" },
  { d: "Sunday", h: "By appointment" },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const waMsg = encodeURIComponent("Hi Garwood Glow JA! I'd like to enquire about cleaning.");

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/quotes", {
        name: form.name, email: form.email, phone: "-", property_type: "enquiry",
        notes: form.message, service: "General Enquiry",
      });
      toast.success("Message sent! We'll be in touch within 24 hours.");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div data-testid="contact-page">
      <PageHero eyebrow="Contact" title="Let's make your space glow" subtitle="Reach out for a free quote or any question at all. We respond fast — and we're happy to help." image={IMAGES.estateLivingRoom} />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="glass-card rounded-3xl p-8">
            <Eyebrow>Send a Message</Eyebrow>
            <h2 className="font-heading text-2xl font-semibold mt-3 mb-6">We'd love to hear from you</h2>
            <form onSubmit={submit} className="space-y-4" data-testid="contact-form">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" data-testid="contact-name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-glow-purple" />
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" data-testid="contact-email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-glow-purple" />
              <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" data-testid="contact-message" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-glow-purple resize-none" />
              <button type="submit" disabled={sending} data-testid="contact-submit" className="glow-btn w-full py-3.5 rounded-full text-white font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60">
                <Send size={17} /> {sending ? "Sending…" : "Send Message"}
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div className="grid sm:grid-cols-3 gap-4">
              <a href={`https://wa.me/${BRAND.phoneRaw}?text=${waMsg}`} target="_blank" rel="noreferrer" data-testid="contact-whatsapp" className="glass-card rounded-2xl p-5 text-center hover:border-glow-purple/50 transition-colors">
                <MessageCircle size={22} className="text-glow-soft mx-auto mb-2" />
                <div className="text-sm font-medium">WhatsApp</div>
              </a>
              <a href={`tel:${BRAND.phoneRaw}`} data-testid="contact-call" className="glass-card rounded-2xl p-5 text-center hover:border-glow-purple/50 transition-colors">
                <Phone size={22} className="text-glow-soft mx-auto mb-2" />
                <div className="text-sm font-medium">Call Us</div>
              </a>
              <a href={`mailto:${BRAND.email}`} data-testid="contact-email-btn" className="glass-card rounded-2xl p-5 text-center hover:border-glow-purple/50 transition-colors">
                <Mail size={22} className="text-glow-soft mx-auto mb-2" />
                <div className="text-sm font-medium">Email</div>
              </a>
            </div>

            <div className="glass-card rounded-3xl p-7">
              <h3 className="font-heading text-lg font-semibold mb-4">Business Information</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 text-white/70"><Phone size={16} className="text-glow-soft" /> {BRAND.phone}</li>
                <li className="flex items-center gap-3 text-white/70"><Mail size={16} className="text-glow-soft" /> {BRAND.email}</li>
                <li className="flex items-center gap-3 text-white/70"><Instagram size={16} className="text-glow-soft" /> @garwoodglow.ja</li>
                <li className="flex items-center gap-3 text-white/70"><MapPin size={16} className="text-glow-soft" /> Island-wide, Jamaica</li>
              </ul>
            </div>

            <div className="glass-card rounded-3xl p-7">
              <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2"><Clock size={18} className="text-glow-soft" /> Business Hours</h3>
              <ul className="space-y-2.5 text-sm">
                {HOURS.map((h) => (
                  <li key={h.d} className="flex justify-between text-white/70"><span>{h.d}</span><span className="text-white/50">{h.h}</span></li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="h-44 bg-gradient-to-br from-glow-purple/25 to-transparent flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={28} className="text-glow-soft mx-auto mb-2" />
                  <div className="text-sm text-white/60">Service map · All 14 parishes</div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-7">
              <h3 className="font-heading text-lg font-semibold mb-3">Quick Links</h3>
              <div className="flex flex-wrap gap-2">
                {FAQ_CATEGORIES.slice(0, 4).map((c) => (
                  <Link key={c.category} to="/faq" className="glass-card px-3 py-1.5 rounded-full text-xs text-white/70 hover:text-glow-soft transition-colors">{c.category}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
