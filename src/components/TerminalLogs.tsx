"use client";

import { useEffect, useState, useRef } from "react";

const PROCESSES = [
  "INITIALIZING HYPER-V VIRTUALIZATION...",
  "ESTABLISHING VPN TUNNEL: SINGAPORE-NODE-1",
  "SCANNING PACKET ENCAPSULATION ERRORS...",
  "THREAT DETECTED: BRUTE_FORCE_AUTH on NODE-77-X",
  "DECRYPTING TLS 1.3 HANDSHAKE DATA...",
  "BYPASSING HONEYPOT TRAP IN SECTOR 9...",
  "LOGGING METRICS TO ELASTICSEARCH CLUSTER...",
  "ENCRYPTING PAYLOAD WITH SHA-512...",
  "QUERYING DISTRIBUTED LEDGER FOR VALIDATION...",
  "ANOMALY DETECTED: ARP_SPOOFING IN SUBNET 192.168.4.0/24",
  "LOAD BALANCING TRAFFIC TO BACKUP GATEWAY...",
  "RECALIBRATING NEURAL SYNAPSE LATENCY...",
  "FIREWALL RULES UPDATED: BLOCKING IP 45.22.11.9",
  "INTRUSION PREVENTION SYSTEM: ACTIVE",
  "BUFFER OVERFLOW PROTECTION: ENABLED"
];

export default function TerminalLogs({ onEmergency, onLogsUpdate }: { onEmergency?: () => void; onLogsUpdate?: (logs: string[]) => void }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const newLog = `[${timestamp}] INFO: ${PROCESSES[Math.floor(Math.random() * PROCESSES.length)]}`;
      setLogs(prev => [...prev.slice(-30), newLog]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check for Supabase project ID and display connection message
    const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
    if (projectId) {
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const connectionLog = `[${timestamp}] SUCCESS: DATABASE CONNECTED - Project ID: ${projectId}`;
      setLogs(prev => [...prev.slice(-30), connectionLog]);
    }
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (onLogsUpdate) {
      onLogsUpdate(logs);
    }
  }, [logs, onLogsUpdate]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let response = "";

    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();

    if (command === "scan_url") {
      const url = parts.slice(1).join(' ').trim();
      if (!url) {
        response = "ERR: Please provide a URL after SCAN_URL.";
      } else {
        try {
          const res = await fetch('/api/scan-vulnerability', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
          });
          const data = await res.json();
          if (res.ok) {
            response = `NMAP SCAN RESULTS FOR ${data.url}:\n`;
            response += `SEVERITY: ${data.severity}\n`;
            if (data.ssl_info.valid) {
              response += `SSL: VALID (Issuer: ${data.ssl_info.issuer.O || 'Unknown'}, Expiry: ${data.ssl_info.expiry})\n`;
            } else {
              response += `SSL: INVALID\n`;
            }
            if (data.ssl_info.issues.length > 0) {
              response += `SSL ISSUES: ${data.ssl_info.issues.join(', ')}\n`;
            }
            response += `OPEN PORTS: ${data.open_ports.join(', ') || 'None detected by Nmap'}\n`;
            if (data.vulnerabilities.length > 0) {
              response += `VULNERABILITIES: ${data.vulnerabilities.join('; ')}\n`;
            } else {
              response += `VULNERABILITIES: None detected\n`;
            }
            if (data.security_headers.missing_critical.length > 0) {
              response += `MISSING SECURITY HEADERS: ${data.security_headers.missing_critical.join('; ')}\n`;
            }

            // Save to Supabase
            try {
              await fetch('/api/security-reports', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  title: `Security Scan: ${data.url}`,
                  description: `Automated security scan completed`,
                  severity: data.severity,
                  category: 'Vulnerability Scan',
                  timestamp: new Date().toISOString(),
                  details: data
                }),
              });
              response += `REPORT SAVED: Institutional Security Report stored in database\n`;
            } catch (saveError) {
              response += `WARNING: Could not save report to database\n`;
            }
          } else {
            response = `ERR: ${data.error}`;
          }
        } catch (error) {
          response = `ERR: Failed to connect to scan service: ${error instanceof Error ? error.message : String(error)}`;
        }
      }
    } else {
      switch (cmd) {
        case "help":
          response = "COMMANDS: SCAN, NET_STAT, CLEAR, VERSION, LOCKDOWN, REBOOT, SCAN_URL <url>";
          break;
        case "scan":
          response = "Scanning ports 1-1024... 80/tcp OPEN, 443/tcp OPEN, 22/tcp CLOSED.";
          break;
        case "net_stat":
          response = "ESTABLISHED: 14 | TIME_WAIT: 3 | SYN_SENT: 1 | STATUS: SECURE";
          break;
        case "clear":
          setLogs([]);
          setInput("");
          return;
        case "version":
          response = "SECURE_OS v4.0.2 Stable Build 9928-ALPHA";
          break;
        case "lockdown":
          response = "CRITICAL: LOCKDOWN PROTOCOL INITIATED. ALL PORTS CLOSED.";
          if (onEmergency) onEmergency();
          break;
        default:
          response = `ERR: Command '${cmd}' not found. Type HELP for manual.`;
      }
    }

    setLogs(prev => [...prev, `root@secure-city:~$ ${input}`, `[${timestamp}] CMD_RESP: ${response}`]);
    setInput("");
  };

  return (
    <div
      className="fixed bottom-0 left-0 w-full z-40 bg-black/95 backdrop-blur-xl border-t border-[var(--active-neon)]/40 p-3 font-mono text-[10px] text-[var(--active-neon)] max-h-48 overflow-hidden flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
    >
      <div className="flex items-center justify-between mb-2 opacity-50 border-b border-[var(--active-neon)]/10 pb-1">
        <span className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--active-neon)] animate-pulse" />
          SYSTEM CONSOLE v4.0.2
        </span>
        <span className="text-[8px] uppercase tracking-tighter">Connection: Encrypted (TLS 1.3)</span>
      </div>
      <div
        ref={containerRef}
        className="overflow-y-auto mb-2 flex-grow custom-scrollbar"
      >
        <div className="flex flex-col gap-0.5">
          {logs.map((log, i) => (
            <div key={i} className={log.includes("~$") ? "text-white font-bold" : log.includes("ERR:") ? "text-red-500" : log.includes("INFO:") ? "text-[var(--active-neon)]/80" : log.includes("NMAP SCAN RESULTS") ? "text-green-400 font-bold" : log.includes("SUCCESS:") ? "text-green-400 font-bold" : ""}>
              {log}
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleCommand} className="flex items-center gap-2 pt-2">
        <span className="text-[var(--active-neon)] font-bold">root@secure-city:~$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="bg-transparent border-none outline-none flex-grow text-white placeholder-[var(--active-neon)]/20"
          autoFocus
          spellCheck={false}
          placeholder="Enter command..."
        />
      </form>
    </div>
  );
}
