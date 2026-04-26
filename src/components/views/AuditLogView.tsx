"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Clock3, MapPin, ShieldCheck, Activity } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";

interface AuditLog {
  id: string;
  event: string;
  level: string;
  location: string;
  timestamp: Timestamp | null;
}

function formatTime(ts: Timestamp | null): string {
  if (!ts) return "—";
  return ts.toDate().toLocaleString();
}

export default function AuditLogView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    const q = query(
      collection(db, "audit_logs"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const entries: AuditLog[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            event: data.event || "—",
            level: data.level || "Info",
            location: data.location || "Wasit, Iraq",
            timestamp: data.timestamp || null,
          };
        });
        setLogs(entries);
        setLastUpdated(new Date().toLocaleTimeString());
        setLoading(false);
      },
      (err) => {
        console.error("onSnapshot error:", err);
        toast.error("Firebase sync failed. Check rules / connection.");
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
            Real-Time Audit Dashboard
          </div>
          <h1 className="text-3xl font-black text-white">Audit Logs</h1>
          <p className="text-sm text-zinc-500 max-w-2xl mt-2">
            Live stream of security events from Wasit, Iraq. Data syncs instantly via Firebase.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-3xl border border-cyan-500/20 bg-black/30 px-4 py-2 text-xs text-cyan-200">
          <Activity className="w-3 h-3 animate-pulse" />
          {lastUpdated ? `Synced at ${lastUpdated}` : "Connecting..."}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Summary Panel */}
        <div className="glass-card border border-[var(--active-neon)]/20 p-5 space-y-4">
          <div className="text-xs uppercase tracking-[0.4em] text-[var(--active-neon)] font-black">
            Summary
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-white">Total Events</span>
              <span className="text-lg font-bold text-[var(--active-neon)]">
                {logs.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-white">Critical</span>
              <span className="text-lg font-bold text-red-400">
                {logs.filter((l) => l.level === "Critical" || l.level === "Alert").length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-white">Warnings</span>
              <span className="text-lg font-bold text-orange-300">
                {logs.filter((l) => l.level === "Warning").length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-white">Location</span>
              <span className="flex items-center gap-1 text-xs text-cyan-300">
                <MapPin className="w-3 h-3" /> Wasit, Iraq
              </span>
            </div>
          </div>
        </div>

        {/* Live Table */}
        <div className="glass-card border border-white/10 p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.4em] text-[var(--active-neon)] font-black">
                Live Timeline
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Newest events appear at the top automatically.
              </p>
            </div>
            <Clock3 className="w-5 h-5 text-[var(--active-neon)]" />
          </div>

          {/* Header */}
          <div className="grid grid-cols-[100px_1fr_140px_100px_80px] gap-3 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black border-b border-white/10 mb-2">
            <span>ID</span>
            <span>Event</span>
            <span>Time</span>
            <span>Location</span>
            <span>Level</span>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-zinc-500 text-sm py-6 text-center">
                Loading audit events from Firebase...
              </div>
            ) : logs.length === 0 ? (
              <div className="text-zinc-500 text-sm py-6 text-center">
                No logs yet. Launch an attack simulation to see your first real-time log from Wasit, Iraq!
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-[100px_1fr_140px_100px_80px] gap-3 items-center rounded-2xl bg-black/40 border border-white/5 px-3 py-3 hover:border-cyan-500/20 transition"
                >
                  <span className="text-[10px] font-mono text-zinc-400 truncate">
                    {log.id.slice(0, 8)}
                  </span>
                  <span className="text-sm font-bold text-white truncate">
                    {log.event}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {formatTime(log.timestamp)}
                  </span>
                  <span className="text-[10px] text-cyan-300 truncate">
                    {log.location}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-[0.25em] ${
                      log.level === "Critical" || log.level === "Alert"
                        ? "text-red-400"
                        : log.level === "Warning"
                        ? "text-orange-300"
                        : "text-emerald-300"
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

