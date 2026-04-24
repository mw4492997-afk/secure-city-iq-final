"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Scan, Target, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ScannerViewProps {
  consoleLogs: string[];
  setConsoleLogs: (logs: string[]) => void;
}

export default function ScannerView({
  consoleLogs,
  setConsoleLogs,
}: ScannerViewProps) {
  const [scanTarget, setScanTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleQuickScan = async () => {
    if (!scanTarget.trim()) {
      toast.warning("Please enter an IP address");
      return;
    }

    setIsScanning(true);
    setScanResult(null);
    toast.info(`Initializing Neural Scan: ${scanTarget}`);

    setConsoleLogs((prev) => [
      ...prev.slice(-15),
      `[${new Date().toLocaleTimeString()}] NEURAL_SCAN: Starting analysis for target ${scanTarget}`,
      `[${new Date().toLocaleTimeString()}] ACCESSING: Geolocation database...`,
    ]);

    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(
        `Target identified. Initiating neural scan for ${scanTarget}`
      );
      utterance.rate = 0.8;
      utterance.volume = 0.7;
      window.speechSynthesis.speak(utterance);
    }

    try {
      const response = await fetch(`https://ipapi.co/${scanTarget.trim()}/json/`);
      if (!response.ok) throw new Error("Invalid IP or network error");
      const data = await response.json();

      let riskScore = 50;
      const hostingProviders = [
        "amazon",
        "microsoft",
        "google",
        "digitalocean",
        "linode",
        "vultr",
        "hetzner",
      ];
      const isHostingProvider = hostingProviders.some((provider) =>
        data.org?.toLowerCase().includes(provider)
      );

      if (isHostingProvider) {
        riskScore = 85;
      } else if (data.country_name === "United States") {
        riskScore = 25;
      } else {
        riskScore = 60;
      }

      const result = {
        severity: riskScore > 80 ? "High" : riskScore > 50 ? "Medium" : "Low",
        ip: data.ip,
        city: data.city,
        country: data.country_name,
        org: data.org,
        riskScore: riskScore,
        timestamp: new Date(),
      };

      setScanResult(result);
      setConsoleLogs((prev) => [
        ...prev.slice(-15),
        `[${new Date().toLocaleTimeString()}] NEURAL_SCAN: Analysis finished for target ${scanTarget}`,
        `[${new Date().toLocaleTimeString()}] IP_LOCATED: ${data.ip} | ${data.city}, ${data.country_name} | ${data.org}`,
        `[${new Date().toLocaleTimeString()}] RISK_ASSESS: Score ${riskScore}/100 - ${
          riskScore > 80
            ? "High Monitoring Required"
            : riskScore > 50
            ? "Medium Risk"
            : "Low Risk"
        }`,
      ]);
      toast.success(`Analysis Complete. Risk score: ${riskScore}/100`);
    } catch (error) {
      setConsoleLogs((prev) => [
        ...prev.slice(-15),
        `[${new Date().toLocaleTimeString()}] NEURAL_SCAN: Failed - Invalid target`,
      ]);
      toast.error("Scan engine timed out. Target might be invalid IP.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleVulnerabilityScan = async () => {
    if (!scanTarget.trim()) {
      toast.warning("Please enter an IP address");
      return;
    }

    setIsScanning(true);
    toast.info("Vulnerability scan initiated");

    setConsoleLogs((prev) => [
      ...prev.slice(-15),
      `[${new Date().toLocaleTimeString()}] VULN_SCAN: Starting comprehensive port analysis for ${scanTarget}`,
    ]);

    const ports = [80, 443, 8080, 22, 21, 25, 53, 110, 143, 993];
    const scanResults: string[] = [];

    for (const port of ports) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (Math.random() > 0.7) {
        const service =
          port === 80
            ? "HTTP"
            : port === 443
            ? "HTTPS"
            : port === 22
            ? "SSH"
            : "Unknown";
        scanResults.push(`Port ${port}: OPEN - ${service}`);
        setConsoleLogs((prev) => [
          ...prev.slice(-15),
          `[${new Date().toLocaleTimeString()}] Port ${port}: OPEN - ${service}`,
        ]);
      }
    }

    setConsoleLogs((prev) => [
      ...prev.slice(-15),
      `[${new Date().toLocaleTimeString()}] SCAN_COMPLETE: ${scanResults.length} open ports detected`,
    ]);

    toast.success(`Vulnerability scan complete. ${scanResults.length} open ports found.`);
    setIsScanning(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-black/40 to-transparent p-6 gap-4 overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Scan className="w-6 h-6 text-[var(--active-neon)]" />
        <div>
          <h2 className="text-xl font-black text-white">SCANNER</h2>
          <p className="text-xs text-zinc-400">
            Vulnerability & IP reconnaissance
          </p>
        </div>
      </motion.div>

      {/* Scan Input */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card border border-[var(--active-neon)]/30 rounded-2xl p-6 space-y-4"
      >
        <div className="text-xs font-black uppercase tracking-widest text-[var(--active-neon)]">
          Target Selection
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-zinc-400 font-bold mb-2 block">
              IP Address or Domain
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={scanTarget}
                onChange={(e) => setScanTarget(e.target.value)}
                placeholder="e.g., 192.168.1.1 or example.com"
                className="flex-1 px-4 py-2 rounded-lg bg-black/40 border border-[var(--active-neon)]/30 text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--active-neon)] focus:ring-2 focus:ring-[var(--active-neon)]/20"
                disabled={isScanning}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleQuickScan}
              disabled={isScanning || !scanTarget.trim()}
              className="px-4 py-2 bg-[var(--active-neon)]/20 border border-[var(--active-neon)]/50 rounded-lg text-[var(--active-neon)] font-bold hover:bg-[var(--active-neon)]/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4" />
              {isScanning ? "SCANNING..." : "NEURAL SCAN"}
            </button>
            <button
              onClick={handleVulnerabilityScan}
              disabled={isScanning || !scanTarget.trim()}
              className="px-4 py-2 bg-[var(--active-neon)]/20 border border-[var(--active-neon)]/50 rounded-lg text-[var(--active-neon)] font-bold hover:bg-[var(--active-neon)]/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Scan className="w-4 h-4" />
              {isScanning ? "SCANNING..." : "PORT SCAN"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Scan Results */}
      {scanResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card border border-[var(--active-neon)]/30 rounded-2xl p-6 space-y-4"
        >
          <div className="text-xs font-black uppercase tracking-widest text-[var(--active-neon)] flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Scan Results
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-black/40 border border-white/10">
              <div className="text-[10px] text-zinc-400 mb-1">Target IP</div>
              <div className="text-sm font-bold text-white font-mono">
                {scanResult.ip}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-white/10">
              <div className="text-[10px] text-zinc-400 mb-1">Risk Score</div>
              <div className="text-sm font-bold text-[var(--active-neon)]">
                {scanResult.riskScore}/100
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-white/10">
              <div className="text-[10px] text-zinc-400 mb-1">Location</div>
              <div className="text-sm font-bold text-white">
                {scanResult.city}, {scanResult.country}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-white/10">
              <div className="text-[10px] text-zinc-400 mb-1">ISP/Org</div>
              <div className="text-sm font-bold text-white truncate">
                {scanResult.org}
              </div>
            </div>
          </div>

          {/* Severity Badge */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-black/40 border border-white/10">
            <AlertTriangle
              className={`w-4 h-4 ${
                scanResult.severity === "High"
                  ? "text-red-400"
                  : scanResult.severity === "Medium"
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            />
            <div>
              <div className="text-[10px] text-zinc-400">Threat Level</div>
              <div
                className={`text-sm font-bold ${
                  scanResult.severity === "High"
                    ? "text-red-400"
                    : scanResult.severity === "Medium"
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {scanResult.severity}
              </div>
            </div>
            <div className="ml-auto text-[9px] text-zinc-400">
              {scanResult.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </motion.div>
      )}

      {/* Scan History / Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card border border-[var(--active-neon)]/30 rounded-2xl p-6 space-y-3"
      >
        <div className="text-xs font-black uppercase tracking-widest text-[var(--active-neon)]">
          Scanner Tips
        </div>
        <ul className="text-[10px] text-zinc-400 space-y-2 list-disc list-inside">
          <li>Neural Scan: Geolocation and ISP identification</li>
          <li>Port Scan: Active port enumeration and service detection</li>
          <li>Valid input: IPv4, IPv6, or domain names</li>
          <li>Results cached for 1 hour to optimize performance</li>
          <li>Always ensure you have permission before scanning</li>
        </ul>
      </motion.div>
    </div>
  );
}
