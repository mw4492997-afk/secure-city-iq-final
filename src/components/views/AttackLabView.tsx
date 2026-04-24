"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Zap, Activity, ShieldCheck } from "lucide-react";

interface AttackScenario {
  id: string;
  title: string;
  vector: string;
  description: string;
  risk: string;
  status: string;
}

interface AttackResult {
  id: string;
  scenarioId: string;
  title: string;
  vector: string;
  executedAt: string;
  status: string;
  detail: string;
}

export default function AttackLabView() {
  const [scenarios, setScenarios] = useState<AttackScenario[]>([]);
  const [history, setHistory] = useState<AttackResult[]>([]);
  const [running, setRunning] = useState<string | null>(null);

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const response = await fetch("/api/attack-lab");
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load attack scenarios");
        }
        setScenarios(data.data || []);
        setHistory(data.history || []);
      } catch (error) {
        console.error(error);
        toast.error("Unable to load attack lab data");
      }
    };

    loadScenarios();
  }, []);

  const launchScenario = async (scenarioId: string) => {
    setRunning(scenarioId);
    try {
      const response = await fetch("/api/attack-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to execute scenario");
      }
      setHistory(data.history || []);
      toast.success(`Scenario launched: ${data.result.status}`);
    } catch (error) {
      console.error(error);
      toast.error("Attack execution failed");
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-y-auto bg-gradient-to-br from-black/40 to-transparent">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--active-neon)] mb-2">
            Simulated Attack Lab
          </div>
          <h1 className="text-3xl font-black text-white">Attack Simulation</h1>
          <p className="text-sm text-zinc-500 max-w-2xl mt-2">
            Launch controlled red-team scenarios and observe containment status.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-300">
          Scenarios: <span className="font-black text-[var(--active-neon)]">{scenarios.length}</span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="glass-card border border-white/10 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.35em] text-zinc-500">{scenario.vector}</div>
                <div className="text-xl font-black text-white">{scenario.title}</div>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.35em] font-black ${
                scenario.risk === "High"
                  ? "bg-red-500/15 text-red-300"
                  : scenario.risk === "Medium"
                  ? "bg-orange-500/15 text-orange-300"
                  : "bg-emerald-500/15 text-emerald-300"
              }`}>
                {scenario.risk}
              </span>
            </div>
            <div className="text-sm text-zinc-400">{scenario.description}</div>
            <button
              onClick={() => launchScenario(scenario.id)}
              disabled={Boolean(running)}
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--active-neon)] bg-[var(--active-neon)]/10 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-[var(--active-neon)] hover:bg-[var(--active-neon)]/15 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Zap className="w-4 h-4" /> {running === scenario.id ? "Launching..." : "Launch"}
            </button>
          </div>
        ))}
      </div>

      <div className="glass-card border border-[var(--active-neon)]/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs uppercase tracking-[0.4em] text-[var(--active-neon)]">Execution History</div>
            <p className="text-sm text-zinc-400">Recent attack simulation outcomes and defense responses.</p>
          </div>
          <ShieldCheck className="w-5 h-5 text-[var(--active-neon)]" />
        </div>

        {history.length === 0 ? (
          <div className="text-zinc-500">No attack simulations executed yet.</div>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="rounded-3xl bg-black/40 border border-white/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-white">{entry.title}</div>
                    <div className="text-[11px] text-zinc-500">{new Date(entry.executedAt).toLocaleString()}</div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-[0.35em] font-black ${
                    entry.status === "SUCCESS" ? "text-emerald-300" : "text-yellow-300"
                  }`}>
                    {entry.status}
                  </span>
                </div>
                <div className="mt-3 text-sm text-zinc-400">{entry.detail}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/30 p-6 text-sm text-zinc-400">
        <div className="flex items-center gap-3 mb-3 text-[var(--active-neon)] uppercase tracking-[0.35em] font-black">
          <Activity className="w-4 h-4" /> Attack Lab Guidance
        </div>
        <div>
          Simulated attacks are controlled exercises designed to validate detection and containment paths. Use this lab to verify that threat telemetry and defensive responses are working together.
        </div>
      </div>
    </div>
  );
}
