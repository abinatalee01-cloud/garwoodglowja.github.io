import React from "react";
import PageHero from "@/components/PageHero";

const SECTIONS = [
  { h: "Information We Collect", p: "When you request a Glow Quote™, contact us, or use the AI Glow Guide™, we may collect your name, email, phone number, property details, scheduling preferences and any photos you choose to upload." },
  { h: "How We Use Your Information", p: "We use your information solely to prepare accurate quotes, schedule and deliver services, communicate with you, and improve our offerings. We never sell your personal data." },
  { h: "Photo Uploads", p: "Photos submitted with a quote request are used only to assess your space and prepare a tailored estimate. They are stored securely and are not shared publicly without your consent." },
  { h: "Data Security", p: "We take reasonable technical and organisational measures to protect your information against unauthorised access, loss or misuse." },
  { h: "Your Rights", p: "You may request access to, correction of, or deletion of your personal information at any time by contacting us at garwoodglowja@gmail.com." },
  { h: "Contact", p: "For any privacy questions, reach us at garwoodglowja@gmail.com." },
];

const Privacy = () => (
  <div data-testid="privacy-page">
    <PageHero eyebrow="Legal" title="Privacy Policy" subtitle="Your trust matters. Here's how we handle your information." />
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-5 lg:px-8 space-y-8">
        {SECTIONS.map((s) => (
          <div key={s.h}>
            <h2 className="font-heading text-xl font-semibold mb-2">{s.h}</h2>
            <p className="text-white/60 leading-relaxed">{s.p}</p>
          </div>
        ))}
        <p className="text-white/40 text-sm pt-4">Last updated: June 2026</p>
      </div>
    </section>
  </div>
);

export default Privacy;
