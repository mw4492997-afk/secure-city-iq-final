"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Fingerprint, ShieldCheck, Clock3 } from "lucide-react";

interface BiometricLog {
  id: string;
  timestamp: string;
  user: string;
  device: string;
  location: string;
  status: string;
}

export default function BiometricLogsView() {
  const [logs, setLogs] = useState<BiometricLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/biometric-logs");
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load biometric logs");
        }
        setLogs(data.data || []);
      } catch (error) {
        console.error(error);
        toast.error("Unable to fetch biometric logs");
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-y-auto bg-gradient-to-br from-black/40 to-transparent">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--active-neon)] mb-2">
            Biometric Access Audit
          </div>
          <h1 className="text-3xl font-black text-white">Biometric Logs</h1>
          <p className="text-sm text-zinc-500 max-w-2xl mt-2">
            Review recent biometric authentication events and access attempts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-3xl border border-white/10 bg-black/30 px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Total Events</div>
            <div className="text-2xl font-black text-[var(--active-neon)]">{logs.length}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/30 px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Recent Success</div>
            <div className="text-2xl font-black text-emerald-300">{logs.filter((log) => log.status === "Success").length}</div>
          </div>
        </div>
      </div>

      <div className="glass-card border border-[var(--active-neon)]/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.4em] text-[var(--active-neon)]">Live biometric feed</div>
            <p className="text-sm text-zinc-400">Device authentication attempts recorded by the security layer.</p>
          </div>
          <Clock3 className="w-5 h-5 text-[var(--active-neon)]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {loading ? (
            <div className="col-span-2 text-zinc-500">Loading biometric history...</div>
          ) : logs.length === 0 ? (
            <div className="col-span-2 text-zinc-500">No biometric logs available.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="rounded-3xl bg-black/40 border border-white/10 p-4 shadow-[0_0_20px_rgba(0,255,153,0.08)]">
                <div className="flex items-center justify-between mb-3 gap-3">
                  <div>
                    <div className="font-black text-white">{log.user}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">{log.device}</div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.25em] ${
                    log.status === "Success" ? "text-emerald-300" : "text-red-400"
                  }`}>
                    {log.status}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 mb-2">{new Date(log.timestamp).toLocaleString()}</div>
                <div className="text-sm text-zinc-300">{log.location}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/30 p-6 grid gap-4">
        <div className="flex items-center gap-3 text-[var(--active-neon)]">
          <Fingerprint className="w-5 h-5" />
          <h2 className="text-sm font-black uppercase tracking-[0.35em]">Biometric Intelligence</h2>
        </div>
        <div className="text-sm text-zinc-400">
          This section uses backend-supplied biometric events to simulate a secure audit trail. In a production system, events would come from real access terminals and biometric systems, with tamper-proof logging.
        </div>
      </div>
    </div>
  );
}
