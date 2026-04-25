"use client";

import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  ShieldCheck,
  FileText,
  Bell,
  User,
  Volume2,
  VolumeX,
  BookOpen,
} from "lucide-react";

import { Locale, translations } from "@/lib/translations";

// Import layout components
import HamburgerSidebar from "@/components/HamburgerSidebar";
import TerminalLogs from "@/components/TerminalLogs";
import CyberPulse from "@/components/CyberPulse";
import SecurityPortal from "@/components/SecurityPortal";

// Import view components
import DashboardView from "@/components/views/DashboardView";
import IntelligenceView from "@/components/views/IntelligenceView";
import TopologyView from "@/components/views/TopologyView";
import FirewallView from "@/components/views/FirewallView";
import ScannerView from "@/components/views/ScannerView";
import KaliToolsetView from "@/components/views/KaliToolsetView";
import SignalInterceptView from "@/components/views/SignalInterceptView";
import AuditLogsView from "@/components/views/AuditLogsView";
import BiometricLogsView from "@/components/views/BiometricLogsView";
import VaultsView from "@/components/views/VaultsView";
import AttackLabView from "@/components/views/AttackLabView";

// Type definitions
interface SystemStats {
  cpu: number;
  ram: number;
  network: number;
  threats: number;
  uptime: string;
  encryption: number;
  encryptionKey: string;
}

interface Threat {
  id: number;
  type: string;
  origin: string;
  severity: "High" | "Medium" | "Low";
  time: string;
}

type ColorType = "neon" | "blue" | "red";

// Stat display component
function NavStatV3({
  label,
  value,
  progress,
  color,
}: {
  label: string;
  value: string;
  progress: number;
  color: ColorType;
}) {
  const colors = {
    neon: "bg-[var(--active-neon)] text-[var(--active-neon)]",
    blue: "bg-blue-500 text-blue-500",
    red: "bg-red-500 text-red-500",
  };
  return (
    <div className="flex items-center gap-6">
      <div className="text-left">
        <div className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em] leading-none mb-2">
          {label}
        </div>
        <div
          className={`text-base font-black ${
            colors[color].split(" ")[1]
          } leading-none tracking-tight`}
        >
          {value}
        </div>
      </div>
      <div className="w-24 h-2 bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5">
        <motion.div
          className={`h-full rounded-full ${colors[color].split(" ")[0]}`}
          animate={{ width: `${Math.min(100, progress)}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
        />
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function Home() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // UI state
  const [activeComponent, setActiveComponent] = useState<string>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showSecurityCard, setShowSecurityCard] = useState(false);
  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);
  const [showKaliToolset, setShowKaliToolset] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioVolume, setAudioVolume] = useState(0.7);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [language, setLanguage] = useState<Locale>('en');
  const t = translations[language];

  const setNextLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  // System state
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [uptime, setUptime] = useState("124:12:44");
  const [headerInfo, setHeaderInfo] = useState("NODE: OSL-CENTRAL // CRYPTO_SECURED");
  
  // Alert states
  const [redAlert, setRedAlert] = useState(false);
  const [isAlertMode, setIsAlertMode] = useState(false);
  const [isStealthMode, setIsStealthMode] = useState(false);

  // System stats
  const [systemStats, setSystemStats] = useState<SystemStats>({
    cpu: 12,
    ram: 45,
    network: 1.2,
    threats: 3,
    uptime: "124:12:44",
    encryption: 256,
    encryptionKey: "AES-256-GCM-LOADING...",
  });

  // Initialize encryption key on client side only
  useEffect(() => {
    setSystemStats(prev => ({
      ...prev,
      encryptionKey: "AES-256-GCM-" + Math.random().toString(36).substr(2, 16).toUpperCase(),
    }));
  }, []);

  // OSINT state (passed to views)
  const [osintResults, setOsintResults] = useState<any>(null);
  const [isOsintScanning, setIsOsintScanning] = useState(false);


  // Initialize authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth");
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth status check failed:", error);
      }
    };

    checkAuth();
  }, []);

  // System stats update
  useEffect(() => {
    if (!isAuthenticated) return;
    const baseCpu = (navigator.hardwareConcurrency || 4) * 10;
    const baseRam = ((navigator as unknown as { deviceMemory?: number })
      .deviceMemory || 8) * 10;

    const interval = setInterval(() => {
      setSystemStats((prev) => ({
        ...prev,
        cpu: Math.min(100, Math.max(0, baseCpu + (Math.random() * 20 - 10))),
        ram: Math.min(100, Math.max(0, baseRam + (Math.random() * 10 - 5))),
        network: Math.max(0.1, prev.network + (Math.random() * 0.8 - 0.4)),
        threats: Math.max(
          0,
          prev.threats +
            (Math.random() > 0.85 ? 1 : Math.random() < 0.15 ? -1 : 0)
        ),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Time and uptime update
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setUptime((prev) => {
        const parts = prev.split(":").map(Number);
        parts[2] += 1;
        if (parts[2] >= 60) {
          parts[2] = 0;
          parts[1] += 1;
        }
        if (parts[1] >= 60) {
          parts[1] = 0;
          parts[0] += 1;
        }
        return parts.map((p) => p.toString().padStart(2, "0")).join(":");
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Emergency mode styling
  useEffect(() => {
    document.documentElement.setAttribute("data-emergency", redAlert.toString());
  }, [redAlert]);

  const speak = (text: string) => {
    if (!audioEnabled || typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 0.8;
    utterance.volume = audioVolume;
    if (language === 'ar') {
      utterance.lang = 'ar-SA';
    }
    window.speechSynthesis.speak(utterance);
  };

  const toggleAudio = () => {
    const nextEnabled = !audioEnabled;
    setAudioEnabled(nextEnabled);

    if (!nextEnabled && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleVolumePanel = () => {
    setShowVolumeControl((prev) => !prev);
  };

  // Startup speech synthesis
  useEffect(() => {
    if (isAuthenticated) {
      speak(t.startupInitialized);
    }
  }, [isAuthenticated, audioEnabled, audioVolume, language]);

  // System logs generator - real environment status and live service checks
  useEffect(() => {
    if (!isAuthenticated) return;

    const addSystemLog = (message: string) => {
      const timestamp = new Date()
        .toLocaleTimeString("en-US", { hour12: false })
        .slice(11, 19);
      setConsoleLogs((prev) => [...prev.slice(-25), `[${timestamp}] ${message}`]);
    };

    const getConnectionInfo = () => {
      const connection = (navigator as any).connection || {};
      return {
        effectiveType: connection.effectiveType || "unknown",
        downlink: connection.downlink ? `${connection.downlink}Mbps` : "n/a",
        rtt: connection.rtt ? `${connection.rtt}ms` : "n/a",
        saveData: connection.saveData ? "enabled" : "disabled",
      };
    };

    const logInitialSystemInfo = async () => {
      addSystemLog(`SYSTEM START: Browser="${navigator.userAgent}"`);
      addSystemLog(
        `PLATFORM: ${navigator.platform} | CORES: ${navigator.hardwareConcurrency || "n/a"} | MEMORY: ${(navigator as any).deviceMemory ?? "n/a"}GB`
      );
      const connection = getConnectionInfo();
      addSystemLog(
        `NETWORK STATUS: online=${navigator.onLine} type=${connection.effectiveType} downlink=${connection.downlink} rtt=${connection.rtt} saveData=${connection.saveData}`
      );
      addSystemLog(`SECURITY: HTTPS=${window.location.protocol === "https:" ? "enabled" : "disabled"}`);
      addSystemLog(`PERFORMANCE: page load ${Math.round(performance.now())}ms`);

      if (navigator.storage && typeof navigator.storage.estimate === "function") {
        try {
          const estimate = await (navigator as any).storage.estimate();
          addSystemLog(
            `STORAGE: quota=${Math.round(estimate.quota / 1024 / 1024)}MB usage=${Math.round(
              estimate.usage / 1024 / 1024
            )}MB`
          );
        } catch (error) {
          addSystemLog(`STORAGE ESTIMATE FAILED: ${(error as Error).message}`);
        }
      }

      try {
        const start = performance.now();
        const response = await fetch("/api/live-logs", { cache: "no-store" });
        const duration = Math.round(performance.now() - start);
        addSystemLog(`SERVICE CHECK: /api/live-logs HTTP ${response.status} in ${duration}ms`);
      } catch (error) {
        addSystemLog(`SERVICE CHECK FAILED: /api/live-logs ${(error as Error).message}`);
      }
    };

    const interval = setInterval(async () => {
      const connection = getConnectionInfo();
      addSystemLog(
        `HEALTH UPDATE: online=${navigator.onLine} network=${connection.effectiveType} rtt=${connection.rtt}`
      );
      try {
        const start = performance.now();
        const response = await fetch("/api/live-logs", { cache: "no-store" });
        const duration = Math.round(performance.now() - start);
        addSystemLog(`SERVICE PING: /api/live-logs HTTP ${response.status} in ${duration}ms`);
      } catch (error) {
        addSystemLog(`SERVICE PING FAILED: /api/live-logs ${(error as Error).message}`);
      }
    }, 10000);

    logInitialSystemInfo();
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Fetch user geolocation
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        setConsoleLogs((prev) => [
          ...prev.slice(-25),
          `[${new Date().toLocaleTimeString()}] IP DETECTED: ${data.ip} | CITY: ${
            data.city
          } | ISP: ${data.org}`,
        ]);
        setHeaderInfo(`NODE: ${data.city} // ${data.org}`);
      })
      .catch((err) => {
        setConsoleLogs((prev) => [
          ...prev.slice(-25),
          `[${new Date().toLocaleTimeString()}] IP FETCH FAILED: ${err.message}`,
        ]);
      });
  }, [isAuthenticated]);

  // Handlers
  const handleAccessGranted = () => {
    setIsAuthenticated(true);
    toast.success(t.biometricVerified);
  };

  const handleActivateLockdown = () => {
    const nextState = !redAlert;
    setRedAlert(nextState);
    document.documentElement.setAttribute("data-red-alert", nextState.toString());
    if (nextState) {
      toast.error(t.lockdownEngaged);
      setConsoleLogs((prev) => [
        ...prev.slice(-15),
        `[${new Date().toLocaleTimeString()}] !!! CRITICAL: FULL SYSTEM ISOLATION INITIATED !!!`,
      ]);
    } else {
      toast.success(t.lockdownTerminated);
      setConsoleLogs((prev) => [
        ...prev.slice(-15),
        `[${new Date().toLocaleTimeString()}] STATUS: Security level normalized. Re-establishing uplinks.`,
      ]);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);


  // Render authentication screen if not authenticated
  if (!isAuthenticated) return <SecurityPortal onAccessGranted={handleAccessGranted} t={t} language={language} />;

  // Render main dashboard
  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className={`fixed inset-0 bg-[#020202] text-zinc-300 font-mono selection:bg-[var(--active-neon)] selection:text-black overflow-hidden relative h-screen w-screen ${
        redAlert ? "animate-pulse bg-red-950/20" : ""
      } ${isAlertMode ? "alert-mode" : ""} ${isStealthMode ? "stealth-mode" : ""}`}
    >
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#0a0a0a_0%,#000_100%)]" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent blur-3xl" />
        <motion.div
          animate={{ x: [-1000, 2000], opacity: [0, 0.6, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-0 w-[500px] h-[2px] bg-gradient-to-r from-transparent via-[var(--active-neon)] to-transparent blur-md shadow-[0_0_20px_rgba(0,255,153,0.5)]"
        />
        <motion.div
          animate={{ x: [2000, -1000], opacity: [0, 0.4, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-3/4 left-0 w-[800px] h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-md shadow-[0_0_20px_rgba(59,130,246,0.5)]"
        />
        <motion.div
          animate={{ y: [-100, 100], opacity: [0, 0.3, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute right-0 top-1/2 w-[1px] h-[300px] bg-gradient-to-b from-purple-500/0 via-purple-500/50 to-purple-500/0 blur-lg"
        />
      </div>

      {/* Red alert overlay */}
      <AnimatePresence>
        {redAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] pointer-events-none border-[20px] border-red-500/20 shadow-[inset_0_0_100px_rgba(239,68,68,0.3)] animate-pulse"
          />
        )}
      </AnimatePresence>

      <div className="crt-overlay pointer-events-none fixed inset-0 z-50 opacity-[0.01]" />
      <Toaster position="bottom-right" theme="dark" closeButton />
      <CyberPulse />

      {/* Header Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-24 z-40 px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,255,163,0.16),transparent_30%),linear-gradient(135deg,rgba(0,10,15,0.96),rgba(0,0,0,0.88))] backdrop-blur-[28px] border-b border-cyan-500/10 shadow-[0_0_65px_rgba(0,255,163,0.18)]" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400/80 via-sky-400/40 to-purple-500/80 blur-2xl" />
        <div className="relative z-10 flex h-full items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className="p-3 rounded-3xl bg-black/50 border border-white/10 text-zinc-100 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-all shadow-[0_0_20px_rgba(0,255,163,0.12)]"
              title={t.openSidebar}
            >
              <Menu className="w-6 h-6" />
            </motion.button>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 8 }}
              whileTap={{ scale: 0.95 }}
              className="min-w-[88px] rounded-[28px] bg-gradient-to-br from-cyan-500/20 to-slate-900/30 border border-cyan-500/20 px-4 py-3 shadow-[0_0_30px_rgba(0,255,163,0.12)]"
            >
              <div className="text-[10px] uppercase tracking-[0.35em] text-cyan-300 font-black">NEXUS</div>
              <div className="text-sm font-black text-white uppercase tracking-[0.1em]">SECURE</div>
            </motion.div>
          </div>

          <div className="flex-1 flex flex-col items-center text-center gap-1">
            <div className="flex items-baseline gap-3">
              <h1 className="text-white font-black tracking-[-0.05em] text-3xl leading-none">ORCHIDS</h1>
              <span className="text-[var(--active-neon)] font-black text-3xl leading-none">INTEL</span>
            </div>
            <div className="flex items-center gap-2 rounded-3xl bg-white/5 border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-300 shadow-[0_0_25px_rgba(0,255,163,0.08)]">
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span>{headerInfo}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-6">
              <div className="flex flex-col items-end text-right gap-1">
                <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">{t.systemTime}</span>
                <span className="text-base font-black uppercase tracking-[0.2em] text-white">{currentTime.toLocaleTimeString()}</span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-300">{t.uptime} {uptime}</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2 shadow-[0_0_20px_rgba(0,255,163,0.08)]">
                <NavStatV3 label="CPU" value={`${systemStats.cpu.toFixed(0)}%`} progress={systemStats.cpu} color="neon" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveComponent('logs');
                  setShowLogsModal(false);
                  speak(t.systemAuditLogs);
                }}
                className="relative w-11 h-11 bg-gradient-to-br from-white/10 to-white/5 hover:from-[var(--active-neon)]/20 hover:to-[var(--active-neon)]/5 border border-white/20 hover:border-[var(--active-neon)]/50 rounded-2xl flex items-center justify-center transition-all group shadow-[0_0_15px_rgba(0,255,153,0.0)] hover:shadow-[0_0_20px_rgba(0,255,153,0.3)]"
                title={t.viewAuditLogs}
              >
                <FileText className="w-5 h-5 text-zinc-300 group-hover:text-[var(--active-neon)] transition-colors" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserGuide(true)}
                className="relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 via-slate-900/40 to-black border border-cyan-300/25 shadow-[0_0_25px_rgba(45,212,191,0.28)] hover:shadow-[0_0_35px_rgba(45,212,191,0.45)] flex items-center justify-center transition-all overflow-hidden"
                title={t.userGuide}
              >
                <span className="absolute inset-0 rounded-full border border-cyan-400/40 animate-pulse opacity-70" />
                <span className="relative flex flex-col items-center justify-center gap-0 text-[10px] uppercase tracking-[0.3em] text-white font-black">
                  <BookOpen className="w-5 h-5" />
                  <span className="text-[8px]">{t.userGuide}</span>
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={setNextLanguage}
                className="relative w-11 h-11 bg-gradient-to-br from-white/10 to-white/5 hover:from-[var(--active-neon)]/20 hover:to-[var(--active-neon)]/5 border border-white/20 hover:border-[var(--active-neon)]/50 rounded-2xl flex items-center justify-center transition-all group shadow-[0_0_15px_rgba(0,255,153,0.0)] hover:shadow-[0_0_20px_rgba(0,255,153,0.3)]"
                title={t.language}
              >
                <span className="text-zinc-300 font-black">{t.languageSwitch}</span>
              </motion.button>
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleVolumePanel}
                  className="relative w-11 h-11 bg-gradient-to-br from-white/10 to-white/5 hover:from-[var(--active-neon)]/20 hover:to-[var(--active-neon)]/5 border border-white/20 hover:border-[var(--active-neon)]/50 rounded-2xl flex items-center justify-center transition-all group shadow-[0_0_15px_rgba(0,255,153,0.0)] hover:shadow-[0_0_20px_rgba(0,255,153,0.3)]"
                  title={t.audioSettings}
                >
                  {audioEnabled ? (
                    <Volume2 className="w-5 h-5 text-zinc-300 group-hover:text-[var(--active-neon)] transition-colors" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-zinc-300 group-hover:text-[var(--active-neon)] transition-colors" />
                  )}
                </motion.button>
                {showVolumeControl && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-3xl bg-black/90 border border-white/10 p-3 shadow-[0_0_25px_rgba(0,0,0,0.5)] z-50">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-2">
                      <span>{t.audio}</span>
                      <span>{audioEnabled ? Math.round(audioVolume * 100) : 0}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={audioEnabled ? audioVolume : 0}
                      onChange={(e) => {
                        const volume = Number(e.target.value);
                        setAudioVolume(volume);
                        if (!audioEnabled && volume > 0) setAudioEnabled(true);
                      }}
                      className="w-full h-2 rounded-full accent-cyan-400"
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={toggleAudio}
                        className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-300 hover:bg-white/5 transition"
                      >
                        {audioEnabled ? t.mute : t.unmute}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowVolumeControl(false)}
                        className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-300 hover:bg-white/5 transition"
                      >
                        {t.close}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-11 h-11 bg-gradient-to-br from-white/10 to-white/5 hover:from-red-500/20 hover:to-red-500/5 border border-white/20 hover:border-red-500/50 rounded-2xl flex items-center justify-center transition-all group shadow-[0_0_15px_rgba(0,255,153,0.0)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              >
                <Bell className="w-5 h-5 text-zinc-300 group-hover:text-red-400" />
                <motion.span
                  animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                />
              </motion.button>
              <div className="flex items-center gap-4 pl-4 border-l border-white/20">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-black text-white leading-none mb-1">SUPER_USER</div>
                  <div className="text-[9px] text-[var(--active-neon)] font-black uppercase tracking-widest drop-shadow-[0_0_8px_rgba(0,255,153,0.3)]">CLEARANCE LVL 5</div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--active-neon)]/20 to-emerald-500/10 border border-[var(--active-neon)]/40 p-[1px] shadow-[0_0_25px_rgba(0,255,153,0.2)] cursor-pointer transition-all hover:shadow-[0_0_35px_rgba(0,255,153,0.4)]"
                  onClick={() => setShowSecurityCard(true)}
                >
                  <div className="w-full h-full rounded-[inherit] bg-black/30 flex items-center justify-center hover:bg-[var(--active-neon)]/10 transition-all">
                    <User className="w-6 h-6 text-[var(--active-neon)] group-hover:text-white transition-colors" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content area */}
      <div className="pt-20 fixed top-0 left-0 right-0 bottom-0 flex">
        {/* Sidebar */}
        <HamburgerSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeComponent}
          setActiveTab={setActiveComponent}
          activeComponent={activeComponent}
          setActiveComponent={setActiveComponent}
          redAlert={redAlert}
          showAuditLogsModal={showAuditLogsModal}
          setShowAuditLogsModal={setShowAuditLogsModal}
          showKaliToolset={showKaliToolset}
          setShowKaliToolset={setShowKaliToolset}
          setTestLabMode={() => {}}
          handleActivateLockdown={handleActivateLockdown}
          speakLabel={speak}
          openUserGuide={() => setShowUserGuide(true)}
          t={t}
        />

        {/* Main view - Dynamic component rendering */}
        <main className="flex-1 w-full h-full overflow-hidden relative bg-gradient-to-br from-black via-[#0a0a0a] to-black">
          {/* Subtle animated background elements */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-conic from-[var(--active-neon)]/0 via-[var(--active-neon)]/5 to-[var(--active-neon)]/0"
            />
          </div>
          <AnimatePresence mode="wait">
            {activeComponent === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <DashboardView
                  consoleLogs={consoleLogs}
                  setConsoleLogs={setConsoleLogs}
                  onEmergency={handleActivateLockdown}
                />
              </motion.div>
            )}

            {activeComponent === "intelligence" && (
              <motion.div
                key="intelligence"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full"
              >
                <IntelligenceView
                  consoleLogs={consoleLogs}
                  setConsoleLogs={setConsoleLogs}
                  osintResults={osintResults}
                  setOsintResults={setOsintResults}
                  isScanning={isOsintScanning}
                  setIsScanning={setIsOsintScanning}
                  t={t}
                  language={language}
                />
              </motion.div>
            )}

            {(activeComponent === "topology" || activeComponent === "radar") && (
              <motion.div
                key="topology"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full"
              >
                <TopologyView
                  consoleLogs={consoleLogs}
                  setConsoleLogs={setConsoleLogs}
                  t={t}
                  language={language}
                />
              </motion.div>
            )}


            {activeComponent === "firewall" && (
              <motion.div
                key="firewall"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full"
              >
                <FirewallView
                  consoleLogs={consoleLogs}
                  setConsoleLogs={setConsoleLogs}
                />
              </motion.div>
            )}

            {(activeComponent === "scanner" || activeComponent === "vulnerability") && (
              <motion.div
                key="scanner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full"
              >
                <ScannerView
                  consoleLogs={consoleLogs}
                  setConsoleLogs={setConsoleLogs}
                  t={t}
                  language={language}
                />
              </motion.div>
            )}


            {activeComponent === "signal" && (
              <motion.div
                key="signal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full"
              >
                <SignalInterceptView
                  consoleLogs={consoleLogs}
                  setConsoleLogs={setConsoleLogs}
                />
              </motion.div>
            )}

            {activeComponent === "logs" && (
              <motion.div
                key="logs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full"
              >
                <AuditLogsView />
              </motion.div>
            )}

            {activeComponent === "kali" && (
              <motion.div
                key="kali"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full"
              >
                <KaliToolsetView
                  consoleLogs={consoleLogs}
                  setConsoleLogs={setConsoleLogs}
                />
              </motion.div>
            )}

            {activeComponent === "vaults" && (
              <motion.div
                key="vaults"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full"
              >
                <VaultsView />
              </motion.div>
            )}

            {activeComponent === "biometric" && (
              <motion.div
                key="biometric"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full"
              >
                <BiometricLogsView />
              </motion.div>
            )}

            {activeComponent === "attack" && (
              <motion.div
                key="attack"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full"
              >
                <AttackLabView speakAttack={speak} t={t} language={language} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Terminal logs overlay */}
        {activeComponent === "dashboard" && (
          <TerminalLogs
            logs={consoleLogs}
            onEmergency={handleActivateLockdown}
            osintResults={osintResults}
            isScanning={isOsintScanning}
            isProcessingTool={false}
            t={t}
            language={language}
          />
        )}
      </div>

      {/* Logs Modal */}
      <AnimatePresence>
        {showLogsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowLogsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-black/90 to-gray-900/90 border border-[var(--active-neon)]/30 rounded-2xl p-6 w-full max-w-4xl h-[80vh] overflow-hidden shadow-[0_0_50px_rgba(0,255,153,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-[var(--active-neon)] tracking-wider">
                  SYSTEM EXECUTION LOGS
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLogsModal(false)}
                  className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                >
                  ✕
                </motion.button>
              </div>
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--active-neon)] scrollbar-track-black/50">
                {consoleLogs.length === 0 ? (
                  <div className="text-center text-zinc-500 py-8">
                    No logs available. System initializing...
                  </div>
                ) : (
                  consoleLogs.map((log, index) => {
                    const timeMatch = log.match(/\[([0-9]{1,2}:[0-9]{2}:[0-9]{2})\]/);
                    const time = timeMatch ? timeMatch[1] : new Date().toLocaleTimeString('en-US', {hour12: false}).slice(11, 19);
                    const content = log.replace(/^\[[^\]]+\]\s*/, '');
                    
                    let colorClass = 'text-green-400';
                    if (content.includes('NETWORK') || content.includes('Identified') || content.includes('SERVICE')) colorClass = 'text-cyan-400';
                    else if (content.includes('anomaly') || content.includes('threat') || content.includes('ERROR') || content.includes('FAILED')) colorClass = 'text-red-400';
                    else if (content.includes('new device') || content.includes('detected') || content.includes('IP DETECTED')) colorClass = 'text-yellow-400';
                    else if (content.includes('START') || content.includes('STATUS') || content.includes('HEALTH')) colorClass = 'text-[var(--active-neon)]';
                    
                    return (
                      <div key={index} className={`mb-3 font-mono text-sm ${colorClass} border-b border-white/5 pb-2`}>
                        <span className="text-zinc-500">[{time}]</span> {content}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Guide Overlay */}
      <AnimatePresence>
        {showUserGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowUserGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-4xl rounded-3xl bg-[#050708]/95 border border-cyan-500/20 shadow-[0_0_80px_rgba(0,255,163,0.2)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5 bg-black/60">
                <div>
                  <div className="text-sm font-black uppercase tracking-[0.25em] text-[var(--active-neon)]">{t.userGuide}</div>
                  <h2 className="text-2xl font-black text-white">{t.userGuideTitle}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUserGuide(false)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-zinc-300 hover:bg-white/10"
                >
                  {t.closeGuide}
                </button>
              </div>
              <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr] p-6 text-sm text-zinc-300">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-cyan-500/15 bg-[#071214] p-6 shadow-[0_0_30px_rgba(0,255,163,0.12)]">
                    <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--active-neon)] font-black mb-3">{t.userGuideOverviewTitle}</div>
                    <p className="text-zinc-300 leading-relaxed">{t.userGuideOverviewDesc}</p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                      <div className="font-bold text-[var(--active-neon)] mb-3">{t.userGuideGettingStartedTitle}</div>
                      <ol className="list-decimal list-inside space-y-2 text-zinc-400 text-[13px]">
                        <li>{t.userGuideStepOne}</li>
                        <li>{t.userGuideStepTwo}</li>
                        <li>{t.userGuideStepThree}</li>
                      </ol>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                      <div className="font-bold text-[var(--active-neon)] mb-3">{t.userGuideTipsTitle}</div>
                      <ul className="list-disc list-inside space-y-2 text-zinc-400 text-[13px]">
                        <li>{t.userGuideTip1}</li>
                        <li>{t.userGuideTip2}</li>
                        <li>{t.userGuideTip3}</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[{
                      title: t.userGuideCommandCenter,
                      desc: t.userGuideCommandCenterDesc,
                    }, {
                      title: t.userGuideGlobalIntelligence,
                      desc: t.userGuideGlobalIntelligenceDesc,
                    }, {
                      title: t.userGuideCyberTopology,
                      desc: t.userGuideCyberTopologyDesc,
                    }, {
                      title: t.userGuideSignalIntercept,
                      desc: t.userGuideSignalInterceptDesc,
                    }, {
                      title: t.userGuideActiveFirewall,
                      desc: t.userGuideActiveFirewallDesc,
                    }, {
                      title: t.userGuideAuditLogs,
                      desc: t.userGuideAuditLogsDesc,
                    }, {
                      title: t.userGuideKaliToolset,
                      desc: t.userGuideKaliToolsetDesc,
                    }, {
                      title: t.userGuideVulnerabilityScan,
                      desc: t.userGuideVulnerabilityScanDesc,
                    }, {
                      title: t.userGuideKeysVaults,
                      desc: t.userGuideKeysVaultsDesc,
                    }, {
                      title: t.userGuideBiometricLogs,
                      desc: t.userGuideBiometricLogsDesc,
                    }, {
                      title: t.userGuideAttackLab,
                      desc: t.userGuideAttackLabDesc,
                    }].map((item, index) => (
                      <div key={index} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                        <div className="font-bold text-[var(--active-neon)]">{item.title}</div>
                        <div className="text-[11px] text-zinc-400 mt-1">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl bg-[radial-gradient(circle_at_top_left,rgba(0,255,163,0.18),transparent_40%)] border border-white/10 p-6 text-[10px] text-zinc-400">
                  <div className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-[var(--active-neon)]">{t.userGuideWhatToKnowTitle}</div>
                  <p className="text-zinc-300 leading-relaxed text-[13px] mb-4">{t.userGuideWhatToKnowDesc}</p>
                  <div className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-[var(--active-neon)]">{t.userGuideNavigationTitle}</div>
                  <ul className="space-y-3 text-[13px] text-zinc-400">
                    <li>• {t.commandCenter}</li>
                    <li>• {t.globalIntelligence}</li>
                    <li>• {t.cyberTopology}</li>
                    <li>• {t.signalIntercept}</li>
                    <li>• {t.activeFirewall}</li>
                    <li>• {t.systemAuditLogsMenu}</li>
                    <li>• {t.kaliToolset}</li>
                    <li>• {t.vulnerabilityScan}</li>
                    <li>• {t.keysVaults}</li>
                    <li>• {t.biometricLogs}</li>
                    <li>• {t.launchAttack}</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


