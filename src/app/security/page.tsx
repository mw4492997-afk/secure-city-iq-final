"use client";

import { useState } from "react";
import CyberPulse from "@/components/CyberPulse";
import Navbar from "@/components/Navbar";
import TerminalLogs from "@/components/TerminalLogs";
import { Toaster, toast } from "sonner";
import { Shield, Lock, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ScanResult {
  url: string;
  severity: string;
  ssl_info: {
    valid: boolean;
    issuer?: string;
    expiry?: string;
    issues: string[];
  };
  open_ports: number[];
  vulnerabilities: string[];
  security_headers: {
    missing_critical: string[];
  };
}

export default function SecurityPage() {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [emergency, setEmergency] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsScanning(true);
    try {
      const response = await fetch('/api/scan-vulnerability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setScanResult(data);
        toast.success("Scan completed successfully");
      } else {
        toast.error(data.error || "Scan failed");
      }
    } catch (error) {
      toast.error("Failed to connect to scan service");
      console.error('Scan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-[var(--cyber-bg)] font-sans text-zinc-100 overflow-x-hidden transition-colors duration-500">
      <div className="crt-overlay" />
      <div className="scanline" />
      <Toaster position="top-right" theme="dark" />
      <CyberPulse />
      <Navbar />

      <main className="relative z-10 flex flex-col items-center w-full max-w-7xl px-6 pt-24 pb-48">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 flex flex-col justify-center gap-6"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[var(--active-neon)]/10 border border-[var(--active-neon)]/30 w-fit">
              <Shield className="w-3 h-3 text-[var(--active-neon)] animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-[var(--active-neon)] uppercase tracking-[0.2em]">Security Scanner</span>
            </div>

            <div>
              <h1 className="neon-text text-5xl md:text-7xl font-black tracking-tighter mb-4 uppercase leading-[0.85]">
                Vulnerability <br />
                <span className="text-white opacity-90">Assessment</span>
              </h1>
              <p className="max-w-xl text-sm md:text-lg text-zinc-400 font-medium leading-relaxed">
                Advanced security scanning engine for comprehensive threat detection and vulnerability analysis.
              </p>
            </div>

            <form onSubmit={handleScan} className="flex gap-4 w-full max-w-md">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL to scan..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-[var(--active-neon)] focus:outline-none transition-colors"
                required
              />
              <button
                type="submit"
                disabled={isScanning}
                className="px-6 py-3 bg-[var(--active-neon)] text-black font-bold uppercase tracking-widest rounded-xl hover:bg-[var(--active-neon)]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Scan
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-5 flex items-center justify-center"
          >
            <div className="glass-card p-8 w-full max-w-md">
              <div className="text-center">
                <Lock className="w-16 h-16 text-[var(--active-neon)] mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Security Status</h3>
                <p className="text-zinc-400 text-sm">Ready for vulnerability assessment</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scan Results */}
        {scanResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mb-12"
          >
            <h2 className="text-xl font-black tracking-widest uppercase flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-[var(--active-neon)]" />
              Scan Results for {scanResult.url}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Severity */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  {scanResult.severity === 'High' ? <XCircle className="w-5 h-5 text-red-500" /> :
                   scanResult.severity === 'Medium' ? <AlertTriangle className="w-5 h-5 text-yellow-500" /> :
                   <CheckCircle className="w-5 h-5 text-green-500" />}
                  <h3 className="font-bold uppercase tracking-widest">Severity</h3>
                </div>
                <p className={`text-2xl font-black ${scanResult.severity === 'High' ? 'text-red-500' : scanResult.severity === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                  {scanResult.severity}
                </p>
              </div>

              {/* SSL Status */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  {scanResult.ssl_info.valid ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                  <h3 className="font-bold uppercase tracking-widest">SSL Certificate</h3>
                </div>
                <p className="text-sm text-zinc-400 mb-2">
                  {scanResult.ssl_info.valid ? 'Valid' : 'Invalid'}
                </p>
                {scanResult.ssl_info.issuer && (
                  <p className="text-xs text-zinc-500">Issuer: {scanResult.ssl_info.issuer}</p>
                )}
                {scanResult.ssl_info.expiry && (
                  <p className="text-xs text-zinc-500">Expires: {scanResult.ssl_info.expiry}</p>
                )}
              </div>

              {/* Open Ports */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-[var(--active-neon)]" />
                  <h3 className="font-bold uppercase tracking-widest">Open Ports</h3>
                </div>
                <p className="text-2xl font-black text-[var(--active-neon)]">
                  {scanResult.open_ports.length}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {scanResult.open_ports.length > 0 ? scanResult.open_ports.join(', ') : 'None detected'}
                </p>
              </div>

              {/* Vulnerabilities */}
              <div className="glass-card p-6 md:col-span-2 lg:col-span-3">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="font-bold uppercase tracking-widest">Vulnerabilities</h3>
                </div>
                {scanResult.vulnerabilities.length > 0 ? (
                  <ul className="space-y-2">
                    {scanResult.vulnerabilities.map((vuln, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-300">{vuln}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-green-500 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    No vulnerabilities detected
                  </p>
                )}
              </div>

              {/* Missing Security Headers */}
              {scanResult.security_headers.missing_critical.length > 0 && (
                <div className="glass-card p-6 md:col-span-2 lg:col-span-3">
                  <div className="flex items-center gap-3 mb-4">
                    <XCircle className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-bold uppercase tracking-widest">Missing Security Headers</h3>
                  </div>
                  <ul className="space-y-2">
                    {scanResult.security_headers.missing_critical.map((header, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-300">{header}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      <TerminalLogs onEmergency={() => setEmergency(!emergency)} />

      {/* Decorative corner accents */}
      <div className="fixed top-0 left-0 w-48 h-48 border-t-2 border-l-2 border-[var(--active-neon)]/20 m-6 rounded-tl-[3rem] pointer-events-none transition-colors duration-500" />
      <div className="fixed bottom-0 right-0 w-48 h-48 border-b-2 border-r-2 border-[var(--active-neon)]/20 m-6 rounded-br-[3rem] pointer-events-none transition-colors duration-500" />
    </div>
  );
}
