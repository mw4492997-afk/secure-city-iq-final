"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Unlock, Fingerprint, Cpu, Key, User } from "lucide-react";

export default function SecurityPortal({ onAccessGranted }: { onAccessGranted: () => void }) {
  const [stage, setStage] = useState<"login" | "auth" | "scanning" | "decoding" | "granted">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  const startHold = () => {
    setIsHolding(true);
    holdTimerRef.current = setTimeout(() => {
      setStage("scanning");
    }, 1500);
  };

  const endHold = () => {
    setIsHolding(false);
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (username === "admin" && password === "12345") {
      setStage("auth");
    } else {
      setError("ACCESS DENIED: UNAUTHORIZED ENTRY");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000d0d] overflow-hidden">
      <div className="absolute inset-0 opacity-20 cyber-grid" />
      
      <AnimatePresence mode="wait">
        {stage === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center gap-8 z-10 w-full max-w-sm"
          >
            <div className="text-center">
              <h1 className="neon-text text-3xl font-black tracking-widest mb-2 uppercase">Security Access</h1>
              <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                Enter Credentials
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-4 h-4 text-[var(--active-neon)]" />
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">User ID</label>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-[var(--active-neon)]/30 rounded-lg px-4 py-3 text-[var(--active-neon)] font-mono text-sm focus:border-[var(--active-neon)] focus:outline-none transition-all"
                  placeholder="Enter User ID"
                  disabled={isSubmitting}
                  autoComplete="off"
                />
              </div>

              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <Key className="w-4 h-4 text-[var(--active-neon)]" />
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Access Code</label>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-[var(--active-neon)]/30 rounded-lg px-4 py-3 text-[var(--active-neon)] font-mono text-sm focus:border-[var(--active-neon)] focus:outline-none transition-all"
                  placeholder="Enter Access Code"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 font-mono text-xs text-center uppercase tracking-widest"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="glass-button w-full py-4 rounded-lg font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[var(--active-neon)] border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  "Access System"
                )}
              </button>
            </form>
          </motion.div>
        )}

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
              <div className="relative w-32 h-32 rounded-full border-2 border-[var(--active-neon)]/30 flex items-center justify-center overflow-hidden">
                <AnimatePresence>
                  {isHolding && (
                    <motion.div 
                      initial={{ y: "100%" }}
                      animate={{ y: "0%" }}
                      exit={{ y: "100%" }}
                      transition={{ duration: 1.5, ease: "linear" }}
                      className="absolute inset-0 bg-[var(--active-neon)]/20"
                    />
                  )}
                </AnimatePresence>
                <Fingerprint className={`w-16 h-16 transition-colors duration-500 ${isHolding ? "text-[var(--active-neon)]" : "text-[var(--active-neon)]/40"}`} />
                <div className={`absolute inset-0 border-4 border-[var(--active-neon)] rounded-full transition-opacity duration-300 ${isHolding ? "opacity-100" : "opacity-0"}`} 
                     style={{ clipPath: "inset(0 0 0 0)" }} />
              </div>
            </div>
            
            <div className="text-center">
              <h1 className="neon-text text-3xl font-black tracking-widest mb-2 uppercase">Security Gateway</h1>
              <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                {isHolding ? "Scanning Fingerprint..." : "Press and hold to scan"}
              </p>
            </div>

            <button 
              onMouseDown={startHold}
              onMouseUp={endHold}
              onMouseLeave={endHold}
              onTouchStart={startHold}
              onTouchEnd={endHold}
              className="glass-button w-20 h-20 rounded-full flex items-center justify-center group relative overflow-hidden active:scale-95 transition-transform"
            >
              <div className="absolute inset-0 bg-[var(--active-neon)] opacity-0 group-hover:opacity-10 transition-opacity" />
              <ShieldCheck className="w-8 h-8 relative z-10" />
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
