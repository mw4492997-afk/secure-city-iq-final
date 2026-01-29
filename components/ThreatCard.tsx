"use client";

import { useState } from "react";

interface ThreatCardProps {
  title: string;
  level: string;
  description: string;
}

export default function ThreatCard({ title, level, description }: ThreatCardProps) {
  const [glitch, setGlitch] = useState(false);

  const handleClick = () => {
    setGlitch(true);
    setTimeout(() => setGlitch(false), 300);
  };

  const hexData = Array.from({ length: 20 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(' ');

  return (
    <div
      onClick={handleClick}
      className={`glass-card p-6 rounded-xl cursor-pointer select-none group relative overflow-hidden ${glitch ? 'glitch-effect' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold neon-text">{title}</h3>
        <span className="text-[10px] px-2 py-1 rounded border border-[var(--active-neon)]/30 text-[var(--active-neon)] uppercase tracking-tighter">
          {level}
        </span>
      </div>
      
      <p className="text-sm text-[var(--active-neon)]/70 mb-6 leading-relaxed">
        {description}
      </p>

      <div className="mt-auto pt-4 border-t border-[var(--active-neon)]/10">
        <div className="hex-data-stream uppercase tracking-widest text-[9px]">
          {hexData}
        </div>
      </div>

      {/* Hover corner decoration */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[var(--active-neon)]/0 group-hover:border-[var(--active-neon)]/50 transition-all duration-300" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[var(--active-neon)]/0 group-hover:border-[var(--active-neon)]/50 transition-all duration-300" />
    </div>
  );
}
