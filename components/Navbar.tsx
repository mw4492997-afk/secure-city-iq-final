import React from 'react';
import { Shield, Activity, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-[var(--active-neon)]/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-[var(--active-neon)]" />
          <span className="text-xl font-black tracking-widest uppercase text-white">CyberGuard</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-[var(--active-neon)] hover:bg-[var(--active-neon)]/10 transition-all">
            <Activity className="w-4 h-4" />
            Dashboard
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-[var(--active-neon)] hover:bg-[var(--active-neon)]/10 transition-all">
            <Shield className="w-4 h-4" />
            Threats
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-[var(--active-neon)] hover:bg-[var(--active-neon)]/10 transition-all">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
