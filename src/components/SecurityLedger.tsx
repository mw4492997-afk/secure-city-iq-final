"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface LedgerEntry {
  id: string;
  time: string;
  event: string;
  status: "Success" | "Blocked" | "Complete" | "Stored" | "Critical";
}

const EVENTS = [
  { event: "Handshake Protocol", status: "Success" },
  { event: "IP Block: 45.22.11", status: "Blocked" },
  { event: "Node Sync", status: "Complete" },
  { event: "Database Backup", status: "Stored" },
  { event: "SSH Attempt", status: "Blocked" },
  { event: "Firewall Update", status: "Success" },
  { event: "Packet Filter", status: "Complete" },
  { event: "Intrusion Alert", status: "Critical" },
];

export default function SecurityLedger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([
    { id: "1", time: "12:44", event: "Handshake Protocol", status: "Success" },
    { id: "2", time: "12:40", event: "IP Block: 45.22.11", status: "Blocked" },
    { id: "3", time: "12:35", event: "Node Sync", status: "Complete" },
    { id: "4", time: "12:30", event: "Database Backup", status: "Stored" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const newEntry: LedgerEntry = {
        id: Date.now().toString(),
        time,
        event: randomEvent.event,
        status: randomEvent.status as any,
      };

      setEntries((prev) => [newEntry, ...prev.slice(0, 7)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-6 flex flex-col gap-6 flex-grow min-h-[400px]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black tracking-widest uppercase flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          Security Ledger
        </h3>
        <span className="text-[10px] font-mono text-[var(--active-neon)] animate-pulse">Live Audit</span>
      </div>
      
      <div className="flex flex-col gap-1 overflow-hidden">
        <AnimatePresence initial={false}>
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className="flex items-center justify-between py-2 border-b border-white/5 text-[10px] font-mono"
            >
              <span className="text-zinc-500 w-12">{entry.time}</span>
              <span className="text-zinc-300 uppercase flex-grow px-4">{entry.event}</span>
              <span className={`w-16 text-right ${
                entry.status === "Blocked" || entry.status === "Critical" 
                  ? "text-red-500" 
                  : entry.status === "Success" || entry.status === "Complete"
                  ? "text-[var(--active-neon)]"
                  : "text-blue-400"
              }`}>
                {entry.status}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button className="mt-auto w-full py-3 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
        Export Audit Log
      </button>
    </div>
  );
}
