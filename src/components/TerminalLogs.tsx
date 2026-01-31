"use client";

import { useState } from 'react';

interface LogEntry {
  command: string;
  response: string;
}

export default function TerminalLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
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
    setLogs(prev => [...prev, { command, response }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(currentCommand);
      setCurrentCommand('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-green-400 font-mono p-4">
      <div className="flex-1 overflow-y-auto mb-4">
        {logs.map((log, index) => (
          <div key={index} className="mb-2">
            <div className="text-blue-400">{`> ${log.command}`}</div>
            <div>{log.response}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center">
        <span className="text-green-400 mr-2">{'>'}</span>
        <input
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-green-400"
          placeholder="Type a command..."
        />
      </div>
    </div>
  );
}
