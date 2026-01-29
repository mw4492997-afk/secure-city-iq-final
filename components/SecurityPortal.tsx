"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Unlock, Fingerprint, Cpu } from "lucide-react";

export default function SecurityPortal({ onAccessGranted }: { onAccessGranted: () => void }) {
  const [stage, setStage] = useState<"auth" | "scanning" | "decoding" | "granted">("auth");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (stage === "scanning") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStage("decoding");
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
    
    if (stage === "decoding") {
      const timer = setTimeout(() => {
        setStage("granted");
        setTimeout(onAccessGranted, 1000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [stage, onAccessGranted]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000d0d] overflow-hidden">
      <div className="absolute inset-0 opacity-20 cyber-grid" />
      
      <AnimatePresence mode="wait">
        {stage === "auth" && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center gap-8 z-10"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[var(--active-neon)] opacity-20 blur-2xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-full border-2 border-[var(--active-neon)] flex items-center justify-center">
                <ShieldCheck className="w-12 h-12 text-[var(--active-neon)]" />
              </div>
            </div>
            
            <div className="text-center">
              <h1 className="neon-text text-3xl font-black tracking-widest mb-2 uppercase">Security Gateway</h1>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-tighter">Biometric or Neural Link required</p>
            </div>

            <button 
              onClick={() => setStage("scanning")}
              className="glass-button px-12 py-4 flex items-center gap-4 group"
            >
              <Fingerprint className="w-5 h-5 group-hover:animate-pulse" />
              <span className="font-bold tracking-widest text-sm uppercase">Initialize Auth</span>
            </button>
          </motion.div>
        )}

        {stage === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6 z-10 w-full max-w-xs"
          >
            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden border border-[var(--active-neon)]/20">
              <motion.div 
                className="h-full bg-[var(--active-neon)] shadow-[0_0_10px_var(--active-neon)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between w-full text-[10px] font-mono text-[var(--active-neon)] uppercase tracking-widest">
              <span>Scanning Neural Pattern</span>
              <span>{progress}%</span>
            </div>
          </motion.div>
        )}

        {stage === "decoding" && (
          <motion.div
            key="decoding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 z-10"
          >
            <Cpu className="w-16 h-16 text-[var(--active-neon)] animate-spin-slow" />
            <div className="text-[var(--active-neon)] font-mono text-xs animate-pulse tracking-widest uppercase">
              Decrypting Access Token...
            </div>
          </motion.div>
        )}

        {stage === "granted" && (
          <motion.div
            key="granted"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 z-10"
          >
            <Unlock className="w-20 h-20 text-[var(--active-neon)]" />
            <div className="neon-text text-2xl font-black tracking-[0.5em] uppercase">Access Granted</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative side logs */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2 opacity-30">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="font-mono text-[8px] text-[var(--active-neon)]">
            {Math.random().toString(16).toUpperCase()} // NODE_{i} // STABLE
          </div>
        ))}
      </div>
    </div>
  );
}
