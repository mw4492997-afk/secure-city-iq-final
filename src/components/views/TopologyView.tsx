"use client";

import { motion } from "framer-motion";
import { Network } from "lucide-react";
import NodeTopology from "@/components/NodeTopology";

interface TopologyViewProps {
  consoleLogs: string[];
  setConsoleLogs: (logs: string[]) => void;
  t: Record<string, string>;
  language: 'en' | 'ar';
}

export default function TopologyView({
  consoleLogs,
  setConsoleLogs,
  t,
  language,
}: TopologyViewProps) {
  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-black/40 to-transparent p-6 gap-4 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Network className="w-6 h-6 text-[var(--active-neon)]" />
        <div>
          <h2 className="text-xl font-black text-white bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{t.topologyTitle}</h2>
          <p className="text-xs text-cyan-300">{t.topologySubtitle}</p>
        </div>
      </motion.div>

      {/* Network Topology Visualization - Full Screen */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 glass-card border border-[var(--active-neon)]/30 rounded-3xl overflow-hidden min-h-0"
      >
        <NodeTopology t={t} language={language} />
      </motion.div>
    </div>
  );
}
