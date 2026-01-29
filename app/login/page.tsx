"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CyberPulse from "../../components/CyberPulse";
import { User, Lock, Fingerprint } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleAccess = () => {
    if (password === "admin123") {
      localStorage.setItem('session', 'active');
      router.push("/");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-black font-sans text-zinc-100 overflow-hidden transition-colors duration-500">
      <CyberPulse />

      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-md px-6 py-12">
        <div className="bg-black/20 backdrop-blur-xl border-2 border-green-500/50 rounded-2xl p-8 w-full shadow-[0_0_20px_rgba(34,197,94,0.3)]">
          <h1 className="text-4xl font-bold tracking-tighter text-center mb-8 text-green-400" style={{ textShadow: '0 0 10px rgba(34,197,94,0.8)' }}>
            AUTHENTICATION REQUIRED
          </h1>

          <div className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-mono text-green-400/80 mb-2">
                USERNAME
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black border-2 border-green-500/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-300"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-mono text-green-400/80 mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black border-2 border-green-500/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-300"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <button
              onClick={handleAccess}
              className="w-full bg-green-500/10 backdrop-blur-md border-2 border-green-400/50 rounded-xl py-4 text-sm font-bold uppercase tracking-widest mt-8 text-green-400 transition-all duration-300 hover:bg-green-500/20 hover:border-green-400 hover:scale-105 hover:shadow-[0_0_15px_rgba(34,197,94,0.6)] active:scale-95"
              style={{ textShadow: '0 0 8px rgba(34,197,94,0.8)' }}
            >
              ACCESS SYSTEM
            </button>

            <div className="flex justify-center mt-6">
              <Fingerprint className="w-8 h-8 text-green-400 animate-pulse" style={{ filter: 'drop-shadow(0 0 10px rgba(34,197,94,0.8))' }} />
            </div>
          </div>
        </div>
      </main>

      {/* Decorative corner accents */}
      <div className="fixed top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-green-500/30 m-8 rounded-tl-3xl pointer-events-none transition-colors duration-500" />
      <div className="fixed bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-green-500/30 m-8 rounded-br-3xl pointer-events-none transition-colors duration-500" />
    </div>
  );
}
