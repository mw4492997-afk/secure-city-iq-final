"use client";

import { useState } from 'react';

interface TerminalLogsProps {
  onEmergency?: () => void;
  onLogsUpdate?: (logs: string[]) => void;
}

export default function TerminalLogs({ onEmergency, onLogsUpdate }: TerminalLogsProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');

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
    const newLog = `> ${command}\n${response}`;
    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);
    if (onLogsUpdate) {
      onLogsUpdate(updatedLogs);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(currentCommand);
      setCurrentCommand('');
    }
  };

  return (
    <div className="terminal-container z-50">
      <div className="flex-1 overflow-y-auto mb-4">
        {logs.map((log, index) => (
          <div key={index} className="mb-2 text-[var(--active-neon)]">
            <pre className="whitespace-pre-wrap">{log}</pre>
          </div>
        ))}
      </div>
      <div className="flex items-center">
        <span className="text-[var(--active-neon)] mr-2">{'>'}</span>
        <input
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-[var(--active-neon)] z-50"
          placeholder="Type a command..."
        />
      </div>
    </div>
  );
}
