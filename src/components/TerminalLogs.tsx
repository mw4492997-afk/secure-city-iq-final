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
  t?: Record<string, string>;
  language?: 'en' | 'ar';
}

export default function TerminalLogs({ logs = [], onEmergency, osintResults, isScanning, isProcessingTool, t }: TerminalLogsProps) {
  return (
    <div className="flex-1 bg-black border border-green-400/50 rounded-lg p-4 overflow-hidden">
      <div className="h-full overflow-y-auto scroll-mt-10 scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-black" ref={(el) => {
        if (el) el.scrollTop = el.scrollHeight;
      }}>
{logs.map((log, index) => {
            const timeMatch = log.match(/\[([0-9]{1,2}:[0-9]{2}:[0-9]{2})\]/);
            const time = timeMatch ? timeMatch[1] : new Date().toLocaleTimeString('en-US', {hour12: false}).slice(11, 19);
            const content = log.replace(/^\[[^\]]+\]\s*/, '');
            
            let colorClass = 'text-green-400';
            if (content.includes('NETWORK_SCAN') || content.includes('Identified')) colorClass = 'text-green-400';
            else if (content.includes('Uptime') || content.includes('Firewall')) colorClass = 'text-cyan-400';
            else if (content.includes('anomaly') || content.includes('threat') || content.includes('ERROR')) colorClass = 'text-red-400';
            else if (content.includes('new device') || content.includes('detected')) colorClass = 'text-yellow-400';
            
            return (
              <div key={index} className={`mb-2 font-mono text-sm ${colorClass}`}>
                <pre className="whitespace-pre-wrap">[{time}] {content}</pre>
              </div>
            );
          })}

        {/* OSINT Scanning Progress */}
        {isScanning && (
          <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="text-blue-400 font-mono text-sm mb-2">{t?.initializingOsintSearch || 'INITIALIZING OSINT SEARCH...'}</div>
            <div className="space-y-1">
              <div className="text-green-400 font-mono text-xs">✓ {t?.accessingGlobalDatabases || 'Accessing Global Databases...'}</div>
              <div className="text-green-400 font-mono text-xs">✓ {t?.checkingSocialMediaNodes || 'Checking Social Media Nodes...'}</div>
              <div className="text-yellow-400 font-mono text-xs animate-pulse">⟳ {t?.scanningTargetProfiles || 'Scanning Target Profiles...'}</div>
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
