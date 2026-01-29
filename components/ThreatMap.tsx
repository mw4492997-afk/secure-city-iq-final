"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const nodes = [
  { id: 1, x: "25%", y: "35%", label: "Sector 4", intensity: "Low" },
  { id: 2, x: "45%", y: "25%", label: "Core Node", intensity: "Critical" },
  { id: 3, x: "65%", y: "45%", label: "Data Vault", intensity: "Medium" },
  { id: 4, x: "35%", y: "65%", label: "Comm Tower", intensity: "Low" },
  { id: 5, x: "75%", y: "25%", label: "Edge Gateway", intensity: "High" },
];

export default function ThreatMap() {
  const [activeAttacks, setActiveAttacks] = useState<{ id: number; from: number; to: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const from = Math.floor(Math.random() * nodes.length);
      const to = Math.floor(Math.random() * nodes.length);
      if (from !== to) {
        const id = Date.now();
        setActiveAttacks((prev) => [...prev, { id, from, to }]);
        setTimeout(() => {
          setActiveAttacks((prev) => prev.filter((a) => a.id !== id));
        }, 2000);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-video glass-card rounded-2xl overflow-hidden border border-[var(--active-neon)]/20">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full cyber-grid" />
      </div>

      <div className="absolute top-4 left-4 z-20">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono font-bold text-[var(--active-neon)] uppercase tracking-widest">Global Intelligence Hub</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono text-zinc-400">Live Attack Vectors</span>
          </div>
        </div>
      </div>

      <svg className="w-full h-full" viewBox="0 0 1000 600">
        <defs>
          <radialGradient id="nodeGradient">
            <stop offset="0%" stopColor="var(--active-neon)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--active-neon)" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Attack Lines */}
        {activeAttacks.map((attack) => {
          const start = nodes[attack.from];
          const end = nodes[attack.to];
          return (
            <motion.path
              key={attack.id}
              d={`M ${start.x} ${start.y} Q 500 300 ${end.x} ${end.y}`}
              fill="none"
              stroke="var(--active-neon)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r="4"
              fill="var(--active-neon)"
              filter="url(#glow)"
            />
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="12"
              stroke="var(--active-neon)"
              strokeWidth="0.5"
              fill="none"
              animate={{ r: [8, 16], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <text
              x={node.x}
              y={node.y}
              dy="-15"
              textAnchor="middle"
              className="fill-zinc-500 text-[8px] font-mono uppercase tracking-tighter"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <div className="glass-card px-3 py-1 text-[8px] font-mono text-[var(--active-neon)]">
          LATENCY: 12ms
        </div>
        <div className="glass-card px-3 py-1 text-[8px] font-mono text-[var(--active-neon)]">
          ENCRYPTION: AES-256
        </div>
      </div>
    </div>
  );
}
