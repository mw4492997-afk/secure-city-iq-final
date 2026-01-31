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
  const [currentCommand, setCurrentCommand] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute("data-emergency", emergency.toString());
  }, [emergency]);

  useEffect(() => {
    const authStatus = localStorage.getItem("authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    // Simulate scrolling logs
    const interval = setInterval(() => {
      const newLog = `[${new Date().toLocaleTimeString()}] System activity: Threat neutralized`;
      setConsoleLogs(prev => [...prev.slice(-9), newLog]); // Keep last 10 logs
    }, 2000);
    return () => clearInterval(interval);
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

  const handleCommand = async (command: string) => {
    let response = '';
    switch (command) {
      case "net_stat":
        try {
          const netStatResponse = await fetch('/api/net-stat');
          const netData = await netStatResponse.json();
          if (netStatResponse.ok) {
            response = `IP: ${netData.ip} | LOCATION: ${netData.city}, ${netData.country} | TIMEZONE: ${netData.timezone} | STATUS: ${netData.network_status}`;
          } else {
            response = "ERR: Failed to retrieve network statistics";
          }
        } catch (error) {
          response = "ERR: Network statistics unavailable";
        }
        break;
      default:
        response = "Unknown command";
    }
    const newLog = `> ${command}\n${response}`;
    setConsoleLogs(prev => [...prev, newLog]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(currentCommand);
      setCurrentCommand('');
    }
  };

  if (!isAuthenticated) {
    return <SecurityPortal onAccessGranted={handleAccessGranted} />;
  }

  return (
    <div className="relative min-h-screen bg-black font-sans text-green-400 overflow-hidden">
      <div className="crt-overlay" />
      <div className="scanline" />
      <Toaster position="top-right" theme="dark" />

      {/* Operational Status */}
      <div className="fixed top-0 left-0 right-0 bg-black border-b border-green-400/50 p-4 text-center text-green-400 z-10 shadow-lg shadow-green-400/20">
        <span className="animate-pulse">OPERATIONAL STATUS: STABLE</span>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-3 gap-6 pt-24 px-6 min-h-screen pb-20">
        {/* Left Column: Threat Vector Analysis and Attack Origin */}
        <div className="border border-green-400/50 rounded-lg p-4 shadow-lg shadow-green-400/20">
          <SecurityCharts />
        </div>

        {/* Middle Column: Main Terminal logs */}
        <div className="border border-green-400/50 rounded-lg p-4 shadow-lg shadow-green-400/20">
          <TerminalLogs logs={consoleLogs} />
        </div>

        {/* Right Column: Radar Component */}
        <div className="border border-green-400/50 rounded-lg p-4 shadow-lg shadow-green-400/20 flex justify-center items-start">
          <RadarHUD />
        </div>
      </div>

      {/* Bottom Command Center */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-green-400/50 p-4 z-20 shadow-lg shadow-green-400/20">
        <div className="flex items-center">
          <span className="text-green-400 mr-2 font-mono">SecureCityIQ@Root:~$</span>
          <input
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono"
            placeholder="Enter command..."
          />
        </div>
      </div>

      {/* Decorative corner accents */}
      <div className="fixed top-0 left-0 w-48 h-48 border-t-2 border-l-2 border-green-400/20 m-6 rounded-tl-[3rem] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-48 h-48 border-b-2 border-r-2 border-green-400/20 m-6 rounded-br-[3rem] pointer-events-none" />
    </div>
  );
}
