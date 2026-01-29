"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import CyberPulse from "@/components/CyberPulse";
import RadarHUD from "@/components/RadarHUD";
import ThreatCard from "@/components/ThreatCard";
import TerminalLogs from "@/components/TerminalLogs";
import Navbar from "@/components/Navbar";
import SecurityCharts from "@/components/SecurityCharts";
import ThreatMap from "@/components/ThreatMap";
import SecurityPortal from "@/components/SecurityPortal";
import SecurityLedger from "@/components/SecurityLedger";
import { Toaster, toast } from "sonner";
import { ShieldAlert, Globe, Server, Cpu, Activity, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [emergency, setEmergency] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-emergency", emergency.toString());
  }, [emergency]);

  const toggleEmergency = () => {
    const newState = !emergency;
    setEmergency(newState);
    if (newState) {
      toast.error("EMERGENCY PROTOCOL ACTIVATED", {
        description: "Sector 7 isolation in progress. All nodes entering lockdown.",
        icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
      });
    } else {
      toast.success("SYSTEM RESTORED", {
        description: "Standard protocols resuming. Threat neutralized.",
      });
    }
  };

  if (!isAuthenticated) {
    return <SecurityPortal onAccessGranted={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-[var(--cyber-bg)] font-sans text-zinc-100 overflow-x-hidden transition-colors duration-500">
      <div className="crt-overlay" />
      <div className="scanline" />
      <Toaster position="top-right" theme="dark" />
      <CyberPulse />
      <Navbar />

      <main className="relative z-10 flex flex-col items-center w-full max-w-7xl px-6 pt-24 pb-48">
        {/* Header / Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 flex flex-col justify-center gap-6"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[var(--active-neon)]/10 border border-[var(--active-neon)]/30 w-fit">
              <Activity className="w-3 h-3 text-[var(--active-neon)] animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-[var(--active-neon)] uppercase tracking-[0.2em]">Operational Status: Stable</span>
            </div>
            
            <div>
              <h1 className="neon-text text-5xl md:text-7xl font-black tracking-tighter mb-4 uppercase leading-[0.85]">
                Secure City <br />
                <span className="text-white opacity-90">Intelligence</span>
              </h1>
              <p className="max-w-xl text-sm md:text-lg text-zinc-400 font-medium leading-relaxed">
                Next-generation cyber defense orchestration platform. Monitor, detect, and neutralize complex urban threats with neural-link precision.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={toggleEmergency}
                className={`px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 border-2 shadow-2xl ${
                  emergency 
                    ? "bg-red-600/20 border-red-500 text-red-500 shadow-red-500/20 emergency-pulse" 
                    : "glass-button border-[var(--active-neon)]/30 text-[var(--active-neon)] hover:border-[var(--active-neon)]"
                }`}
              >
                {emergency ? "Abort Emergency" : "Activate Lockdown"}
              </button>
              <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                System Reports
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-5 flex items-center justify-center"
          >
            <RadarHUD />
          </motion.div>
        </div>

        {/* Global Threat Map Section */}
        <div className="w-full mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black tracking-widest uppercase flex items-center gap-3">
              <Globe className="w-5 h-5 text-[var(--active-neon)]" />
              Neural Link Topology
            </h2>
            <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--active-neon)]" /> Active</span>
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Alert</span>
            </div>
          </div>
          <ThreatMap />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-12">
          <StatBox icon={<Globe className="w-4 h-4" />} label="Network Load" value="42%" trend="+2.4%" />
          <StatBox icon={<ShieldAlert className="w-4 h-4" />} label="Active Threats" value="03" trend="Stable" />
          <StatBox icon={<Server className="w-4 h-4" />} label="Nodes Active" value="1,248" trend="100%" />
          <StatBox icon={<Cpu className="w-4 h-4" />} label="Core Temp" value="38°C" trend="-1.2%" />
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
          <ThreatCard 
            title="Grid Anomaly" 
            level="High" 
            description="Detected unauthorized access attempt in Sector 7 power distribution node. Isolation protocols active."
          />
          <ThreatCard 
            title="Traffic Flow" 
            level="Normal" 
            description="Autonomous vehicle density within expected parameters. Rerouting optimized for weather conditions."
          />
          <ThreatCard 
            title="Neural Link" 
            level="Stable" 
            description="City-wide interface latency at 12ms. Core processing units operating at 42% capacity."
          />
        </div>

        {/* Visual Analytics */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black tracking-widest uppercase flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Power Consumption
              </h3>
              <span className="text-[10px] font-mono text-[var(--active-neon)]">Real-time</span>
            </div>
            <SecurityCharts />
          </div>
          <SecurityLedger />
        </div>
      </main>

      <TerminalLogs onEmergency={toggleEmergency} />

      {/* Decorative corner accents */}
      <div className="fixed top-0 left-0 w-48 h-48 border-t-2 border-l-2 border-[var(--active-neon)]/20 m-6 rounded-tl-[3rem] pointer-events-none transition-colors duration-500" />
      <div className="fixed bottom-0 right-0 w-48 h-48 border-b-2 border-r-2 border-[var(--active-neon)]/20 m-6 rounded-br-[3rem] pointer-events-none transition-colors duration-500" />
    </div>
  );
}

function StatBox({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: string }) {
  return (
    <div className="glass-card p-5 flex flex-col gap-2 border border-[var(--active-neon)]/10 group hover:border-[var(--active-neon)]/40 transition-all">
      <div className="flex items-center justify-between text-zinc-500">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[9px] uppercase tracking-widest font-bold">{label}</span>
        </div>
        <span className={`text-[8px] font-mono ${trend.includes("+") ? "text-red-400" : trend.includes("-") ? "text-green-400" : "text-zinc-500"}`}>
          {trend}
        </span>
      </div>
      <div className="text-3xl font-black text-white group-hover:neon-text transition-all">{value}</div>
    </div>
  );
}

function LedgerItem({ time, event, status }: { time: string; event: string; status: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 text-[10px] font-mono">
      <span className="text-zinc-500">{time}</span>
      <span className="text-zinc-300 uppercase">{event}</span>
      <span className={status === "Blocked" ? "text-red-500" : "text-[var(--active-neon)]"}>{status}</span>
    </div>
  );
}
