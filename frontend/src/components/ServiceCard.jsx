import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";
import * as Icons from "lucide-react";
import { IMAGES } from "@/data/site";

const ServiceCard = ({ service, index }) => {
  const Icon = Icons[service.icon] || Icons.Sparkles;
  return (
    <Link
      to={`/services/${service.slug}`}
      data-testid={`service-card-${service.slug}`}
      className="group relative rounded-3xl overflow-hidden glass-card hover:border-glow-purple/50 transition-all duration-500"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={IMAGES[service.image]}
          alt={service.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/40 to-transparent" />
        <div className="absolute top-4 left-4 h-11 w-11 rounded-xl glass-card flex items-center justify-center text-glow-soft">
          <Icon size={20} />
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-heading text-xl font-semibold text-white leading-snug group-hover:text-glow-soft transition-colors">
          {service.title}
        </h3>
        <p className="text-sm text-white/55 mt-2 leading-relaxed">{service.short}</p>
        <ul className="mt-4 space-y-2">
          {service.includes.slice(0, 3).map((inc, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-white/60">
              <Check size={13} className="text-glow-soft shrink-0" /> {inc}
            </li>
          ))}
        </ul>
        <div className="mt-5 inline-flex items-center gap-1.5 text-sm text-glow-soft font-medium">
          Learn More <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
