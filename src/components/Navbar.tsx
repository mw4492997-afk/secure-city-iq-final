"use client";

import { Shield, Activity, Share2, Settings, Lock } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[var(--cyber-bg)]/80 backdrop-blur-md border-b border-[var(--active-neon)]/20">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Shield className="w-8 h-8 text-[var(--active-neon)] drop-shadow-[0_0_8px_var(--active-neon-glow)]" />
          <div className="absolute -inset-1 bg-[var(--active-neon)]/20 blur-sm rounded-full animate-pulse" />
        </div>
        <span className="font-bold tracking-tighter text-xl neon-text">SECURE CITY IQ</span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <NavLink icon={<Activity className="w-4 h-4" />} label="Dashboard" active />
        <NavLink icon={<Share2 className="w-4 h-4" />} label="Topology" />
        <NavLink icon={<Lock className="w-4 h-4" />} label="Security" />
        <NavLink icon={<Settings className="w-4 h-4" />} label="Settings" />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end mr-2">
          <span className="text-[10px] text-[var(--active-neon)]/50 font-mono uppercase tracking-widest">Operator</span>
          <span className="text-xs font-mono text-zinc-300">ADMIN_ROOT</span>
        </div>
        <div className="w-10 h-10 rounded-full border border-[var(--active-neon)]/30 flex items-center justify-center bg-zinc-900 group cursor-pointer hover:border-[var(--active-neon)] transition-colors">
          <Lock className="w-4 h-4 text-[var(--active-neon)]/70 group-hover:text-[var(--active-neon)]" />
        </div>
      </div>
    </nav>
  );
}

function NavLink({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link 
      href="#" 
      className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:text-[var(--active-neon)] ${
        active ? "text-[var(--active-neon)]" : "text-zinc-400"
      }`}
    >
      {icon}
      <span>{label}</span>
      {active && <div className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-[var(--active-neon)] shadow-[0_0_8px_var(--active-neon-glow)]" />}
    </Link>
  );
}
