import React from "react";
import { motion } from "framer-motion";
import { Eyebrow } from "@/components/Primitives";

const PageHero = ({ eyebrow, title, subtitle, image }) => (
  <section className="relative pt-40 pb-16 overflow-hidden grain" data-testid="page-hero">
    {image && (
      <div className="absolute inset-0">
        <img src={image} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0C]/80 to-[#0A0A0C]" />
      </div>
    )}
    <div className="absolute inset-0 ambient-glow" />
    <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mt-5 leading-tight">{title}</h1>
        {subtitle && <p className="text-lg text-white/60 mt-5 max-w-2xl leading-relaxed">{subtitle}</p>}
      </motion.div>
    </div>
  </section>
);

export default PageHero;
