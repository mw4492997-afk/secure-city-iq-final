"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowDownSquare, Clock3, ShieldCheck, RefreshCw, FileText } from "lucide-react";
import { downloadCSV, downloadPDF, downloadXLSX } from "@/lib/fileExport";

interface AuditEntry {
  id: string;
  time: string;
  event: string;
  source: string;
  level: string;
}

export default function AuditLogsView() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/audit-logs");
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load audit logs");
      }
      setLogs(data.data || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error(error);
      toast.error("Unable to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-y-auto bg-gradient-to-br from-black/40 to-transparent">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--active-neon)] mb-2">
            Audit Logs Dashboard
          </div>
          <h1 className="text-3xl font-black text-white">System Audit Logs</h1>
          <p className="text-sm text-zinc-500 max-w-2xl mt-2">
            Centralized audit timeline for security events, authorization changes, and system actions.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadLogs}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white hover:bg-white/10 transition"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => downloadCSV("audit-logs.csv", logs)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[var(--active-neon)]/10 border border-[var(--active-neon)]/30 rounded-2xl text-sm text-[var(--active-neon)] hover:bg-[var(--active-neon)]/15 transition"
          >
            <ArrowDownSquare className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => downloadXLSX("audit-logs.xlsx", logs)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[var(--active-neon)]/10 border border-[var(--active-neon)]/30 rounded-2xl text-sm text-[var(--active-neon)] hover:bg-[var(--active-neon)]/15 transition"
          >
            <FileText className="w-4 h-4" /> Export XLSX
          </button>
          <button
            onClick={() => downloadPDF("audit-logs.pdf", "Audit Log Report", logs)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[var(--active-neon)]/10 border border-[var(--active-neon)]/30 rounded-2xl text-sm text-[var(--active-neon)] hover:bg-[var(--active-neon)]/15 transition"
          >
            <ShieldCheck className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="glass-card border border-[var(--active-neon)]/20 p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-[0.4em] text-[var(--active-neon)]">Summary</span>
              <div className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-1">
                {lastUpdated ? `Last updated ${lastUpdated}` : "Loading..."}
              </div>
            </div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">Live</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-white">Total events</span>
              <span className="text-lg font-bold text-[var(--active-neon)]">{logs.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-white">Critical alerts</span>
              <span className="text-lg font-bold text-red-400">{logs.filter((log) => log.level === "Critical" || log.level === "Alert").length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-white">Sources tracked</span>
              <span className="text-lg font-bold text-cyan-300">{new Set(logs.map((log) => log.source)).size}</span>
            </div>
          </div>
        </div>

        <div className="glass-card border border-white/10 p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.4em] text-[var(--active-neon)]">Live Timeline</div>
              <p className="text-sm text-zinc-400">Latest security audit events from the platform.</p>
            </div>
            <Clock3 className="w-5 h-5 text-[var(--active-neon)]" />
          </div>
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
            {logs.length === 0 ? (
              <div className="text-zinc-500 text-sm">No audit events available.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="rounded-3xl bg-black/40 border border-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-white">{log.event}</div>
                      <div className="text-[11px] text-zinc-500 mt-2">{log.source}</div>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${
                      log.level === "Critical" || log.level === "Alert"
                        ? "text-red-400"
                        : log.level === "Warning"
                        ? "text-orange-300"
                        : "text-cyan-300"
                    }`}>
                      {log.level}
                    </span>
                  </div>
                  <div className="mt-3 text-[10px] text-zinc-500">{new Date(log.time).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
