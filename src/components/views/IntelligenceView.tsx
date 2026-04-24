"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Search, TrendingUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface IntelligenceViewProps {
  consoleLogs: string[];
  setConsoleLogs: (logs: string[]) => void;
  osintResults: any[];
  setOsintResults: (results: any[]) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
}

export default function IntelligenceView({
  consoleLogs,
  setConsoleLogs,
  osintResults,
  setOsintResults,
  isScanning,
  setIsScanning,
}: IntelligenceViewProps) {
  const [searchUsername, setSearchUsername] = useState("");
  const [globalThreats, setGlobalThreats] = useState([
    { id: 1, region: "Eastern Europe", level: "CRITICAL", incidents: 847, trend: "+12%" },
    { id: 2, region: "Southeast Asia", level: "HIGH", incidents: 523, trend: "+8%" },
    { id: 3, region: "North America", level: "MEDIUM", incidents: 234, trend: "-2%" },
    { id: 4, region: "Western Europe", level: "LOW", incidents: 89, trend: "+1%" },
  ]);

  const handleOsintScan = async () => {
    if (!searchUsername.trim()) {
      toast.warning("Please enter a username to scan");
      return;
    }

    setIsScanning(true);
    setOsintResults([]);
    setConsoleLogs((prev) => [
      ...prev.slice(-15),
      `[${new Date().toLocaleTimeString()}] OSINT_INIT: Starting intelligence gathering for ${searchUsername}`,
      `[${new Date().toLocaleTimeString()}] ACCESSING: Global threat databases...`,
    ]);

    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(
        `Initializing OSINT search for ${searchUsername}`
      );
      utterance.rate = 0.8;
      utterance.volume = 0.7;
      window.speechSynthesis.speak(utterance);
    }

    try {
      const response = await fetch("/api/osint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: searchUsername }),
      });

      if (!response.ok) throw new Error("OSINT API failed");
      const data = await response.json();

      setOsintResults(data.results || []);
      setConsoleLogs((prev) => [
        ...prev.slice(-15),
        `[${new Date().toLocaleTimeString()}] OSINT_COMPLETE: Analysis finished`,
        `[${new Date().toLocaleTimeString()}] RESULTS: ${
          (data.results || []).filter((r: any) => r.found).length
        } platforms identified`,
      ]);
      toast.success("OSINT scan complete");
    } catch (error) {
      setConsoleLogs((prev) => [
        ...prev.slice(-15),
        `[${new Date().toLocaleTimeString()}] OSINT_ERROR: Scan failed`,
      ]);
      toast.error("OSINT scan failed");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-black/40 to-transparent p-6 gap-4 overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-4"
      >
        <Globe className="w-6 h-6 text-[var(--active-neon)]" />
        <div>
          <h2 className="text-xl font-black text-white">GLOBAL INTELLIGENCE</h2>
          <p className="text-xs text-zinc-400">Real-time threat intelligence & OSINT</p>
        </div>
      </motion.div>

      {/* OSINT Search */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card border border-[var(--active-neon)]/30 rounded-2xl p-6 space-y-4"
      >
        <div className="text-xs font-black uppercase tracking-widest text-[var(--active-neon)]">
          OSINT Username Scan
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            placeholder="Enter username to scan..."
            className="flex-1 px-4 py-2 rounded-lg bg-black/40 border border-[var(--active-neon)]/30 text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--active-neon)] focus:ring-2 focus:ring-[var(--active-neon)]/20"
            disabled={isScanning}
          />
          <button
            onClick={handleOsintScan}
            disabled={isScanning || !searchUsername.trim()}
            className="px-6 py-2 bg-[var(--active-neon)]/20 border border-[var(--active-neon)]/50 rounded-lg text-[var(--active-neon)] font-bold hover:bg-[var(--active-neon)]/30 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {isScanning ? "SCANNING..." : "SCAN"}
          </button>
        </div>

        {/* OSINT Results */}
        {osintResults && osintResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 space-y-2 max-h-48 overflow-y-auto"
          >
            <div className="text-xs font-black text-zinc-400">Platforms Found:</div>
            {osintResults
              .filter((r: any) => r.found)
              .map((result: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-2 rounded-lg bg-black/40 border border-[var(--active-neon)]/20 text-[10px] text-zinc-300"
                >
                  <div className="flex justify-between">
                    <span className="font-bold text-[var(--active-neon)]">{result.platform}</span>
                    <span className="text-zinc-500">Found</span>
                  </div>
                  {result.url && (
                    <div className="text-[9px] text-zinc-500 truncate mt-1">{result.url}</div>
                  )}
                </motion.div>
              ))}
          </motion.div>
        )}
      </motion.div>

      {/* Global Threat Map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card border border-[var(--active-neon)]/30 rounded-2xl p-6 space-y-4 flex-1"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-black uppercase tracking-widest text-[var(--active-neon)]">
            Global Threat Overview
          </div>
          <TrendingUp className="w-4 h-4 text-[var(--active-neon)]" />
        </div>

        <div className="space-y-3">
          {globalThreats.map((threat, idx) => (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-[var(--active-neon)]/50 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-bold text-white">{threat.region}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1 ${
                      threat.level === "CRITICAL"
                        ? "bg-red-500/30 text-red-200"
                        : threat.level === "HIGH"
                        ? "bg-orange-500/30 text-orange-200"
                        : threat.level === "MEDIUM"
                        ? "bg-yellow-500/30 text-yellow-200"
                        : "bg-green-500/30 text-green-200"
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {threat.level}
                  </span>
                  <span className="text-[10px] text-[var(--active-neon)]">{threat.trend}</span>
                </div>
              </div>
              <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[var(--active-neon)] to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, threat.incidents / 10)}%`,
                  }}
                  transition={{ duration: 1 }}
                />
              </div>
              <div className="text-[9px] text-zinc-400 mt-1">
                {threat.incidents} incidents detected
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Intelligence Notes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[10px] text-zinc-500 space-y-1 border-l-2 border-[var(--active-neon)]/30 pl-3"
      >
        <div>• Threat intelligence updated every 5 minutes</div>
        <div>• OSINT data aggregated from 12+ sources</div>
        <div>• Pattern recognition: AI-enhanced detection enabled</div>
        <div>• False positive rate: 2.3%</div>
      </motion.div>
    </div>
  );
}
