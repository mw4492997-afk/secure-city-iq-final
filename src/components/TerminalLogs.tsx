"use client";

interface OSINTResult {
  platform: string;
  found: boolean;
  url?: string;
  error?: string;
}

interface TerminalLogsProps {
  logs?: string[];
  onEmergency?: () => void;
  osintResults?: OSINTResult[] | null;
  isScanning?: boolean;
  isProcessingTool?: boolean;
}

export default function TerminalLogs({ logs = [], onEmergency, osintResults, isScanning, isProcessingTool }: TerminalLogsProps) {
  return (
    <div className="flex-1 bg-black border border-green-400/50 rounded-lg p-4 overflow-hidden">
      <div className="h-full overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index} className="mb-2 text-green-400 font-mono text-sm">
            <pre className="whitespace-pre-wrap">{log}</pre>
          </div>
        ))}

        {/* OSINT Scanning Progress */}
        {isScanning && (
          <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="text-blue-400 font-mono text-sm mb-2">INITIALIZING OSINT SEARCH...</div>
            <div className="space-y-1">
              <div className="text-green-400 font-mono text-xs">✓ Accessing Global Databases...</div>
              <div className="text-green-400 font-mono text-xs">✓ Checking Social Media Nodes...</div>
              <div className="text-yellow-400 font-mono text-xs animate-pulse">⟳ Scanning Target Profiles...</div>
            </div>
          </div>
        )}

        {/* Tool Processing Animation */}
        {isProcessingTool && (
          <div className="mb-4 p-4 bg-[var(--active-neon)]/10 border border-[var(--active-neon)]/30 rounded-lg">
            <div className="text-[var(--active-neon)] font-mono text-sm mb-2 animate-pulse">PROCESSING...</div>
            <div className="space-y-1">
              <div className="text-green-400 font-mono text-xs">✓ Initializing Tool...</div>
              <div className="text-green-400 font-mono text-xs">✓ Connecting to Target...</div>
              <div className="text-yellow-400 font-mono text-xs animate-pulse">⟳ Executing Scan...</div>
            </div>
          </div>
        )}

        {/* OSINT Results */}
        {osintResults && (
          <div className="mb-4 p-4 bg-zinc-900/50 border border-zinc-700/50 rounded-lg">
            <div className="text-cyan-400 font-mono text-sm mb-4 font-bold">OSINT SCAN RESULTS:</div>
            <div className="space-y-2">
              {osintResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between font-mono text-sm">
                  <span className="text-zinc-300">{result.platform}:</span>
                  <div className="flex items-center gap-2">
                    {result.found ? (
                      <>
                        <span className="text-green-400 font-bold">FOUND</span>
                        {result.url && (
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline text-xs"
                          >
                            LINK
                          </a>
                        )}
                      </>
                    ) : (
                      <span className="text-red-400 font-bold">NOT FOUND</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
