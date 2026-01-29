"use client";

import { useEffect, useState, useRef } from "react";

const PROCESSES = [
  "INITIALIZING HYPER-V PROTOCOLS...",
  "CONNECTING TO GLOBAL NODE NETWORK...",
  "SCANNING URBAN INFRASTRUCTURE...",
  "THREAT DETECTED: NODE-77-X",
  "DECRYPTING ENCRYPTED DATA STREAM...",
  "BYPASSING SECURE FIREWALL...",
  "UPLOADING DIAGNOSTIC LOGS...",
  "ESTABLISHING SECURE CONNECTION...",
  "QUERYING BLOCKCHAIN LEDGER...",
  "ANOMALY DETECTED IN GRID SECTOR 4",
  "OPTIMIZING DATA THROUGHPUT...",
  "RECALIBRATING NEURAL INTERFACE..."
];

export default function TerminalLogs() {
  const [logs, setLogs] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const interval = setInterval(() => {
        const newLog = `[${new Date().toLocaleTimeString()}] ${PROCESSES[Math.floor(Math.random() * PROCESSES.length)]}`;
        setLogs(prev => [...prev.slice(-10), newLog]);
      }, 150);

      return () => clearInterval(interval);
    }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div 
      ref={containerRef}
      className="terminal-container fixed bottom-0 left-0 w-full z-20"
    >
      <div className="flex flex-col gap-1">
        {logs.map((log, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
