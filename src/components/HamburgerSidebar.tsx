"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Globe, Network, Radio, ShieldAlert, FileText, Terminal, 
  Scan, Key, Fingerprint, Zap, ShieldCheck, Lock, ZapOff, User, BookOpen 
} from "lucide-react";

interface HamburgerSidebarProps {
  openUserGuide: () => void;
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeComponent: string;
  setActiveComponent: (view: string) => void;
  redAlert: boolean;
  showAuditLogsModal: boolean;
  setShowAuditLogsModal: (open: boolean) => void;
  showKaliToolset: boolean;
  setShowKaliToolset: (open: boolean) => void;
  setTestLabMode: (mode: boolean) => void; // dummy for launch attack
  handleActivateLockdown: () => void;
  speakLabel: (label: string) => void;
  t: Record<string, string>;
}

const sidebarVariants = {
  closed: { x: '-100%' },
  open: { x: 0 }
};

const overlayVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 }
};

export default function HamburgerSidebar({ 
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab, 
  activeComponent,
  setActiveComponent,
  redAlert, 
  showAuditLogsModal, 
  setShowAuditLogsModal, 
  showKaliToolset, 
  setShowKaliToolset, 
  setTestLabMode,
  handleActivateLockdown,
  speakLabel,
  openUserGuide,
  t,
}: HamburgerSidebarProps) {
  const handleCommandCenter = () => {
    speakLabel(t.commandCenter);
    setActiveComponent('dashboard');
    onClose();
  };

  const handleGlobalIntelligence = () => {
    speakLabel(t.globalIntelligence);
    setActiveComponent('intelligence');
    onClose();
  };

  const handleNodeTopology = () => {
    speakLabel(t.cyberTopology);
    setActiveComponent('topology');
    onClose();
  };

  const handleSignalIntercept = () => {
    speakLabel(t.signalIntercept);
    setActiveComponent('signal');
    onClose();
  };

  const handleActiveFirewall = () => {
    speakLabel(t.activeFirewall);
    setActiveComponent('firewall');
    onClose();
  };

  const handleSystemAuditLogs = () => {
    speakLabel(t.systemAuditLogsMenu);
    setActiveComponent('logs');
    onClose();
  };

  const handleKaliToolset = () => {
    speakLabel(t.kaliToolset);
    setActiveComponent('kali');
    onClose();
  };

  const handleLaunchSimulatedAttack = () => {
    speakLabel(t.launchAttack);
    setTestLabMode(true);
    setActiveComponent('attack');
    onClose();
  };

  const DataStream = () => (
    <div className="w-full h-full flex items-center justify-center text-[9px] text-zinc-600 font-mono p-3">
      <div className="space-y-1 w-full">
        {['STREAM_ACTIVE', 'DATA_FLOW: 2.4 GB/s', 'PACKETS: 1.2M/s', 'LATENCY: <1ms'].map((text, i) => (
          <div key={i} className="text-[var(--active-neon)]/60 truncate">{text}</div>
        ))}
      </div>
    </div>
  );

  const MenuLink = ({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void; }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-6 px-7 py-5 rounded-2xl text-[12px] font-black transition-all cursor-pointer hover:text-cyan-400 relative group hover:bg-white/10 hover:text-zinc-100 ${
        active 
          ? 'bg-[var(--active-neon)]/10 border border-[var(--active-neon)]/30 text-[var(--active-neon)] shadow-[0_0_20px_rgba(45,212,191,0.3)]' 
          : 'text-zinc-400 hover:border-[var(--active-neon)]/20'
      }`}>
      <motion.span 
        className={`${active ? 'text-[var(--active-neon)] shadow-[0_0_10px_var(--active-neon)] scale-110' : 'text-zinc-600 group-hover:text-[var(--active-neon)] group-hover:shadow-[0_0_15px_var(--active-neon)] group-hover:scale-110'} transition-all`}
        whileHover={{ scale: 1.1, y: -1 }}
        animate={active ? { scale: 1.05 } : {}}
      >
        {icon}
      </motion.span>
      <span className="tracking-[0.2em] uppercase flex-1 text-left">{label}</span>
      {active && (
        <motion.div 
          className="w-2 h-2 rounded-full bg-[var(--active-neon)] shadow-[0_0_10px_var(--active-neon)] animate-pulse" 
        />
      )}
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
          />
          {/* Sidebar */}
          <motion.aside 
            className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-80 z-[100] bg-black/40 backdrop-blur-2xl border-r border-white/5 shadow-2xl shadow-cyan-500/10 rounded-r-3xl overflow-hidden glass-card cursor-pointer pointer-events-auto"
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="p-8 flex-1 space-y-10 overflow-y-auto max-h-[calc(100vh-16rem)] scrollbar-thin scrollbar-thumb-[var(--active-neon)]/30 scrollbar-track-transparent hover:scrollbar-thumb-[var(--active-neon)]/50">
              <div>
                <h3 className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                  <div className="w-4 h-[1px] bg-zinc-800" /> {t.systemControl}
                </h3>
                <div className="space-y-1.5">
                  <MenuLink icon={<BarChart3 className="w-4 h-4" />} label={t.commandCenter} active={activeComponent === 'dashboard'} onClick={handleCommandCenter} />
                  <MenuLink icon={<Globe className="w-4 h-4" />} label={t.globalIntelligence} active={activeComponent === 'intelligence'} onClick={handleGlobalIntelligence} />
                  <MenuLink icon={<Network className="w-4 h-4" />} label={t.cyberTopology} active={activeComponent === 'topology'} onClick={handleNodeTopology} />
                  <MenuLink icon={<Radio className="w-4 h-4" />} label={t.signalIntercept} active={activeComponent === 'signal'} onClick={handleSignalIntercept} />
                </div>
              </div>
              
              <div>
                <h3 className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                  <div className="w-4 h-[1px] bg-zinc-800" /> {t.defenseDept}
                </h3>
                <div className="space-y-1.5">
                  <MenuLink icon={<ShieldAlert className="w-4 h-4" />} label={t.activeFirewall} active={activeComponent === 'firewall'} onClick={handleActiveFirewall} />
                  <MenuLink icon={<FileText className="w-4 h-4" />} label={t.systemAuditLogsMenu} active={activeComponent === 'logs'} onClick={handleSystemAuditLogs} />
                  <MenuLink icon={<Terminal className="w-4 h-4" />} label={t.kaliToolset} active={activeComponent === 'kali'} onClick={handleKaliToolset} />
                  <MenuLink icon={<Scan className="w-4 h-4" />} label={t.vulnerabilityScan} active={activeComponent === 'scanner'} onClick={() => {setActiveComponent('scanner'); onClose();}} />
                  <MenuLink icon={<Key className="w-4 h-4" />} label={t.keysVaults} active={activeComponent === 'vaults'} onClick={() => {setActiveComponent('vaults'); onClose();}} />
                  <MenuLink icon={<Fingerprint className="w-4 h-4" />} label={t.biometricLogs} active={activeComponent === 'biometric'} onClick={() => {setActiveComponent('biometric'); onClose();}} />
                  <MenuLink icon={<Zap className="w-4 h-4" />} label={t.launchAttack} active={activeComponent === 'attack'} onClick={handleLaunchSimulatedAttack} />
                </div>
              </div>

              <div className="pt-4">
                 <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900/50 to-black border border-white/5 space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <ShieldCheck className="w-12 h-12 text-[var(--active-neon)]" />
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
            
            {/* User Profile */}
            <div className="p-6 border-t border-white/10 bg-gradient-to-r from-zinc-900/50 to-black/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[var(--active-neon)]/20 border-2 border-[var(--active-neon)]/50 flex items-center justify-center shadow-[0_0_20px_var(--active-neon)]">
                  <User className="w-6 h-6 text-[var(--active-neon)]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-white text-lg uppercase tracking-wider">KING MUSTAFA</h4>
                  <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 bg-[var(--active-neon)]/20 border border-[var(--active-neon)]/40 rounded-full text-[var(--active-neon)] text-xs font-black uppercase tracking-widest shadow-[0_0_10px_var(--active-neon)]">
                    <ShieldCheck className="w-3 h-3" />
                    Security Clearance: Level 5
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 space-y-3">
              <button
                type="button"
                onClick={openUserGuide}
                className="w-full py-3 rounded-2xl border border-white/10 bg-white/5 text-[11px] uppercase tracking-[0.25em] text-zinc-200 flex items-center justify-center gap-2 hover:bg-[var(--active-neon)]/10 hover:border-[var(--active-neon)]/30 transition"
              >
                <BookOpen className="w-4 h-4" />
                {t.userGuide}
              </button>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={openUserGuide}
                  title={t.userGuide}
                  className="p-3 rounded-3xl border border-white/10 bg-black/30 text-zinc-200 hover:border-[var(--active-neon)]/30 hover:bg-[var(--active-neon)]/10 transition shadow-[0_0_15px_rgba(45,212,191,0.12)]"
                >
                  <BookOpen className="w-5 h-5" />
                </button>
                <span className="text-[11px] text-zinc-400 uppercase tracking-[0.25em] font-black">
                  {t.userGuide}
                </span>
              </div>
              <button 
                onClick={handleActivateLockdown}
                className={`w-full py-4 rounded-2xl border font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-700 flex items-center justify-center gap-4 group hover:shadow-[0_0_20px_var(--active-neon)] hover:scale-[1.02] ${
                  redAlert 
                    ? 'bg-red-500/30 border-red-500 text-red-200 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse' 
                    : 'bg-zinc-900/50 border-white/20 text-zinc-300 hover:border-[var(--active-neon)]/50 hover:text-[var(--active-neon)] hover:bg-[var(--active-neon)]/10'
                }`}
              >
                {redAlert ? <ZapOff className="w-4 h-4 animate-bounce" /> : <Lock className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                {redAlert ? t.releaseProtocols : t.initiateLockdown}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// DataStream component (extracted)
function DataStream() {
  const [data, setData] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      const line = Array.from({ length: 20 }, () => 
        Math.random() > 0.5 ? Math.floor(Math.random() * 16).toString(16).toUpperCase() : (Math.random() > 0.5 ? '1' : '0')
      ).join(' ');
      setData(prev => [line, ...prev].slice(0, 10));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="p-4 font-mono text-[8px] text-[var(--active-neon)]/40 space-y-1">
        <div>Loading data stream...</div>
      </div>
    );
  }

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

