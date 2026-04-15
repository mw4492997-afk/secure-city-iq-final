// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Device {
  ip: string;
  mac: string;
  vendor: string;
  lastSeen: string;
}

interface DevicesResponse {
  scanTime: string;
  subnet: string;
  totalDevices: number;
  devices: Device[];
}

// FIXED Wasit Gateway coords
const WASIT_GATEWAY = { lat: 32.48, lng: 45.69, name: 'Wasit Central Gateway' };

const NodeTopology = () => {
  const [data, setData] = useState<DevicesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchData = useCallback(async () => {
    // @ts-ignore
    setLoading(true);
    try {
      const res = await fetch('/devices.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: DevicesResponse = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setData(null);
    } finally {
      // @ts-ignore
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(); // Initial load

    // @ts-ignore
    intervalRef.current = setInterval(fetchData, 5000); // Every 5s

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  // Convert IP to geo coords (fake but realistic for demo)
  const ipToCoords = (ip: string): [number, number] => {
    const parts = ip.split('.').map(Number);
    const lat = 32.48 + (parts[2] / 255 - 0.5) * 0.1;
    const lng = 45.69 + (parts[3] / 255 - 0.5) * 0.1;
    return [lat, lng];
  };

  if (loading && !data) {
    return <div className="w-full h-[600px] flex items-center justify-center text-[var(--active-neon)] animate-pulse font-mono text-xl">Initializing Network Scan...</div>;
  }

  return (
    <div className="w-full min-h-[600px] bg-black/80 backdrop-blur-xl rounded-3xl border border-[var(--active-neon)]/50 p-8 relative overflow-hidden">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-ping" />
          <h2 className="text-3xl font-black text-[var(--active-neon)] uppercase tracking-wider font-mono">
            Live Network Topology
          </h2>
        </div>
        {data && (
          <div className="text-sm text-zinc-400 font-mono">
            {data.totalDevices} nodes | {new Date(data.scanTime).toLocaleTimeString()}
          </div>
        )}
      </motion.div>

      {/* Map Container - Using SVG for compatibility */}
      <div className="w-full h-[500px] relative">
        <svg 
          viewBox="0 0 1000 600" 
          className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,136,0.1)_0%,black_70%)]"
        >
          {/* World map outline (simple) */}
          <path d="M100 200 Q200 100 500 150 Q800 120 900 250 Q950 400 850 500 Q600 580 400 520 Q200 550 100 450 Z" fill="none" stroke="#00ff88" strokeWidth="3" opacity="0.3" />

          {/* Gateway Marker - FIXED POSITION */}
          <g transform={`translate(${520 + (WASIT_GATEWAY.lng - 45.69)*200}, ${260 + (WASIT_GATEWAY.lat - 32.48)*-150})`}>
            <circle r="20" fill="url(#gatewayGlow)" stroke="#00ff88" strokeWidth="4" filter="url(#glow)" className="animate-pulse" />
            <circle r="35" fill="none" stroke="#00ff88" strokeWidth="2" opacity="0.4" className="animate-ping" />
            <text y="-30" textAnchor="middle" fill="#00ff88" fontSize="14" fontWeight="bold" fontFamily="monospace" className="drop-shadow-lg">
              {WASIT_GATEWAY.name}
            </text>
          </g>

          {/* Device Markers + Lines */}
          <AnimatePresence>
            {data?.devices.map((device, i) => {
              // @ts-ignore
              const [lat, lng] = ipToCoords(device.ip);
              const x = 520 + (lng - 45.69) * 200;
              const y = 260 + (lat - 32.48) * -150;

              return (
                <motion.g
                  key={`${device.ip}-${device.mac}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Connection Line to Gateway */}
                  <line
                    x1="520" y1="260"
                    x2={x} y2={y}
                    stroke="#00ff88" 
                    strokeWidth="2.5"
                    strokeDasharray="8 4"
                    className="animate-pulse opacity-70"
                    filter="url(#glow)"
                    // @ts-ignore
                  >
                    <animate attributeName="stroke-dashoffset" values="0;12;0" dur="2s" repeatCount="indefinite" />
                  </line>

                  {/* Device Marker */}
                  <circle 
                    cx={x} cy={y} 
                    r="14" 
                    fill="#00cc66" 
                    stroke="#00ff88" 
                    strokeWidth="3"
                    className="animate-bounce [animation-delay:0.1s]"
                    filter="url(#glow)"
                  />
                  
                  {/* Label */}
                  <text 
                    x={x + 25} y={y - 8} 
                    fontSize="11" 
                    fontFamily="monospace" 
                    fill="#00ff88" 
                    fontWeight="bold"
                    opacity="0.9"
                  >
                    {device.ip.slice(-8)}
                  </text>
                  
                  {/* Tooltip */}
                  <title>{`${device.ip}\\n${device.mac}\\n${device.vendor}\\n${device.lastSeen}`}</title>
                </motion.g>
              );
            })}
          </AnimatePresence>

          {/* Glow defs */}
          <defs>
            <radialGradient id="gatewayGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="1" />
              <stop offset="50%" stopColor="#00ff88" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
            </radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" floodColor="#00ff88" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/> 
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Overlay Status */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-red-400 font-mono text-lg bg-black/80 p-6 rounded-xl border border-red-500/50">
              ❌ Scanner offline: {error}
              <br />
              <small>Run: cd python-app && venv\Scripts\activate && python backend.py</small>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {data && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="mt-8 grid grid-cols-3 gap-6 text-center p-6 bg-black/50 rounded-2xl border border-zinc-800/50"
        >
          <div className="font-mono text-[var(--active-neon)]">
            <div className="text-2xl font-black">{data.totalDevices}</div>
            <div className="text-sm uppercase tracking-wider opacity-75">ACTIVE NODES</div>
          </div>
          <div>
            <div className="text-lg font-black text-zinc-300">{data.subnet}</div>
            <div className="text-xs uppercase opacity-60">SCAN RANGE</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-400 font-mono">{new Date(data.scanTime).toLocaleTimeString()}</div>
            <div className="text-xs uppercase opacity-60">LAST SCAN</div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NodeTopology;

