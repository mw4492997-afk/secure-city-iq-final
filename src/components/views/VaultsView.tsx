"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Key, ShieldCheck, Lock, Unlock } from "lucide-react";

interface VaultEntry {
  id: string;
  name: string;
  type: string;
  status: string;
  owner: string;
  expires: string;
  lastUsed: string;
  access_policy: string;
}

export default function VaultsView() {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadVaults = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/vaults");
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load vault entries");
        }
        setEntries(data.data || []);
      } catch (error) {
        console.error(error);
        toast.error("Unable to fetch vault keys");
      } finally {
        setLoading(false);
      }
    };

    loadVaults();
  }, []);

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-y-auto bg-gradient-to-br from-black/40 to-transparent">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--active-neon)] mb-2">
            Keys & Vaults Module
          </div>
          <h1 className="text-3xl font-black text-white">Secure Key Vaults</h1>
          <p className="text-sm text-zinc-500 max-w-2xl mt-2">
            Manage secret keys and encryption vaults with an access policy-focused interface.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-300">
          Active Vaults: <span className="font-black text-[var(--active-neon)]">{entries.length}</span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {loading ? (
          <div className="glass-card border border-[var(--active-neon)]/20 p-6 text-zinc-500">Loading vault entries...</div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="glass-card border border-white/10 p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.35em] text-zinc-500">{entry.name}</div>
                  <div className="text-xl font-black text-white">{entry.type}</div>
                </div>
                <div className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.3em] font-black ${
                  entry.status === 'Active'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : entry.status === 'Locked'
                    ? 'bg-yellow-500/15 text-yellow-300'
                    : 'bg-red-500/15 text-red-300'
                }`}>
                  {entry.status}
                </div>
              </div>
              <div className="flex flex-col gap-3 text-sm text-zinc-400">
                <div>Owner: <span className="text-zinc-200">{entry.owner}</span></div>
                <div>Policy: <span className="text-zinc-200">{entry.access_policy}</span></div>
                <div>Expires: <span className="text-zinc-200">{entry.expires}</span></div>
                <div>Last used: <span className="text-zinc-200">{new Date(entry.lastUsed).toLocaleString()}</span></div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveKey(entry.id === activeKey ? null : entry.id)}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-white/10 bg-white/5 text-sm text-white hover:bg-white/10 transition"
                >
                  {entry.id === activeKey ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {entry.id === activeKey ? "Hide Secret" : "Reveal Policy"}
                </button>
                <button
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-[var(--active-neon)] bg-[var(--active-neon)]/10 text-sm text-[var(--active-neon)] hover:bg-[var(--active-neon)]/15 transition"
                >
                  <Key className="w-4 h-4" /> Rotate Key
                </button>
              </div>
              {entry.id === activeKey && (
                <div className="mt-5 rounded-3xl border border-white/10 bg-black/50 p-4 text-[11px] text-zinc-300">
                  <div className="font-black text-[var(--active-neon)]">Vault Secret Policy</div>
                  <p className="mt-3 text-zinc-400">This vault requires admin confirmation plus secondary biometric verification to access the raw key material. Actual secrets are stored encrypted and are not visible in plaintext.</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/30 p-6 text-sm text-zinc-400">
        <div className="flex items-center gap-3 mb-3 text-[var(--active-neon)] uppercase tracking-[0.35em] font-black">
          <ShieldCheck className="w-4 h-4" /> Key Security Notes
        </div>
        <div>All vault entries are simulated for the dashboard. In production the vault store should use a hardware security module (HSM) or a dedicated secrets manager.</div>
      </div>
    </div>
  );
}
