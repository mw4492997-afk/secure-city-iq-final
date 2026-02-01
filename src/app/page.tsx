"use client";

import { useState, useEffect } from "react";
import RadarHUD from "@/components/RadarHUD";
import TerminalLogs from "@/components/TerminalLogs";
import SecurityPortal from "@/components/SecurityPortal";
import { Toaster, toast } from "sonner";
import { Shield, Lock, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import CyberPulse from "@/components/CyberPulse";

export default function Home() {
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [command, setCommand] = useState("");
  const [redAlert, setRedAlert] = useState(false);
  const [scanTarget, setScanTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-emergency", emergency.toString());
  }, [emergency]);

  useEffect(() => {
    const authStatus = localStorage.getItem("authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    // Simulate scrolling logs
    const interval = setInterval(() => {
      const newLog = `[${new Date().toLocaleTimeString()}] System activity: Threat neutralized`;
      setConsoleLogs(prev => [...prev.slice(-9), newLog]); // Keep last 10 logs
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAccessGranted = () => {
    setIsAuthenticated(true);
    localStorage.setItem("authenticated", "true");
  };

  const handleActivateLockdown = () => {
    setRedAlert(!redAlert);
    document.documentElement.setAttribute("data-red-alert", redAlert.toString());
    if (!redAlert) {
      toast.error("RED ALERT ACTIVATED - Lockdown Protocol Engaged");
      // Simulate lockdown actions
      setConsoleLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] ALERT: Lockdown protocol initiated`, `[${new Date().toLocaleTimeString()}] ALERT: All systems secured`]);
    } else {
      toast.success("Lockdown deactivated - Returning to normal operations");
      setConsoleLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] STATUS: Lockdown protocol deactivated`]);
    }
  };

  const handleSystemReports = async () => {
    toast.info("Generating system reports...");
    // Simulate report generation
    setTimeout(() => {
      toast.success("System reports generated successfully");
      setConsoleLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] REPORT: System diagnostics completed`, `[${new Date().toLocaleTimeString()}] REPORT: All systems operational`]);
    }, 2000);
  };

  const handleSystemDocuments = () => {
    toast.info("Accessing system documentation...");
    // Simulate document access
    setTimeout(() => {
      toast.success("System documentation loaded");
      setConsoleLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] DOCS: Security protocols accessed`, `[${new Date().toLocaleTimeString()}] DOCS: Threat response manual loaded`]);
    }, 1500);
  };

  const handleQuickScan = async () => {
    if (!scanTarget.trim()) return;

    setIsScanning(true);
    toast.info(`Scanning ${scanTarget}...`);

    try {
      const response = await fetch('/api/scan-vulnerability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: scanTarget.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setScanResult(data);
        setConsoleLogs(prev => [...prev.slice(-7),
          `[${new Date().toLocaleTimeString()}] QUICKSCAN: Initiating scan on ${scanTarget}`,
          `[${new Date().toLocaleTimeString()}] QUICKSCAN: Security level: ${data.severity}`,
          `[${new Date().toLocaleTimeString()}] QUICKSCAN: Open ports: ${data.open_ports.length}`,
          `[${new Date().toLocaleTimeString()}] QUICKSCAN: Vulnerabilities: ${data.vulnerabilities.length}`,
          `[${new Date().toLocaleTimeString()}] QUICKSCAN: Scan completed successfully`
        ]);
        toast.success(`Scan completed for ${scanTarget}`);
      } else {
        throw new Error(data.error || "Scan failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConsoleLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] ERROR: Quick scan failed - ${errorMessage}`]);
      toast.error("Scan failed");
    } finally {
      setIsScanning(false);
    }
  };

  const handleCommand = async (cmd: string) => {
    const command = cmd.trim().toLowerCase();

    if (command.startsWith('scan ')) {
      const target = command.replace('scan ', '');
      toast.info(`Scanning ${target}...`);

      try {
        const response = await fetch('/api/scan-vulnerability', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: target }),
        });

        const data = await response.json();

        if (response.ok) {
          setConsoleLogs(prev => [...prev.slice(-7),
            `[${new Date().toLocaleTimeString()}] SCAN: Initiating scan on ${target}`,
            `[${new Date().toLocaleTimeString()}] SCAN: Security level: ${data.severity}`,
            `[${new Date().toLocaleTimeString()}] SCAN: Open ports: ${data.open_ports.length}`,
            `[${new Date().toLocaleTimeString()}] SCAN: Vulnerabilities: ${data.vulnerabilities.length}`,
            `[${new Date().toLocaleTimeString()}] SCAN: Scan completed successfully`
          ]);
          toast.success(`Scan completed for ${target}`);
        } else {
          throw new Error(data.error || "Scan failed");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setConsoleLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] ERROR: Scan failed - ${errorMessage}`]);
        toast.error("Scan failed");
      }
    } else if (command.startsWith('portscan ') || command.startsWith('pscan ')) {
      const target = command.replace(/^(portscan|pscan) /, '');
      toast.info(`Port scanning ${target}...`);

      // Simulate port scanning
      setTimeout(() => {
        const mockPorts = [22, 80, 443, 8080, 3306];
        setConsoleLogs(prev => [...prev.slice(-6),
          `[${new Date().toLocaleTimeString()}] PORTSCAN: Initiating port scan on ${target}`,
          `[${new Date().toLocaleTimeString()}] PORTSCAN: Scanning common ports...`,
          `[${new Date().toLocaleTimeString()}] PORTSCAN: Open ports found: ${mockPorts.join(', ')}`,
          `[${new Date().toLocaleTimeString()}] PORTSCAN: Services detected: SSH, HTTP, HTTPS, HTTP-ALT, MySQL`,
          `[${new Date().toLocaleTimeString()}] PORTSCAN: Port scan completed`
        ]);
        toast.success(`Port scan completed for ${target}`);
      }, 3000);
    } else if (command.startsWith('nmap ')) {
      const target = command.replace('nmap ', '');
      toast.info(`Running Nmap on ${target}...`);

      // Simulate nmap scan
      setTimeout(() => {
        setConsoleLogs(prev => [...prev.slice(-8),
          `[${new Date().toLocaleTimeString()}] NMAP: Starting Nmap 7.94 scan on ${target}`,
          `[${new Date().toLocaleTimeString()}] NMAP: Host is up (0.025s latency)`,
          `[${new Date().toLocaleTimeString()}] NMAP: PORT     STATE  SERVICE  VERSION`,
          `[${new Date().toLocaleTimeString()}] NMAP: 22/tcp   open   ssh      OpenSSH 8.9p1`,
          `[${new Date().toLocaleTimeString()}] NMAP: 80/tcp   open   http     Apache httpd 2.4.52`,
          `[${new Date().toLocaleTimeString()}] NMAP: 443/tcp  open   https    Apache httpd 2.4.52`,
          `[${new Date().toLocaleTimeString()}] NMAP: Nmap scan completed`
        ]);
        toast.success(`Nmap scan completed for ${target}`);
      }, 4000);
    } else if (command.startsWith('netstat')) {
      toast.info("Running network statistics...");

      try {
        const response = await fetch('/api/net-stat', {
          method: 'GET',
        });

        const data = await response.json();

        if (response.ok) {
          setConsoleLogs(prev => [...prev.slice(-6),
            `[${new Date().toLocaleTimeString()}] NETSTAT: Network connections:`,
            `[${new Date().toLocaleTimeString()}] NETSTAT: Active connections: ${data.connections || 'N/A'}`,
            `[${new Date().toLocaleTimeString()}] NETSTAT: Listening ports: ${data.listening || 'N/A'}`,
            `[${new Date().toLocaleTimeString()}] NETSTAT: Network interfaces: ${data.interfaces || 'N/A'}`,
            `[${new Date().toLocaleTimeString()}] NETSTAT: Network statistics retrieved`
          ]);
          toast.success("Network statistics retrieved");
        } else {
          throw new Error("Failed to get network stats");
        }
      } catch (error) {
        setConsoleLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] ERROR: Netstat failed - Network monitoring unavailable`]);
        toast.error("Network statistics unavailable");
      }
    } else if (command === 'help' || command === '?') {
      setConsoleLogs(prev => [...prev.slice(-8),
        `[${new Date().toLocaleTimeString()}] HELP: Available ROOT commands:`,
        `[${new Date().toLocaleTimeString()}] HELP: scan <ip/url> - Vulnerability scan`,
        `[${new Date().toLocaleTimeString()}] HELP: portscan <ip> / pscan <ip> - Port scanning`,
        `[${new Date().toLocaleTimeString()}] HELP: nmap <ip> - Advanced port/service scan`,
        `[${new Date().toLocaleTimeString()}] HELP: netstat - Network statistics`,
        `[${new Date().toLocaleTimeString()}] HELP: status - System status`,
        `[${new Date().toLocaleTimeString()}] HELP: clear - Clear logs`
      ]);
    } else if (command === 'status') {
      setConsoleLogs(prev => [...prev.slice(-8),
        `[${new Date().toLocaleTimeString()}] STATUS: System operational (ROOT ACCESS)`,
        `[${new Date().toLocaleTimeString()}] STATUS: Threat monitoring: ACTIVE`,
        `[${new Date().toLocaleTimeString()}] STATUS: Network security: ENGAGED`,
        `[${new Date().toLocaleTimeString()}] STATUS: Emergency protocols: ${redAlert ? 'ACTIVE' : 'STANDBY'}`,
        `[${new Date().toLocaleTimeString()}] STATUS: Root privileges: ENABLED`
      ]);
    } else if (command === 'clear') {
      setConsoleLogs([]);
      toast.info("Terminal logs cleared");
    } else if (command) {
      setConsoleLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] ERROR: Unknown command: ${command}. Type 'help' for commands.`]);
      toast.error(`Unknown command: ${command}`);
    }
  };

  if (!isAuthenticated) {
    return <SecurityPortal onAccessGranted={handleAccessGranted} />;
  }

  return (
    <div className="relative min-h-screen bg-[var(--cyber-bg)] font-sans text-zinc-100 overflow-hidden hexagonal-bg">
      <div className="crt-overlay" />
      <div className="scanline" />
      <Toaster position="top-right" theme="dark" />
      <CyberPulse />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-black border-b border-[var(--active-neon)]/50 p-4 z-10 shadow-lg shadow-[var(--active-neon)]/20 flex justify-center items-center">
        <div className="text-center">
          <span className="animate-pulse text-[var(--active-neon)]">OPERATIONAL STATUS: STABLE</span>
        </div>
        <div className="absolute right-4 text-[var(--active-neon)]">
          OPERATOR: ADMIN_ROOT
        </div>
      </div>

      {/* Main Layout with Side Panels */}
      <div className="flex pt-24 min-h-screen">
        {/* Left Side Panel - TerminalLogs */}
        <div className="w-80 border-r border-[var(--active-neon)]/50 bg-black/50 p-4 flex flex-col">
          <h3 className="text-[var(--active-neon)] font-bold uppercase tracking-widest mb-4 text-center">Terminal Logs</h3>
          <div className="flex-1">
            <TerminalLogs logs={consoleLogs} onEmergency={() => setEmergency(!emergency)} />
          </div>

          {/* Command Input Field */}
          <div className="mt-4 border-t border-[var(--active-neon)]/30 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[var(--active-neon)] font-mono text-sm">{'>'}</span>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCommand(command);
                    setCommand('');
                  }
                }}
                placeholder="Enter command..."
                className="flex-1 bg-black/50 border border-[var(--active-neon)]/30 rounded px-3 py-2 text-[var(--active-neon)] font-mono text-sm placeholder-zinc-500 focus:border-[var(--active-neon)] focus:outline-none"
              />
              <button
                onClick={handleSystemDocuments}
                className="px-4 py-2 glass-button text-[var(--active-neon)] font-bold uppercase tracking-widest text-xs rounded border border-[var(--active-neon)] shadow-[0_0_10px_var(--active-neon-glow)] transition-all duration-300 transform hover:scale-105"
              >
                DOCS
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Secure City Intelligence */}
        <div className="flex-1 px-6 pb-48">
          <main className="flex flex-col items-center w-full max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-7 flex flex-col justify-center gap-6"
              >
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[var(--active-neon)]/10 border border-[var(--active-neon)]/30 w-fit">
                  <Shield className="w-3 h-3 text-[var(--active-neon)] animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-[var(--active-neon)] uppercase tracking-[0.2em]">Intelligence Dashboard</span>
                </div>

                <div>
                  <h1 className="neon-text text-5xl md:text-7xl font-black tracking-tighter mb-4 uppercase leading-[0.85]">
                    SECURE CITY <br />
                    <span className="text-white opacity-90">INTELLIGENCE</span>
                  </h1>
                  <p className="max-w-xl text-sm md:text-lg text-zinc-400 font-medium leading-relaxed">
                    Advanced security intelligence platform for comprehensive threat monitoring and response coordination.
                  </p>
                </div>

                <div className="flex gap-4 w-full max-w-lg">
                  <button
                    onClick={handleActivateLockdown}
                    className={`flex-1 px-6 py-4 glass-button font-bold uppercase tracking-widest rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                      redAlert
                        ? 'text-red-400 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] bg-red-950/20'
                        : 'text-[var(--active-neon)] border-[var(--active-neon)] shadow-[0_0_15px_var(--active-neon-glow)]'
                    }`}
                  >
                    <Lock className="w-5 h-5 inline mr-3" />
                    {redAlert ? 'DEACTIVATE LOCKDOWN' : 'ACTIVATE LOCKDOWN'}
                  </button>
                  <button
                    onClick={handleSystemReports}
                    className="flex-1 px-6 py-4 glass-button text-[var(--active-neon)] font-bold uppercase tracking-widest rounded-lg border-2 border-[var(--active-neon)] shadow-[0_0_15px_var(--active-neon-glow)] transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_25px_var(--active-neon-glow)]"
                  >
                    <Shield className="w-5 h-5 inline mr-3" />
                    SYSTEM REPORTS
                  </button>
                  <button
                    onClick={handleSystemDocuments}
                    className="flex-1 px-6 py-4 glass-button text-[var(--active-neon)] font-bold uppercase tracking-widest rounded-lg border-2 border-[var(--active-neon)] shadow-[0_0_15px_var(--active-neon-glow)] transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_25px_var(--active-neon-glow)]"
                  >
                    <AlertTriangle className="w-5 h-5 inline mr-3" />
                    SYSTEM DOCUMENTS
                  </button>
                </div>

                {/* IP & URL Scanner Section */}
                <div className="w-full max-w-2xl mt-8">
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-5 h-5 text-[var(--active-neon)]" />
                      <h3 className="font-bold uppercase tracking-widest">IP & URL Scanner</h3>
                    </div>

                    <div className="flex gap-3 mb-4">
                      <input
                        type="text"
                        value={scanTarget}
                        onChange={(e) => setScanTarget(e.target.value)}
                        placeholder="Enter IP address or URL to scan..."
                        className="flex-1 bg-black/50 border border-[var(--active-neon)]/30 rounded-lg px-4 py-3 text-[var(--active-neon)] placeholder-zinc-500 focus:border-[var(--active-neon)] focus:outline-none"
                      />
                      <button
                        onClick={handleQuickScan}
                        disabled={isScanning || !scanTarget.trim()}
                        className="px-6 py-3 glass-button text-[var(--active-neon)] font-bold uppercase tracking-widest rounded-lg border-2 border-[var(--active-neon)] shadow-[0_0_10px_var(--active-neon-glow)] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isScanning ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : <Shield className="w-4 h-4 inline mr-2" />}
                        SCAN
                      </button>
                    </div>

                    {/* Scan Results */}
                    {scanResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-t border-[var(--active-neon)]/20 pt-4"
                      >
                        <h4 className="font-bold uppercase tracking-widest mb-3 text-[var(--active-neon)]">Scan Results</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Target:</span>
                              <span className="text-[var(--active-neon)]">{scanResult.url}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Severity:</span>
                              <span className={`font-bold ${scanResult.severity === 'High' ? 'text-red-400' : scanResult.severity === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                                {scanResult.severity}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Open Ports:</span>
                              <span className="text-[var(--active-neon)]">{scanResult.open_ports.length}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-zinc-400">SSL Status:</span>
                              <span className={scanResult.ssl_info.valid ? 'text-green-400' : 'text-red-400'}>
                                {scanResult.ssl_info.valid ? 'Valid' : 'Invalid'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Vulnerabilities:</span>
                              <span className="text-red-400">{scanResult.vulnerabilities.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Security Headers:</span>
                              <span className="text-yellow-400">{scanResult.security_headers.missing_critical.length} missing</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:col-span-5 flex items-center justify-center"
              >
                <div className="glass-card p-8 w-full max-w-md">
                  <div className="text-center">
                    <Lock className="w-16 h-16 text-[var(--active-neon)] mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-2">Intelligence Status</h3>
                    <p className="text-zinc-400 text-sm">Active threat monitoring engaged</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </main>
        </div>

        {/* Right Side Panel - RadarHUD */}
        <div className="w-80 border-l border-[var(--active-neon)]/50 bg-black/50 p-4 flex flex-col">
          <h3 className="text-[var(--active-neon)] font-bold uppercase tracking-widest mb-4 text-center">Radar System</h3>
          <div className="flex-1 flex items-center justify-center">
            <RadarHUD />
          </div>
        </div>
      </div>

      {/* Decorative corner accents */}
      <div className="fixed top-0 left-0 w-48 h-48 border-t-2 border-l-2 border-[var(--active-neon)]/20 m-6 rounded-tl-[3rem] pointer-events-none transition-colors duration-500" />
      <div className="fixed bottom-0 right-0 w-48 h-48 border-b-2 border-r-2 border-[var(--active-neon)]/20 m-6 rounded-br-[3rem] pointer-events-none transition-colors duration-500" />
    </div>
  );
}
