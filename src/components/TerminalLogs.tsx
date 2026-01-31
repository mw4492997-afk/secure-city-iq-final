"use client";

import { useState } from 'react';

interface LogEntry {
  command: string;
  response: string;
}

export default function TerminalLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const handleCommand = async (command: string) => {
    let response = '';
    switch (command) {
      case "net_stat":
        try {
          const netStatResponse = await fetch('/api/net-stat');
          const netData = await netStatResponse.json();
          if (netStatResponse.ok) {
            response = `IP: ${netData.ip} | LOCATION: ${netData.city}, ${netData.country} | TIMEZONE: ${netData.timezone} | STATUS: ${netData.network_status}`;
          } else {
            response = "ERR: Failed to retrieve network statistics";
          }
        } catch (error) {
          response = "ERR: Network statistics unavailable";
        }
        break;
      default:
        response = "Unknown command";
    }
    setLogs(prev => [...prev, { command, response }]);
  };

  return (
    <div>
      {/* Render logs here */}
    </div>
  );
}
