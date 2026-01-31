"use client";

interface TerminalLogsProps {
  logs?: string[];
  onEmergency?: () => void;
}

export default function TerminalLogs({ logs = [], onEmergency }: TerminalLogsProps) {
  return (
    <div className="flex-1 bg-black border border-green-400/50 rounded-lg p-4 overflow-hidden">
      <div className="h-full overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index} className="mb-2 text-green-400 font-mono text-sm">
            <pre className="whitespace-pre-wrap">{log}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
