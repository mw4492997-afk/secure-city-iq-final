"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDownSquare,
  Clock3,
  ShieldCheck,
  RefreshCw,
  FileText,
} from "lucide-react";
import { downloadCSV, downloadPDF, downloadXLSX } from "../../lib/fileExport";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";

interface AuditEntry {
  id: string;
  time: string;
  event: string;
  source: string;
  level: string;
  location: string;
}

function formatTime(ts: Timestamp | null | undefined): string {
  if (!ts) return "—";
  const date = ts.toDate();
  return date.toLocaleString();
}

export default function AuditLogsView() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "audit_logs"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const entries: AuditEntry[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            event: data.event || "—",
            source: data.source || "—",
            level: data.level || "Info",
            location: data.location || "Wasit, Iraq",
            time: formatTime(data.timestamp),
          };
        });
        setLogs(entries);
        setLastUpdated(new Date().toLocaleTimeString());
        setLoading(false);
      },
      (error) => {
        console.error("Firebase snapshot error:", error);
        toast.error("Unable to sync audit logs from Firebase");
        setLoading(false);
      }
    );

    return () => unsubscribe();
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
            Centralized audit timeline for security events, authorization
            changes, and system actions. Real-time sync via Firebase.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setLastUpdated(new Date().toLocaleTimeString())}
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
            onClick={() =>
              downloadPDF("audit-logs.pdf", "Audit Log Report", logs)
            }
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
              <span className="text-xs uppercase tracking-[0.4em] text-[var(--active-neon)]">
                Summary
              </span>
              <div className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-1">
                {lastUpdated
                  ? `Last updated ${lastUpdated}`
                  : "Loading..."}
              </div>
            </div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">
              Live
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-white">Total events</span>
              <span className="text-lg font-bold text-[var(--active-neon)]">
                {logs.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-white">
                Critical alerts
              </span>
              <span className="text-lg font-bold text-red-400">
                {
                  logs.filter(
                    (log) =>
                      log.level === "Critical" || log.level === "Alert"
                  ).length
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-white">
                Sources tracked
              </span>
              <span className="text-lg font-bold text-cyan-300">
                {new Set(logs.map((log) => log.source)).size}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card border border-white/10 p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.4em] text-[var(--active-neon)]">
                Live Timeline
              </div>
              <p className="text-sm text-zinc-400">
                Latest security audit events from the platform.
              </p>
            </div>
            <Clock3 className="w-5 h-5 text-[var(--active-neon)]" />
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[80px_1fr_120px_100px_80px] gap-3 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black border-b border-white/10 mb-2">
            <span>ID</span>
            <span>Event</span>
            <span>Time</span>
            <span>Source</span>
            <span>Level</span>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-2">
            {loading ? (
              <div className="text-zinc-500 text-sm py-4">Loading audit events...</div>
            ) : logs.length === 0 ? (
              <div className="text-zinc-500 text-sm py-4">
                No audit events available.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-[80px_1fr_120px_100px_80px] gap-3 items-center rounded-2xl bg-black/40 border border-white/5 px-4 py-3"
                >
                  <span className="text-[10px] font-mono text-zinc-400 truncate">
                    {log.id.slice(0, 8)}
                  </span>
                  <span className="text-sm font-bold text-white truncate">
                    {log.event}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {log.time}
                  </span>
                  <span className="text-[10px] text-zinc-400 truncate">
                    {log.source}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-[0.25em] ${
                      log.level === "Critical" || log.level === "Alert"
                        ? "text-red-400"
                        : log.level === "Warning"
                        ? "text-orange-300"
                        : "text-cyan-300"
                    }`}
                  >
                    {log.level}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

