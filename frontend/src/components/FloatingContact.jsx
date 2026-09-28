import React, { useState } from "react";
import { MessageCircle, Phone, X, Plus } from "lucide-react";
import { BRAND } from "@/data/site";

const FloatingContact = () => {
  const [open, setOpen] = useState(false);
  const waMsg = encodeURIComponent("Hi Garwood Glow JA! I'd like to request a Glow Quote™.");

  return (
    <div className="fixed bottom-20 right-6 z-40 flex flex-col items-end gap-3" data-testid="floating-contact">
      {open && (
        <>
          <a
            href={`https://wa.me/${BRAND.phoneRaw}?text=${waMsg}`}
            target="_blank"
            rel="noreferrer"
            data-testid="whatsapp-button"
            className="glass-card flex items-center gap-2 pl-4 pr-5 py-3 rounded-full text-sm text-white hover:border-glow-purple transition-colors"
          >
            <MessageCircle size={18} className="text-glow-soft" /> WhatsApp
          </a>
          <a
            href={`tel:${BRAND.phoneRaw}`}
            data-testid="call-button"
            className="glass-card flex items-center gap-2 pl-4 pr-5 py-3 rounded-full text-sm text-white hover:border-glow-purple transition-colors"
          >
            <Phone size={17} className="text-glow-soft" /> Call
          </a>
        </>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Contact options"
        data-testid="floating-contact-toggle"
        className="glow-btn h-14 w-14 rounded-full flex items-center justify-center text-white"
      >
        {open ? <X size={22} /> : <Plus size={22} />}
      </button>
    </div>
  );
};

export default FloatingContact;
