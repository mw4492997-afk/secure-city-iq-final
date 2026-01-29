"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CyberPulse from "../../components/CyberPulse";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleAccess = () => {
    if (password === "admin123") {
      router.push("/");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-[var(--cyber-bg)] font-sans text-zinc-100 overflow-hidden transition-colors duration-500">
      <CyberPulse />

      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-md px-6 py-12">
        <div className="glass-card p-8 w-full rounded-2xl">
          <h1 className="neon-text text-3xl font-bold tracking-tighter text-center mb-8">
            ACCESS SYSTEM
          </h1>
          <p className="text-sm text-[var(--active-neon)]/60 font-mono tracking-widest uppercase text-center mb-6">
            // Authentication Required
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-mono text-[var(--active-neon)]/80 mb-2">
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-teal-950/20 border border-teal-500/30 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-400/50 focus:shadow-[0_0_10px_rgba(20,184,166,0.3)] transition-all duration-300"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-mono text-[var(--active-neon)]/80 mb-2">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-teal-950/20 border border-teal-500/30 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-400/50 focus:shadow-[0_0_10px_rgba(20,184,166,0.3)] transition-all duration-300"
                placeholder="Enter password"
              />
            </div>

            <button
              onClick={handleAccess}
              className="w-full glass-button py-4 text-sm font-bold uppercase tracking-widest mt-8"
            >
              Access System
            </button>
          </div>
        </div>
      </main>

      {/* Decorative corner accents */}
      <div className="fixed top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-[var(--active-neon)]/30 m-8 rounded-tl-3xl pointer-events-none transition-colors duration-500" />
      <div className="fixed bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-[var(--active-neon)]/30 m-8 rounded-br-3xl pointer-events-none transition-colors duration-500" />
    </div>
  );
}
