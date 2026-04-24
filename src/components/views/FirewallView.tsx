"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Lock, TrendingUp, Zap } from "lucide-react";
import { toast } from "sonner";

interface FirewallViewProps {
  consoleLogs: string[];
  setConsoleLogs: (logs: string[]) => void;
}

export default function FirewallView({
  consoleLogs,
  setConsoleLogs,
}: FirewallViewProps) {
  const [firewallStats, setFirewallStats] = useState({
    blockedToday: 1247,
    threatsBlocked: 89,
    rulesActive: 2847,
    uptime: "99.99%",
  });

  const [recentBlocks, setRecentBlocks] = useState<any[]>([
    {
      id: 1,
      type: "DDoS Attempt",
      ip: "185.12.4.92",
      severity: "High",
      blocked: true,
      time: "2s ago",
    },
    {
      id: 2,
      type: "Brute Force",
      ip: "203.0.113.1",
      severity: "High",
      blocked: true,
      time: "12s ago",
    },
    {
      id: 3,
      type: "Port Scan",
      ip: "198.51.100.1",
      severity: "Medium",
      blocked: true,
      time: "45s ago",
    },
  ]);

  // Simulate firewall blocks
  useEffect(() => {
    const interval = setInterval(() => {
      const maliciousIPs = [
        "185.12.4.92",
        "203.0.113.1",
        "198.51.100.1",
        "192.0.2.1",
        "10.0.0.1",
        "172.16.0.1",
      ];
      const threatTypes = [
        "DDoS Attempt",
        "SQL Injection",
        "Brute Force",
        "Port Scan",
        "XSS Attack",
        "Directory Traversal",
      ];
      const severities = ["High", "Medium", "Low"];

      const newBlock = {
        id: Math.floor(Math.random() * 100000),
        type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
        ip: maliciousIPs[Math.floor(Math.random() * maliciousIPs.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        blocked: true,
        time: "now",
      };

      setRecentBlocks((prev) => [newBlock, ...prev.slice(0, 9)]);
      setFirewallStats((prev) => ({
        ...prev,
        blockedToday: prev.blockedToday + 1,
      }));

      setConsoleLogs((prev) => [
        ...prev.slice(-15),
        `[${new Date().toLocaleTimeString()}] FIREWALL_BLOCK: ${newBlock.type} from ${newBlock.ip} - ${newBlock.severity} threat neutralized`,
      ]);

      if (newBlock.severity === "High" && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(
          `High threat blocked from ${newBlock.ip}`
        );
        utterance.rate = 0.9;
        utterance.pitch = 0.7;
        utterance.volume = 0.6;
        window.speechSynthesis.speak(utterance);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [setConsoleLogs]);

  const handleUpdateRules = () => {
    toast.promise(
      new Promise((resolve) =>
        setTimeout(() => {
          setConsoleLogs((prev) => [
            ...prev.slice(-15),
            `[${new Date().toLocaleTimeString()}] FIREWALL: Updating rules from rule database...`,
            `[${new Date().toLocaleTimeString()}] FIREWALL: +23 new rules added, 5 deprecated rules removed`,
            `[${new Date().toLocaleTimeString()}] FIREWALL: Total rules now: ${firewallStats.rulesActive}`,
          ]);
          resolve(true);
        }, 2000)
      ),
      {
        loading: "Updating firewall rules...",
        success: "Rules updated successfully",
        error: "Failed to update rules",
      }
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-black/40 to-transparent p-6 gap-4 overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <ShieldAlert className="w-6 h-6 text-[var(--active-neon)]" />
        <div>
          <h2 className="text-xl font-black text-white">ACTIVE FIREWALL</h2>
          <p className="text-xs text-zinc-400">Multi-layer protection system</p>
        </div>
      </motion.div>

      {/* Firewall Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Blocked Today",
            value: firewallStats.blockedToday,
            icon: ShieldAlert,
            delay: 0,
          },
          {
            label: "Threats Mitigated",
            value: firewallStats.threatsBlocked,
            icon: Lock,
            delay: 0.1,
          },
          {
            label: "Rules Active",
            value: firewallStats.rulesActive,
            icon: TrendingUp,
            delay: 0.2,
          },
          {
            label: "System Uptime",
            value: firewallStats.uptime,
            icon: Zap,
            delay: 0.3,
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
              className="glass-card border border-[var(--active-neon)]/30 rounded-xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  {stat.label}
                </span>
                <Icon className="w-4 h-4 text-[var(--active-neon)]" />
              </div>
              <div className="text-2xl font-black text-[var(--active-neon)]">
                {stat.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Blocks */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card border border-[var(--active-neon)]/30 rounded-2xl p-6 space-y-4 flex-1"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-black uppercase tracking-widest text-[var(--active-neon)]">
            Recent Blocks
          </div>
          <button
            onClick={handleUpdateRules}
            className="text-[9px] px-3 py-1 bg-[var(--active-neon)]/20 border border-[var(--active-neon)]/50 rounded-full text-[var(--active-neon)] hover:bg-[var(--active-neon)]/30 transition-all"
          >
            Update Rules
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {recentBlocks.map((block, idx) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-3 rounded-lg bg-black/40 border border-white/10 hover:border-[var(--active-neon)]/50 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-sm font-bold text-white mb-1">
                    {block.type}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    FROM: {block.ip}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-black px-2 py-1 rounded-full ${
                      block.severity === "High"
                        ? "bg-red-500/30 text-red-200"
                        : block.severity === "Medium"
                        ? "bg-yellow-500/30 text-yellow-200"
                        : "bg-green-500/30 text-green-200"
                    }`}
                  >
                    {block.severity}
                  </span>
                  <span className="text-[9px] text-[var(--active-neon)]">
                    {block.time}
                  </span>
                </div>
              </div>
              <div className="w-full h-1 bg-gradient-to-r from-red-500/30 to-transparent rounded-full" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Firewall Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card border border-[var(--active-neon)]/30 rounded-xl p-4 space-y-2"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-black text-white">
            FIREWALL STATUS: OPERATIONAL
          </span>
        </div>
        <div className="text-[9px] text-zinc-400 space-y-1">
          <div>• All security layers active</div>
          <div>• Real-time intrusion prevention: ENABLED</div>
          <div>• Zero-day protection: ACTIVE</div>
          <div>• Threat intelligence feeds: SYNCHRONIZED</div>
        </div>
      </motion.div>
    </div>
  );
}
