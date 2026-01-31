"use client";

import { useState, useEffect } from "react";
import RadarHUD from "@/components/RadarHUD";
import TerminalLogs from "@/components/TerminalLogs";
import SecurityCharts from "@/components/SecurityCharts";
import SecurityPortal from "@/components/SecurityPortal";
import { Toaster, toast } from "sonner";
import { ShieldAlert } from "lucide-react";

export default function Home() {
  const [emergency, setEmergency] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-emergency", emergency.toString());
  }, [emergency]);

  useEffect(() => {
    const authStatus = localStorage.getItem("authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

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

  const handleAccessGranted = () => {
    setIsAuthenticated(true);
    localStorage.setItem("authenticated", "true");
  };

  if (!isAuthenticated) {
    return <SecurityPortal onAccessGranted={handleAccessGranted} />;
  }

  return (
    <div className="relative min-h-screen bg-[var(--cyber-bg)] font-sans text-zinc-100 overflow-hidden transition-colors duration-500">
      <div className="crt-overlay" />
      <div className="scanline" />
      <Toaster position="top-right" theme="dark" />

      {/* Operational Status */}
      <div className="fixed top-0 left-0 right-0 bg-[var(--cyber-bg)] border-b border-[var(--active-neon)]/20 p-2 text-center text-[var(--active-neon)] z-10">
        Operational Status: Stable
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-24 px-6 min-h-screen">
        <SecurityCharts />
        <div className="flex justify-center items-center">
          <RadarHUD />
        </div>
      </div>

      {/* Terminal Logs at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 w-full z-20">
        <TerminalLogs onEmergency={toggleEmergency} onLogsUpdate={setConsoleLogs} />
      </div>

      {/* Decorative corner accents */}
      <div className="fixed top-0 left-0 w-48 h-48 border-t-2 border-l-2 border-[var(--active-neon)]/20 m-6 rounded-tl-[3rem] pointer-events-none transition-colors duration-500" />
      <div className="fixed bottom-0 right-0 w-48 h-48 border-b-2 border-r-2 border-[var(--active-neon)]/20 m-6 rounded-br-[3rem] pointer-events-none transition-colors duration-500" />
    </div>
  );
}
