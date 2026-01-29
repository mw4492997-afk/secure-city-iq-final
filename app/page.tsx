"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CyberPulse from "../components/CyberPulse";
import RadarHUD from "../components/RadarHUD";
import ThreatCard from "../components/ThreatCard";
import TerminalLogs from "../components/TerminalLogs";

export default function Home() {
  const router = useRouter();
  const [emergency, setEmergency] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('session') !== 'active') {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    document.documentElement.setAttribute("data-emergency", emergency.toString());
  }, [emergency]);

  const toggleEmergency = () => {
    setEmergency(!emergency);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-[var(--cyber-bg)] font-sans text-zinc-100 overflow-hidden transition-colors duration-500">
      <CyberPulse />

      <main className="relative z-10 flex flex-col items-center w-full max-w-6xl px-6 pt-12 pb-40">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between w-full mb-16 gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="relative group">
              <div className="absolute -inset-4 bg-[var(--active-neon)]/20 rounded-full blur-2xl group-hover:bg-[var(--active-neon)]/30 transition-all duration-500" />
              <Image
                className="relative drop-shadow-[0_0_15px_var(--active-neon-glow)] invert"
                src="/next.svg"
                alt="Next.js logo"
                width={150}
                height={30}
                priority
              />
            </div>
            <h1 className="neon-text text-4xl md:text-5xl font-bold tracking-tighter mt-4">
              SECURE CITY IQ
            </h1>
            <p className="text-sm md:text-base text-[var(--active-neon)]/60 font-mono tracking-widest uppercase">
              // Urban Intelligence HUD v4.0.2
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <RadarHUD />
            <button
              onClick={toggleEmergency}
              className={`px-8 py-3 rounded-full font-bold uppercase tracking-widest transition-all duration-300 border-2 ${
                emergency 
                  ? "bg-red-600 border-red-400 text-white emergency-pulse" 
                  : "glass-button border-[var(--active-neon)]/30"
              }`}
            >
              {emergency ? "Abort Emergency" : "Emergency Protocol"}
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
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

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-6 mt-16 w-full">
          <a href="#" className="glass-button flex items-center gap-3 px-10 py-4 text-sm font-bold uppercase tracking-widest">
            System Diagnostics
          </a>
          <a href="#" className="glass-button flex items-center gap-3 px-10 py-4 text-sm font-bold uppercase tracking-widest">
            Node Topology
          </a>
          <a href="#" className="glass-button flex items-center gap-3 px-10 py-4 text-sm font-bold uppercase tracking-widest">
            Security Ledger
          </a>
        </div>
      </main>

      <TerminalLogs />

      {/* Decorative corner accents */}
      <div className="fixed top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-[var(--active-neon)]/30 m-8 rounded-tl-3xl pointer-events-none transition-colors duration-500" />
      <div className="fixed bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-[var(--active-neon)]/30 m-8 rounded-br-3xl pointer-events-none transition-colors duration-500" />
    </div>
  );
}
