"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Zap, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { addAuditLog } from "@/lib/logService";

interface AttackScenario {
  id: string;
  name: string;
  description: string;
  risk: "Low" | "Medium" | "High" | "Critical";
}

const SCENARIOS: AttackScenario[] = [
  {
    id: "sql-injection",
    name: "SQL Injection",
    description: "Test for SQL injection vulnerabilities in input fields.",
    risk: "Critical",
  },
  {
    id: "xss-attack",
    name: "Cross-Site Scripting (XSS)",
    description: "Simulate reflected/stored XSS payload delivery.",
    risk: "High",
  },
  {
    id: "ddos-sim",
    name: "DDoS Simulation",
    description: "Controlled traffic flood to test rate-limiting rules.",
    risk: "High",
  },
  {
    id: "brute-force",
    name: "Brute Force Login",
    description: "Dictionary attack against authentication endpoint.",
    risk: "Medium",
  },
  {
    id: "csrf-test",
    name: "CSRF Token Bypass",
    description: "Attempt state-changing requests without valid tokens.",
    risk: "Medium",
  },
  {
    id: "port-scan",
    name: "Aggressive Port Scan",
    description: "Full TCP/UDP port sweep on target subnet.",
    risk: "Low",
  },
];

export default function AttackSimulation() {
  const [launching, setLaunching] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const handleLaunch = async (scenario: AttackScenario) => {
    setLaunching(scenario.id);

    try {
      // 1. Write to Firebase FIRST
      await addAuditLog(
        scenario.name,
        scenario.risk === "Critical" || scenario.risk === "High" ? "Critical" : "Warning"
      );

      // 2. Simulate attack execution
      await new Promise((r) => setTimeout(r, 1200));

      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] LAUNCHED: ${scenario.name}`,
        ...prev.slice(0, 49),
      ]);

      toast.success(`${scenario.name} launched — log saved to Wasit, Iraq`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to log attack. Check Firebase rules.");
    } finally {
      setLaunching(null);
    }
  };

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-y-auto bg-gradient-to-br from-black/40 to-transparent">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-6 h-6 text-red-400" />
        <div>
          <h1 className="text-2xl font-black text-white">Attack Simulation Lab</h1>
          <p className="text-xs text-zinc-400">
            Launch controlled attack scenarios. Every click is logged to Firebase in real-time.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SCENARIOS.map((s) => (
          <div
            key={s.id}
            className="glass-card border border-white/10 p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">{s.name}</span>
              <span
                className={`text-[10px] uppercase font-black px-2 py-1 rounded-full ${
                  s.risk === "Critical"
                    ? "bg-red-500/20 text-red-300"
                    : s.risk === "High"
                    ? "bg-orange-500/20 text-orange-300"
                    : s.risk === "Medium"
                    ? "bg-yellow-500/20 text-yellow-300"
                    : "bg-emerald-500/20 text-emerald-300"
                }`}
              >
                {s.risk}
              </span>
            </div>
            <p className="text-xs text-zinc-400">{s.description}</p>
            <button
              onClick={() => handleLaunch(s)}
              disabled={launching === s.id}
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-red-300 hover:bg-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {launching === s.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {launching === s.id ? "Logging..." : "Launch"}
            </button>
          </div>
        ))}
      </div>

      {logs.length > 0 && (
        <div className="glass-card border border-[var(--active-neon)]/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-[var(--active-neon)]" />
            <span className="text-xs uppercase tracking-[0.35em] text-[var(--active-neon)] font-black">
              Local Session Log
            </span>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto font-mono text-[11px] text-zinc-300">
            {logs.map((line, i) => (
              <div key={i} className="border-b border-white/5 pb-1">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

