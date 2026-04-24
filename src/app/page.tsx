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
} from "lucide-react";

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
    const authStatus = localStorage.getItem("authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
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

  // Startup speech synthesis
  useEffect(() => {
    if (isAuthenticated && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(
        "System initialized. All modules operational. Network monitoring active."
      );
      utterance.rate = 0.8;
      utterance.pitch = 0.8;
      utterance.volume = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  }, [isAuthenticated]);

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
    localStorage.setItem("authenticated", "true");
    toast.success("BIOMETRIC VERIFIED. WELCOME ADMIN.");
  };

  const handleActivateLockdown = () => {
    const nextState = !redAlert;
    setRedAlert(nextState);
    document.documentElement.setAttribute("data-red-alert", nextState.toString());
    if (nextState) {
      toast.error("PROTOCOL 9-RED: TOTAL LOCKDOWN ENGAGED");
      setConsoleLogs((prev) => [
        ...prev.slice(-15),
        `[${new Date().toLocaleTimeString()}] !!! CRITICAL: FULL SYSTEM ISOLATION INITIATED !!!`,
      ]);
    } else {
      toast.success("Lockdown terminated. Syncing nodes...");
      setConsoleLogs((prev) => [
        ...prev.slice(-15),
        `[${new Date().toLocaleTimeString()}] STATUS: Security level normalized. Re-establishing uplinks.`,
      ]);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);


  // Render authentication screen if not authenticated
  if (!isAuthenticated) return <SecurityPortal onAccessGranted={handleAccessGranted} />;

  // Render main dashboard
  return (
    <div
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
      <nav className="fixed top-0 left-0 right-0 h-20 border-b border-white/10 bg-gradient-to-b from-black/90 to-black/70 backdrop-blur-3xl z-40 px-8 flex items-center justify-between shadow-[0_0_40px_rgba(0,255,153,0.1)]">
        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="p-3 rounded-2xl bg-gradient-to-br from-black/50 to-black/30 border border-white/30 hover:border-[var(--active-neon)]/50 hover:bg-[var(--active-neon)]/10 hover:shadow-[0_0_25px_var(--active-neon)] transition-all group backdrop-blur-md"
            title="Open Sidebar Menu"
          >
            <Menu className="w-6 h-6 text-zinc-300 group-hover:text-[var(--active-neon)] transition-colors" />
          </motion.button>
          <motion.div
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 bg-gradient-to-tr from-[var(--active-neon)]/30 to-emerald-500/30 border border-[var(--active-neon)]/50 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,255,153,0.25)] group transition-all cursor-pointer"
          >
            <ShieldCheck className="w-7 h-7 text-[var(--active-neon)] group-hover:scale-125 transition-transform" />
          </motion.div>
          <div className="text-right ml-auto">
            <div className="text-xs font-black text-white leading-none mb-1">
              SYS CLOCK
            </div>
            <div className="text-[10px] text-[var(--active-neon)] font-bold uppercase tracking-widest">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mt-1">
              Uptime: {uptime}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-white font-black tracking-[-0.05em] text-2xl">
              ORCHIDS
            </h1>
            <span className="text-[var(--active-neon)] font-black text-2xl">
              INTEL
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full bg-green-500 animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            {headerInfo}
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-10 bg-gradient-to-r from-white/5 to-[var(--active-neon)]/5 px-8 py-3 rounded-full border border-white/10 backdrop-blur-md hover:border-[var(--active-neon)]/30 transition-all shadow-[0_0_20px_rgba(0,255,153,0.1)]">
          <NavStatV3
            label="CPU LOAD"
            value={`${systemStats.cpu.toFixed(0)}%`}
            progress={systemStats.cpu}
            color="neon"
          />
          <div className="w-[1px] h-6 bg-gradient-to-b from-white/10 to-transparent" />
          <NavStatV3
            label="ENCRYPTION"
            value={`${systemStats.encryption} BIT`}
            progress={100}
            color="blue"
          />
          <div className="w-[1px] h-6 bg-gradient-to-b from-white/10 to-transparent" />
          <NavStatV3
            label="ACTIVE THREATS"
            value={systemStats.threats.toString()}
            progress={systemStats.threats * 10}
            color="red"
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase\">
              UPTIME
            </span>
            <span className="text-xs font-black text-[var(--active-neon)] drop-shadow-[0_0_8px_rgba(0,255,153,0.4)]">
              {systemStats.uptime}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowLogsModal(true);
              if (window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance(
                  "Opening system execution logs. Secure City IQ history loaded."
                );
                utterance.rate = 0.8;
                utterance.pitch = 0.8;
                utterance.volume = 0.7;
                window.speechSynthesis.speak(utterance);
              }
            }}
            className="relative w-11 h-11 bg-gradient-to-br from-white/10 to-white/5 hover:from-[var(--active-neon)]/20 hover:to-[var(--active-neon)]/5 border border-white/20 hover:border-[var(--active-neon)]/50 rounded-2xl flex items-center justify-center transition-all group shadow-[0_0_15px_rgba(0,255,153,0.0)] hover:shadow-[0_0_20px_rgba(0,255,153,0.3)]"
            title="View System Logs"
          >
            <FileText className="w-5 h-5 text-zinc-300 group-hover:text-[var(--active-neon)] transition-colors" />
          </motion.button>
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
              <div className="text-xs font-black text-white leading-none mb-1">
                SUPER_USER
              </div>
              <div className="text-[9px] text-[var(--active-neon)] font-black uppercase tracking-widest drop-shadow-[0_0_8px_rgba(0,255,153,0.3)]">
                CLEARANCE LVL 5
              </div>
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
                <div className="flex items-center justify-center h-full text-white text-xl font-black">
                  Audit Logs View (Coming Soon)
                </div>
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
                <div className="flex items-center justify-center h-full text-white text-xl font-black">
                  Keys & Vaults View (Coming Soon)
                </div>
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
                <div className="flex items-center justify-center h-full text-white text-xl font-black">
                  Biometric Logs View (Coming Soon)
                </div>
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
                <div className="flex items-center justify-center h-full text-white text-xl font-black">
                  Simulated Attack Lab View (Coming Soon)
                </div>
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
    </div>
  );
}


