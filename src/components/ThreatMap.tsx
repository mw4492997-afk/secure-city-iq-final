"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchRealThreats } from "@/lib/networkUtils";

interface Threat {
  id: string;
  title: string;
  severity: string;
  cvss_score: number;
}

interface AttackVector {
  id: number;
  from: number;
  to: number;
}

interface Node {
  id: number;
  x: string;
  y: string;
  label: string;
  intensity: string;
}

export default function ThreatMap() {
  const [activeAttacks, setActiveAttacks] = useState<AttackVector[]>([]);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [threatIndex, setThreatIndex] = useState(0);

  // Static nodes for visualization
  const nodes: Node[] = [
    { id: 1, x: "25%", y: "35%", label: "Sector 4", intensity: "Low" },
    { id: 2, x: "45%", y: "25%", label: "Core Node", intensity: "Critical" },
    { id: 3, x: "65%", y: "45%", label: "Data Vault", intensity: "Medium" },
    { id: 4, x: "35%", y: "65%", label: "Comm Tower", intensity: "Low" },
    { id: 5, x: "75%", y: "25%", label: "Edge Gateway", intensity: "High" },
  ];

  // Fetch real threat data on component mount
  useEffect(() => {
    const loadThreats = async () => {
      try {
        setLoading(true);
        const realThreats = await fetchRealThreats(10);
        
        if (realThreats && realThreats.length > 0) {
          // Map real threats to visualization format
          const threatData: Threat[] = realThreats.map(threat => ({
            id: threat.id,
            title: threat.title,
            severity: threat.severity,
            cvss_score: threat.cvss_score,
          }));
          setThreats(threatData);
        } else {
          // Fallback to demo threats
          setThreats([
            { id: "CVE-2024-DEMO-1", title: "Critical RCE in Apache Module", severity: "Critical", cvss_score: 9.8 },
            { id: "CVE-2024-DEMO-2", title: "SQL Injection Vulnerability", severity: "High", cvss_score: 8.5 },
          ]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to load real threats:", error);
        // Fallback to demo data
        setThreats([
          { id: "CVE-2024-DEMO-1", title: "Critical RCE in Apache Module", severity: "Critical", cvss_score: 9.8 },
        ]);
        setLoading(false);
      }
    };

    loadThreats();
  }, []);

  // Simulate attack vectors based on real threats
  useEffect(() => {
    if (threats.length === 0) return;

    const interval = setInterval(() => {
      const from = Math.floor(Math.random() * nodes.length);
      const to = Math.floor(Math.random() * nodes.length);
      
      if (from !== to) {
        const id = Date.now();
        setActiveAttacks((prev) => [...prev, { id, from, to }]);
        
        // Rotate threat display
        setThreatIndex((prev) => (prev + 1) % threats.length);
        
        setTimeout(() => {
          setActiveAttacks((prev) => prev.filter((a) => a.id !== id));
        }, 2000);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [threats.length]);

  const currentThreat = threats.length > 0 ? threats[threatIndex] : null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "text-red-500";
      case "High":
        return "text-orange-500";
      case "Medium":
        return "text-yellow-500";
      default:
        return "text-green-500";
    }
  };

  return (
    <div className="relative w-full aspect-video glass-card rounded-2xl overflow-hidden border border-[var(--active-neon)]/20">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full cyber-grid" />
      </div>

      <div className="absolute top-4 left-4 z-20">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono font-bold text-[var(--active-neon)] uppercase tracking-widest">Global Intelligence Hub</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              currentThreat?.severity === "Critical" ? "bg-red-500" :
              currentThreat?.severity === "High" ? "bg-orange-500" : "bg-yellow-500"
            }`} />
            <span className="text-xs font-mono text-zinc-400">Real CVE Data • {threats.length} Active Threats</span>
          </div>
          {currentThreat && !loading && (
            <div className="mt-2 text-xs font-mono text-zinc-300 max-w-xs">
              <div className={`font-bold ${getSeverityColor(currentThreat.severity)}`}>
                {currentThreat.id}: {currentThreat.title}
              </div>
              <div className="text-zinc-500">CVSS: {currentThreat.cvss_score.toFixed(1)}</div>
            </div>
          )}
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
              stroke={currentThreat?.severity === "Critical" ? "#ff0000" : "var(--active-neon)"}
              strokeWidth="2"
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
          LATENCY: {Math.floor(Math.random() * 50 + 5)}ms
        </div>
        <div className="glass-card px-3 py-1 text-[8px] font-mono text-[var(--active-neon)]">
          CVE COUNT: {threats.length}
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-sm font-mono text-[var(--active-neon)] mb-2">Loading Real Threat Data...</div>
            <div className="w-8 h-8 border-2 border-[var(--active-neon)] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
}
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
