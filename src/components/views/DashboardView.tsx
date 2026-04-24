"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import NodeTopology from "@/components/NodeTopology";
import TerminalLogs from "@/components/TerminalLogs";
import RadarHUD from "@/components/RadarHUD";
import SecurityCharts from "@/components/SecurityCharts";

interface DashboardViewProps {
  consoleLogs: string[];
  setConsoleLogs: (logs: string[]) => void;
  onEmergency: () => void;
}

export default function DashboardView({
  consoleLogs,
  setConsoleLogs,
  onEmergency,
}: DashboardViewProps) {
  const [threatData, setThreatData] = useState<any[]>([
    { id: 1, type: "DDoS Attempt", origin: "RU_NODE_X", severity: "High", time: "2s ago" },
    { id: 2, type: "SQL Injection", origin: "CN_PROXY_0", severity: "Medium", time: "15s ago" },
    { id: 3, type: "Brute Force", origin: "UNKNOWN_IP", severity: "Low", time: "1m ago" },
    { id: 4, type: "Malware Payload", origin: "DE_STUTTGART", severity: "High", time: "5s ago" },
  ]);

  const [showTerminal, setShowTerminal] = useState(false);

  const handleThreatClick = (threat: any) => {
    setShowTerminal(true);
    // Add log when clicking on threat
    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false }).slice(11, 19);
    setConsoleLogs((prev) => [
      ...prev.slice(-25),
      `[${timestamp}] THREAT ANALYZED: ${threat.type} from ${threat.origin}`,
    ]);
  };

  // Real-time threat simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const threatTypes = [
        "DDoS Attempt",
        "SQL Injection",
        "Brute Force",
        "Malware Payload",
        "Port Scan",
        "XSS Attack",
      ];
      const severities = ["High", "Medium", "Low"];
      const origins = ["RU_NODE_X", "CN_PROXY_0", "US_DATACENTER", "JP_SERVER", "EU_EDGE"];

      const newThreat = {
        id: Math.floor(Math.random() * 10000),
        type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
        origin: origins[Math.floor(Math.random() * origins.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        time: "now",
      };

      setThreatData((prev) => [newThreat, ...prev.slice(0, 3)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-black/40 to-transparent p-6 gap-4 overflow-hidden">
      {/* Radar and System Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Radar HUD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 glass-card border border-[var(--active-neon)]/30 rounded-3xl overflow-hidden"
        >
          <div className="relative w-full h-full bg-black/60 backdrop-blur-xl">
            <div className="absolute inset-0 flex items-center justify-center">
              <RadarHUD threats={threatData} />
            </div>
          </div>
        </motion.div>

        {/* Threat Information Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card border border-[var(--active-neon)]/30 rounded-3xl p-6 overflow-y-auto space-y-4"
        >
          <div className="text-xs font-black uppercase tracking-widest text-[var(--active-neon)] mb-4">
            Active Threats
          </div>
          {threatData.map((threat, idx) => (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-[var(--active-neon)]/50 transition-all cursor-pointer group"
              onClick={() => handleThreatClick(threat)}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-black text-white truncate">
                  {threat.type}
                </span>
                <span
                  className={`text-[9px] font-black px-2 py-1 rounded-full ${
                    threat.severity === "High"
                      ? "bg-red-500/30 text-red-200"
                      : threat.severity === "Medium"
                      ? "bg-yellow-500/30 text-yellow-200"
                      : "bg-green-500/30 text-green-200"
                  }`}
                >
                  {threat.severity}
                </span>
              </div>
              <div className="text-[9px] text-zinc-400">
                <div>Origin: {threat.origin}</div>
                <div>Time: {threat.time}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Terminal Logs at bottom - shown when pressing buttons */}
      {showTerminal && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-48"
        >
          <TerminalLogs
            logs={consoleLogs}
            onEmergency={onEmergency}
            osintResults={null}
            isScanning={false}
            isProcessingTool={false}
          />
        </motion.div>
      )}
    </div>
  );
}
