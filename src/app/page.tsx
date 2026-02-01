"use client";

import { useState, useEffect, useRef } from "react";
import RadarHUD from "@/components/RadarHUD";
import TerminalLogs from "@/components/TerminalLogs";
import SecurityPortal from "@/components/SecurityPortal";
import ThreatMap from "@/components/ThreatMap";
import { Toaster, toast } from "sonner";
import { 
  Shield, Lock, AlertTriangle, CheckCircle, XCircle, 
  Loader2, Activity, Globe, Database, Server,
  Terminal, ShieldCheck, Zap, Menu, Bell, User,
  ArrowRight, Search, BarChart3, Radio, Scan,
  Wifi, Layers, Eye, Target, Cpu as CpuIcon,
  ShieldAlert, HardDrive, Network, Key,
  Fingerprint, Cpu, ZapOff, RefreshCcw,
  Maximize2, Crosshair, Map as MapIcon,
  Activity as PulseIcon, ShieldX, TerminalSquare,
  LockKeyhole, Signal, Binary, DatabaseZap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CyberPulse from "@/components/CyberPulse";

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
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [command, setCommand] = useState("");
  const [redAlert, setRedAlert] = useState(false);
  const [scanTarget, setScanTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [headerInfo, setHeaderInfo] = useState("NODE: OSL-CENTRAL // CRYPTO_SECURED");
  const [systemStats, setSystemStats] = useState({
    cpu: 12,
    ram: 45,
    network: 1.2,
    threats: 3,
    uptime: "124:12:44",
    encryption: 256
  });

  const [activeThreats, setActiveThreats] = useState([
    { id: 1, type: "DDoS Attempt", origin: "RU_NODE_X", severity: "High", time: "2s ago" },
    { id: 2, type: "SQL Injection", origin: "CN_PROXY_0", severity: "Medium", time: "15s ago" },
    { id: 3, type: "Brute Force", origin: "UNKNOWN_IP", severity: "Low", time: "1m ago" },
    { id: 4, type: "Malware Payload", origin: "DE_STUTTGART", severity: "High", time: "5s ago" },
  ]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const baseCpu = (navigator.hardwareConcurrency || 4) * 10; // Scale CPU cores to percentage
    const baseRam = ((navigator as any).deviceMemory || 8) * 10; // Scale RAM to percentage
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        cpu: Math.min(100, Math.max(0, baseCpu + (Math.random() * 20 - 10))),
        ram: Math.min(100, Math.max(0, baseRam + (Math.random() * 10 - 5))),
        network: Math.max(0.1, prev.network + (Math.random() * 0.8 - 0.4)),
        threats: Math.max(0, prev.threats + (Math.random() > 0.85 ? 1 : Math.random() < 0.15 ? -1 : 0))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

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
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      const logs = [
        "HEURISTIC ANALYSIS: 98.4% Confidence Score",
        "BLOCKING IP: 185.12.4.92 (Excessive Handshakes)",
        "ENCRYPTION ROTATED: Key SHA-512 Refreshed",
        "SIGNAL INTERCEPT: Proxy-Layer-4 Decrypted",
        "DATABASE SHARDING: Node-Asia Balanced",
        "INTRUSION DETECTED: Node 14 - Auto-Quarantined",
        "FIREWALL: Rule #402 Updated for Zero-Day Protection",
        "MALWARE SCAN: Clean - 0 objects found in Buffer",
        "UPTIME STABLE: All microservices responding in <4ms",
        "AI_SENTINEL: Pattern matching complete. No anomalies.",
        "KERNEL: Memory allocation optimized for threat analysis"
      ];
      const newLog = `[${new Date().toLocaleTimeString()}] ${logs[Math.floor(Math.random() * logs.length)]}`;
      setConsoleLogs(prev => [...prev.slice(-25), newLog]);
    }, 3500);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setConsoleLogs(prev => [...prev.slice(-25), `[${new Date().toLocaleTimeString()}] IP DETECTED: ${data.ip} | CITY: ${data.city} | ISP: ${data.org}`]);
        setHeaderInfo(`NODE: ${data.city} // ${data.org}`);
      })
      .catch(err => {
        setConsoleLogs(prev => [...prev.slice(-25), `[${new Date().toLocaleTimeString()}] IP FETCH FAILED: ${err.message}`]);
      });
  }, [isAuthenticated]);

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
      setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] !!! CRITICAL: FULL SYSTEM ISOLATION INITIATED !!!`]);
    } else {
      toast.success("Lockdown terminated. Syncing nodes...");
      setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] STATUS: Security level normalized. Re-establishing uplinks.`]);
    }
  };

  const handleQuickScan = async () => {
    if (!scanTarget.trim()) return;
    setIsScanning(true);
    setScanResult(null);
    toast.info(`Initializing Neural Scan: ${scanTarget}`);

    try {
      const response = await fetch(`https://ipapi.co/${scanTarget.trim()}/json/`);

      if (!response.ok) throw new Error("Invalid IP or network error");

      const data = await response.json();

      // Map IP API response to scanResult format
      const scanResult = {
        severity: data.country === 'US' ? 'Low' : 'Medium', // Example logic
        vulnerabilities: [], // No vulnerabilities for IP scan
        ssl_info: { valid: true }, // Assume valid for IP
        ip: data.ip,
        city: data.city,
        org: data.org
      };

      setScanResult(scanResult);
      setConsoleLogs(prev => [...prev.slice(-15),
        `[${new Date().toLocaleTimeString()}] NEURAL_SCAN: Analysis finished for target ${scanTarget}`,
        `[${new Date().toLocaleTimeString()}] IP_LOCATED: ${data.ip} | ${data.city}, ${data.country} | ${data.org}`,
        `[${new Date().toLocaleTimeString()}] VULN_ASSESS: 0 vulnerabilities mapped`
      ]);
      toast.success(`Analysis Complete. Risk mapped.`);
    } catch (error) {
      toast.error("Scan engine timed out. Target might be invalid IP.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleCommand = (cmd: string) => {
    const commandText = cmd.trim().toLowerCase();
    if (!commandText) return;

    if (commandText === 'help') {
      setConsoleLogs(prev => [...prev.slice(-15), 
        "COMMAND_LIST: scan, status, clear, lockdown, decrypt, trace, nodes"
      ]);
    } else if (commandText === 'clear') {
      setConsoleLogs([]);
    } else if (commandText === 'lockdown') {
      handleActivateLockdown();
    } else if (commandText === 'decrypt') {
      toast.promise(new Promise(res => setTimeout(res, 2000)), {
        loading: 'Decrypting packet buffer...',
        success: 'Decryption complete. No hidden payloads.',
        error: 'Decryption failed.'
      });
    } else {
      setConsoleLogs(prev => [...prev.slice(-15), `SYSTEM_RUN: ${commandText}`]);
      setTimeout(() => {
        setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] Process ID ${Math.floor(Math.random() * 9999)} completed`]);
      }, 800);
    }
  };

  if (!isAuthenticated) {
    return <SecurityPortal onAccessGranted={handleAccessGranted} />;
  }

  return (
    <div className={`min-h-screen bg-[#020202] text-zinc-300 font-mono selection:bg-[var(--active-neon)] selection:text-black overflow-hidden relative ${redAlert ? 'animate-pulse bg-red-950/20' : ''}`}>
      {/* Cinematic Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#0a0a0a_0%,#000_100%)]" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Dynamic Light Streaks */}
        <motion.div 
          animate={{ x: [-1000, 2000], opacity: [0, 0.5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-0 w-[500px] h-[1px] bg-gradient-to-r from-transparent via-[var(--active-neon)] to-transparent blur-sm" 
        />
        <motion.div 
          animate={{ x: [2000, -1000], opacity: [0, 0.3, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-3/4 left-0 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-sm" 
        />
      </div>
      
      {/* Red Alert Overlay */}
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

      {/* Ultra-High-End Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 border-b border-white/5 bg-black/80 backdrop-blur-2xl z-40 px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 90 }}
            className="w-12 h-12 bg-gradient-to-tr from-[var(--active-neon)]/20 to-emerald-500/20 border border-[var(--active-neon)]/40 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,255,153,0.15)] group transition-all"
          >
            <ShieldCheck className="w-7 h-7 text-[var(--active-neon)] group-hover:scale-110 transition-transform" />
          </motion.div>
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-white font-black tracking-[-0.05em] text-2xl">ORCHIDS</h1>
              <span className="text-[var(--active-neon)] font-black text-2xl">INTEL</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
              <div className="flex gap-1">
                {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
              </div>
              {headerInfo}
            </div>
          </div>
        </div>

        {/* Global Live Stats Bar */}
        <div className="hidden xl:flex items-center gap-10 bg-white/5 px-8 py-3 rounded-full border border-white/5 backdrop-blur-md">
          <NavStatV3 label="CPU LOAD" value={`${systemStats.cpu.toFixed(0)}%`} progress={systemStats.cpu} color="neon" />
          <div className="w-[1px] h-6 bg-white/10" />
          <NavStatV3 label="ENCRYPTION" value={`${systemStats.encryption} BIT`} progress={100} color="blue" />
          <div className="w-[1px] h-6 bg-white/10" />
          <NavStatV3 label="ACTIVE THREATS" value={systemStats.threats.toString()} progress={systemStats.threats * 10} color="red" />
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">UPTIME</span>
            <span className="text-xs font-black text-white">{systemStats.uptime}</span>
          </div>
          <button className="relative w-11 h-11 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center transition-all group">
            <Bell className="w-5 h-5 text-zinc-400 group-hover:text-white" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black animate-ping" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black" />
          </button>
          <div className="flex items-center gap-4 pl-4 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-black text-white leading-none mb-1">SUPER_USER</div>
              <div className="text-[9px] text-[var(--active-neon)] font-black uppercase tracking-widest">CLEARANCE LVL 5</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 p-[1px] shadow-2xl">
              <div className="w-full h-full rounded-[inherit] bg-black flex items-center justify-center">
                <User className="w-6 h-6 text-zinc-400" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main OS Layout */}
      <div className="pt-20 h-screen flex">
        
        {/* Left Nav Menu - Sophisticated */}
        <aside className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-md hidden lg:flex flex-col">
          <div className="p-8 flex-1 space-y-10 overflow-y-auto custom-scrollbar">
            <div>
              <h3 className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <div className="w-4 h-[1px] bg-zinc-800" /> SYSTEM CONTROL
              </h3>
              <div className="space-y-1.5">
                <MenuLink icon={<BarChart3 className="w-4 h-4" />} label="Command Center" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <MenuLink icon={<Globe className="w-4 h-4" />} label="Global Intelligence" active={activeTab === 'intelligence'} onClick={() => setActiveTab('intelligence')} />
                <MenuLink icon={<Network className="w-4 h-4" />} label="Node Topology" onClick={() => setActiveTab('topology')} />
                <MenuLink icon={<Radio className="w-4 h-4" />} label="Signal Intercept" onClick={() => setActiveTab('signal')} />
              </div>
            </div>
            
            <div>
              <h3 className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <div className="w-4 h-[1px] bg-zinc-800" /> DEFENSE DEPT
              </h3>
              <div className="space-y-1.5">
                <MenuLink icon={<ShieldAlert className="w-4 h-4" />} label="Active Firewall" onClick={() => setActiveTab('firewall')} />
                <MenuLink icon={<Scan className="w-4 h-4" />} label="Vulnerability Scan" onClick={() => setActiveTab('scan')} />
                <MenuLink icon={<Key className="w-4 h-4" />} label="Keys & Vaults" onClick={() => setActiveTab('vaults')} />
                <MenuLink icon={<Fingerprint className="w-4 h-4" />} label="Biometric Logs" onClick={() => setActiveTab('biometric')} />
              </div>
            </div>

            <div className="pt-4">
               <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900/50 to-black border border-white/5 space-y-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck className="w-12 h-12" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-black uppercase">Core Integrity</span>
                    <span className="text-xs text-[var(--active-neon)] font-black">STABLE</span>
                  </div>
                  <div className="flex gap-1.5 h-6 items-end">
                    {[40, 70, 45, 90, 65, 80, 50, 95, 85].map((h, i) => (
                      <motion.div 
                        key={i}
                        className="flex-1 bg-[var(--active-neon)]/30 rounded-t-sm"
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse', delay: i * 0.1 }}
                      />
                    ))}
                  </div>
               </div>
            </div>

            <div className="pt-4">
               <h3 className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <div className="w-4 h-[1px] bg-zinc-800" /> DATA STREAM
              </h3>
              <div className="h-40 overflow-hidden bg-black/40 rounded-2xl border border-white/5 relative">
                <DataStream />
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-white/5">
            <button 
              onClick={handleActivateLockdown}
              className={`w-full py-4 rounded-2xl border font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-700 flex items-center justify-center gap-4 group ${
                redAlert 
                ? 'bg-red-500 border-red-500 text-white shadow-[0_0_50px_rgba(239,68,68,0.4)] animate-pulse' 
                : 'bg-zinc-900/50 border-white/10 text-zinc-400 hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/5'
              }`}
            >
              {redAlert ? <ZapOff className="w-4 h-4 animate-bounce" /> : <Lock className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
              {redAlert ? 'RELEASE PROTOCOLS' : 'INITIATE LOCKDOWN'}
            </button>
          </div>
        </aside>

        {/* Main Intelligence Workspace */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-10 max-w-[1600px] mx-auto space-y-12 pb-32"
          >
            
            {/* Cinematic Intelligence Banner */}
            <motion.div 
              variants={itemVariants}
              className="relative min-h-[500px] rounded-[3rem] overflow-hidden border border-white/5 bg-[#050505] shadow-[0_0_100px_rgba(0,0,0,0.5)] group"
            >
              {/* Animated Background Visual */}
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(0,255,153,0.1)_0%,transparent_70%)]" />
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                </div>
                <div className="absolute right-[-5%] top-[-5%] w-[900px] h-[900px] opacity-15">
                   <RadarHUD />
                </div>
              </div>

              {/* Decorative Tech Corners */}
              <div className="absolute top-10 left-10 w-24 h-24 border-t-[3px] border-l-[3px] border-[var(--active-neon)]/40 rounded-tl-3xl" />
              <div className="absolute bottom-10 right-10 w-24 h-24 border-b-[3px] border-r-[3px] border-[var(--active-neon)]/40 rounded-br-3xl" />

              <div className="relative z-10 p-20 h-full flex flex-col justify-center max-w-3xl space-y-8">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-[0.3em] backdrop-blur-xl"
                >
                  <PulseIcon className="w-4 h-4 text-[var(--active-neon)] animate-pulse" />
                  Live Operational Grid: ALPHA-NODE ACTIVE
                </motion.div>
                
                <h2 className="text-8xl md:text-9xl font-black text-white tracking-[-0.07em] leading-[0.85]">
                  <GlitchText text="NEURAL" /> <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--active-neon)] via-emerald-400 to-blue-500 animate-gradient-x">OVERWATCH</span>
                </h2>
                
                <p className="text-zinc-400 text-xl leading-relaxed font-medium max-w-xl">
                  Autonomous intelligence layer for real-time cyber defense and global threat neutralization. 
                  Synchronizing <span className="text-white">4,092 neural nodes</span> for total perimeter dominance.
                </p>

                <div className="flex items-center gap-10 pt-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">Protection Level</span>
                    <div className="flex gap-1.5">
                      {[1,2,3,4,5].map(i => <div key={i} className="w-8 h-2 bg-[var(--active-neon)] rounded-full shadow-[0_0_15px_rgba(0,255,153,0.5)]" />)}
                    </div>
                  </div>
                  <div className="h-12 w-[1px] bg-white/10" />
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <div className="text-xs font-black text-white uppercase tracking-widest leading-none mb-1">Network Health</div>
                      <div className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Optimal Performance</div>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-green-500 shadow-[0_0_25px_rgba(34,197,94,0.6)] animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Global Intelligence Section */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                      <Globe className="w-6 h-6 text-blue-400" />
                   </div>
                   <h3 className="font-black text-white uppercase tracking-[0.2em] text-xl">Global Threat Intelligence</h3>
                </div>
                <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
              <ThreatMap />
            </motion.div>

            {/* Core Intelligence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Threat Matrix - Center Stage */}
              <motion.div variants={itemVariants} className="lg:col-span-8 space-y-10">
                <div className="bg-[#080808] border border-white/5 rounded-[3rem] p-12 relative overflow-hidden group shadow-2xl">
                  {/* Visual Background Accents */}
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <Target className="w-72 h-72 text-blue-500" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-12 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center">
                        <Crosshair className="w-10 h-10 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-black text-white uppercase tracking-[0.15em] text-2xl">Tactical Analysis Engine</h3>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em]">Deep packet inspection & Vulnerability mapping</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Engine Status:</span>
                       <div className="px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400">NOMINAL</div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 relative z-10 mb-12">
                    <div className="flex-1 relative group/input">
                      <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl group-focus-within/input:bg-blue-500/10 transition-all" />
                      <input 
                        type="text"
                        value={scanTarget}
                        onChange={(e) => setScanTarget(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleQuickScan()}
                        placeholder="ENTER TARGET SIGNATURE (IP, URL, NODE_ID)..."
                        className="w-full bg-black/80 border border-white/10 rounded-2xl px-10 py-6 text-lg text-[var(--active-neon)] focus:border-blue-500/50 focus:bg-black outline-none transition-all placeholder:text-zinc-800 font-bold tracking-wide relative z-10"
                      />
                      <Search className="absolute right-8 top-1/2 -translate-y-1/2 w-8 h-8 text-zinc-700 pointer-events-none z-10" />
                    </div>
                    <button 
                      onClick={handleQuickScan}
                      disabled={isScanning || !scanTarget}
                      className="bg-white text-black px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-[0.3em] hover:bg-[var(--active-neon)] hover:text-black hover:shadow-[0_0_50px_rgba(0,255,153,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-4 group/btn"
                    >
                      {isScanning ? <RefreshCcw className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-current group-hover/btn:animate-pulse" />}
                      {isScanning ? 'MAPPING...' : 'EXECUTE SCAN'}
                    </button>
                  </div>

                  {/* High-Impact Result Visualization */}
                  <AnimatePresence>
                    {scanResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="mt-12 pt-12 border-t border-white/5 relative z-10 space-y-10"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                           <IntelMetric label="Security Score" value="A+" sub="Verified Node" icon={<ShieldCheck className="w-6 h-6" />} color="blue" />
                           <IntelMetric label="Threat Level" value={scanResult.severity.toUpperCase()} sub="Level 0-2 Scale" icon={<ShieldAlert className="w-6 h-6" />} color={scanResult.severity === 'High' ? 'red' : 'yellow'} />
                           <IntelMetric label="Vulnerabilities" value={scanResult.vulnerabilities.length} sub="Patches Pending" icon={<AlertTriangle className="w-6 h-6" />} color="red" />
                           <IntelMetric label="Latency" value="18ms" sub="Uplink Fast" icon={<Activity className="w-6 h-6" />} color="green" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="p-10 rounded-[2.5rem] bg-black/60 border border-white/5 hover:border-blue-500/20 transition-all group/res">
                              <div className="flex items-center justify-between mb-6">
                                 <div className="p-4 bg-blue-500/10 rounded-2xl">
                                    <MapIcon className="w-8 h-8 text-blue-400" />
                                 </div>
                                 <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Network Trace</span>
                              </div>
                              <div className="space-y-2">
                                 <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Identified Endpoint</div>
                                 <div className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">{scanTarget}</div>
                              </div>
                           </div>
                           <div className="p-10 rounded-[2.5rem] bg-black/60 border border-white/5 hover:border-emerald-500/20 transition-all group/res">
                              <div className="flex items-center justify-between mb-6">
                                 <div className="p-4 bg-emerald-500/10 rounded-2xl">
                                    <Lock className="w-8 h-8 text-emerald-400" />
                                 </div>
                                 <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">SSL Certificate</span>
                              </div>
                              <div className="space-y-2">
                                 <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Encryption Status</div>
                                 <div className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">{scanResult.ssl_info.valid ? 'CRYPTO_SECURE' : 'EXPOSED_RAW'}</div>
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sub-Intelligence Panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <ComplexStatusCard 
                    title="Neural Integrity" 
                    icon={<Cpu className="w-7 h-7" />} 
                    status="Operational" 
                    color="green"
                    progress={99.1}
                    value="4.2 TFlops"
                  />
                  <ComplexStatusCard 
                    title="Storage Hardening" 
                    icon={<HardDrive className="w-7 h-7" />} 
                    status="Encrypted" 
                    color="blue"
                    progress={84.3}
                    value="12.8 PB"
                  />
                </div>
              </motion.div>

              {/* Right Side - Intelligence Feeds & Visuals */}
              <motion.div variants={itemVariants} className="lg:col-span-4 space-y-10">
                
                {/* Visual Radar Unit */}
                <div className="bg-[#080808] border border-white/5 rounded-[3rem] p-12 flex flex-col items-center relative overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between w-full mb-12 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                        <Radio className="w-7 h-7 text-green-400" />
                      </div>
                      <h3 className="font-black text-white uppercase tracking-[0.2em] text-sm">Long Range Radar</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
                      <span className="text-[10px] text-green-500 font-black tracking-widest">SCANNING...</span>
                    </div>
                  </div>
                  
                  <div className="w-full aspect-square relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,153,0.1)_0%,transparent_80%)]" />
                    <RadarHUD />
                    {/* Visual Overlay Elements */}
                    <div className="absolute inset-0 border border-white/5 rounded-full pointer-events-none" />
                    <div className="absolute inset-[15%] border border-white/5 rounded-full pointer-events-none" />
                    <div className="absolute inset-[30%] border border-white/5 rounded-full pointer-events-none" />
                  </div>

                  <div className="w-full mt-12 grid grid-cols-2 gap-8">
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center group hover:bg-white/10 transition-all">
                      <div className="text-[10px] text-zinc-600 uppercase font-black mb-3 tracking-[0.2em]">Targets</div>
                      <div className="text-4xl font-black text-white group-hover:text-[var(--active-neon)] transition-colors">24</div>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center group hover:bg-white/10 transition-all">
                      <div className="text-[10px] text-zinc-600 uppercase font-black mb-3 tracking-[0.2em]">Proximity</div>
                      <div className="text-4xl font-black text-white group-hover:text-blue-400 transition-colors">LOW</div>
                    </div>
                  </div>
                </div>

                {/* Live Threat Intercepts */}
                <div className="bg-[#080808] border border-white/5 rounded-[3rem] flex flex-col shadow-2xl overflow-hidden min-h-[500px]">
                  <div className="p-8 border-b border-white/5 bg-zinc-900/40 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-white">Threat Intercepts</span>
                    </div>
                    <Maximize2 className="w-5 h-5 text-zinc-700 hover:text-white cursor-pointer transition-colors" />
                  </div>
                  <div className="flex-1 p-10 space-y-8 overflow-hidden relative">
                    {activeThreats.map((threat, i) => (
                      <motion.div 
                        initial={{ x: 30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        key={threat.id}
                        className="flex items-center justify-between group cursor-default"
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                            threat.severity === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                          }`}>
                            <AlertTriangle className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-base font-black text-white group-hover:text-[var(--active-neon)] transition-colors">{threat.type}</div>
                            <div className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest">{threat.origin}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-[11px] font-black uppercase tracking-widest ${threat.severity === 'High' ? 'text-red-500' : 'text-yellow-500'}`}>{threat.severity}</div>
                          <div className="text-[10px] text-zinc-700 font-black uppercase">{threat.time}</div>
                        </div>
                      </motion.div>
                    ))}
                    {/* Decorative Grid Lines */}
                    <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </main>
        
        {/* Extreme Tactical Side-Panel (Terminal) */}
        <aside className="w-[550px] border-l border-white/5 bg-black/60 backdrop-blur-xl hidden xl:flex flex-col">
          <div className="p-10 border-b border-white/5 bg-zinc-950/50 flex items-center justify-between">
             <div className="flex items-center gap-5">
               <div className="w-12 h-12 bg-[var(--active-neon)]/10 rounded-xl flex items-center justify-center border border-[var(--active-neon)]/30">
                 <TerminalSquare className="w-7 h-7 text-[var(--active-neon)]" />
               </div>
               <div>
                <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white leading-none mb-2">Command & Control</h3>
                <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Session: ADMIN_ALPHA_01</span>
               </div>
             </div>
             <div className="flex gap-3">
               <div className="w-4 h-4 rounded-full bg-zinc-800 hover:bg-red-500 transition-colors cursor-pointer" />
               <div className="w-4 h-4 rounded-full bg-zinc-800 hover:bg-yellow-500 transition-colors cursor-pointer" />
               <div className="w-4 h-4 rounded-full bg-zinc-800 hover:bg-green-500 transition-colors cursor-pointer" />
             </div>
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            <TerminalLogs logs={consoleLogs} onEmergency={handleActivateLockdown} />
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
          </div>

          <div className="p-12 bg-black/80 border-t border-white/5">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[var(--active-neon)]/30 via-blue-500/30 to-[var(--active-neon)]/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-1000" />
              <div className="relative flex items-center">
                <span className="absolute left-8 text-[var(--active-neon)] text-xl font-black animate-pulse">❯</span>
                <input 
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCommand(command);
                      setCommand('');
                    }
                  }}
                  placeholder="INPUT PROTOCOL COMMAND..."
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl pl-16 pr-8 py-7 text-base text-[var(--active-neon)] focus:border-[var(--active-neon)]/50 focus:bg-black outline-none transition-all font-black tracking-[0.2em] placeholder:text-zinc-800"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-between items-center px-4">
               <div className="flex items-center gap-4">
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                 <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Connection: AES-256-GCM</span>
               </div>
               <span className="text-[10px] text-zinc-700 font-black tracking-widest uppercase">STDOUT: 2.1.0_PRO</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Decorative OS Accents */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">
        <div className="absolute top-12 left-12 w-24 h-24 border-t-2 border-l-2 border-white/5 rounded-tl-[3rem]" />
        <div className="absolute top-12 right-12 w-24 h-24 border-t-2 border-r-2 border-white/5 rounded-tr-[3rem]" />
        <div className="absolute bottom-12 left-12 w-24 h-24 border-b-2 border-l-2 border-white/5 rounded-bl-[3rem]" />
        <div className="absolute bottom-12 right-12 w-24 h-24 border-b-2 border-r-2 border-white/5 rounded-br-[3rem]" />
      </div>
    </div>
  );
}

function MenuLink({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-6 px-7 py-5 rounded-2xl text-[12px] font-black transition-all relative group ${
      active 
      ? 'bg-white/5 text-white border border-white/10 shadow-2xl' 
      : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
    }`}>
      <span className={`${active ? 'text-[var(--active-neon)]' : 'text-zinc-600 group-hover:text-zinc-400'} transition-colors`}>
        {icon}
      </span>
      <span className="tracking-[0.2em] uppercase">{label}</span>
      {active && (
        <motion.div 
          layoutId="sidebar-active-v3"
          className="ml-auto w-2 h-2 rounded-full bg-[var(--active-neon)] shadow-[0_0_20px_var(--active-neon)]" 
        />
      )}
    </button>
  );
}

function NavStatV3({ label, value, progress, color }: { label: string, value: string, progress: number, color: 'neon' | 'blue' | 'red' }) {
  const colors = {
    neon: 'bg-[var(--active-neon)] text-[var(--active-neon)]',
    blue: 'bg-blue-500 text-blue-500',
    red: 'bg-red-500 text-red-500',
  };

  return (
    <div className="flex items-center gap-6">
      <div className="text-left">
        <div className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em] leading-none mb-2">{label}</div>
        <div className={`text-base font-black ${colors[color].split(' ')[1]} leading-none tracking-tight`}>{value}</div>
      </div>
      <div className="w-24 h-2 bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5">
        <motion.div 
          className={`h-full rounded-full ${colors[color].split(' ')[0]}`}
          animate={{ width: `${Math.min(100, progress)}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
        />
      </div>
    </div>
  );
}

function IntelMetric({ label, value, sub, icon, color }: { label: string, value: string | number, sub: string, icon: React.ReactNode, color: string }) {
  const colorMap: any = {
    blue: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    red: 'text-red-400 border-red-500/20 bg-red-500/5',
    green: 'text-green-400 border-green-500/20 bg-green-500/5',
    yellow: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5',
    zinc: 'text-zinc-400 border-zinc-500/20 bg-zinc-500/5'
  };

  return (
    <div className={`p-8 rounded-[2.5rem] border ${colorMap[color] || colorMap.zinc} transition-all hover:bg-white/5 group relative overflow-hidden`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <div className="flex items-center justify-between mb-5">
        <span className="text-[10px] uppercase font-black opacity-50 tracking-[0.3em]">{label}</span>
      </div>
      <div className="font-black text-3xl text-white mb-2">{value}</div>
      <div className="text-[10px] uppercase font-bold opacity-30 tracking-widest">{sub}</div>
    </div>
  );
}

function ComplexStatusCard({ title, icon, status, color, progress, value }: { title: string, icon: React.ReactNode, status: string, color: 'green' | 'blue' | 'red', progress: number, value: string }) {
  const colorClasses = {
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  const barColors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
  };

  return (
    <div className="bg-[#080808] border border-white/5 rounded-[3rem] p-12 space-y-10 shadow-2xl group hover:border-white/10 transition-all relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-7">
          <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
          <div>
            <h4 className="font-black text-white text-xl uppercase tracking-[0.2em] leading-none mb-3">{title}</h4>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full animate-pulse ${barColors[color]} shadow-[0_0_10px_currentColor]`} />
              <p className="text-[11px] text-zinc-500 font-black uppercase tracking-widest">{status}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
           <div className="text-3xl font-black text-white">{value}</div>
           <div className="text-[11px] text-zinc-600 font-black uppercase tracking-[0.2em]">Active Load</div>
        </div>
      </div>
      <div className="space-y-4 relative z-10">
        <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em]">
          <span className="text-zinc-600">Integrity Health Index</span>
          <span className={colorClasses[color].split(' ')[0]}>{progress}%</span>
        </div>
        <div className="w-full h-3 bg-black rounded-full overflow-hidden p-[1px] border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 2.5, ease: "circOut" }}
            className={`h-full rounded-full ${barColors[color]} shadow-[0_0_20px_rgba(255,255,255,0.05)]`}
          />
        </div>
      </div>
    </div>
  );
}

function GlitchText({ text }: { text: string }) {
  return (
    <span className="relative inline-block group">
      <span className="relative z-10">{text}</span>
      <span className="absolute inset-0 text-red-500 opacity-0 group-hover:opacity-50 group-hover:animate-glitch-1 pointer-events-none">- {text} -</span>
      <span className="absolute inset-0 text-blue-500 opacity-0 group-hover:opacity-50 group-hover:animate-glitch-2 pointer-events-none">- {text} -</span>
    </span>
  );
}

function DataStream() {
  const [data, setData] = useState<string[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const line = Array.from({ length: 20 }, () => 
        Math.random() > 0.5 ? Math.floor(Math.random() * 16).toString(16).toUpperCase() : (Math.random() > 0.5 ? '1' : '0')
      ).join(' ');
      setData(prev => [line, ...prev].slice(0, 10));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 font-mono text-[8px] text-[var(--active-neon)]/40 space-y-1">
      {data.map((line, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1 - (i * 0.1), x: 0 }}
          className="whitespace-nowrap overflow-hidden"
        >
          {line}
        </motion.div>
      ))}
    </div>
  );
}
