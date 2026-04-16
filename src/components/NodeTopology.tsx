// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


const CYBER_RED = '#ef4444';
const RED_GLOW = 'url(#redGlow)';

const NodeTopology = () => {
  const [subnet, setSubnet] = useState('192.168.1.0/24');
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localIP, setLocalIP] = useState('');
  const intervalRef = useRef(null);

const fetchNodes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/update-nodes');
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      setDevices(data.devices || []);
      console.log('📱 Nodes from phone:', data.devices?.length || 0);
    } catch (err) {
      console.error('Node fetch error:', err);
      setDevices([]); // Show empty if no phone data yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNodes();
    intervalRef.current = setInterval(fetchNodes, 2000); // Every 2s as requested
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNodes]);

  if (loading && devices.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-red-950/80 backdrop-blur-xl rounded-3xl border-4 border-red-500/50 p-8 animate-pulse font-mono text-2xl text-red-400">
        🔴 CYBER-SECURITY SCANNER ACTIVE - DETECTING SUBNET DEVICES...
      </div>
    );
  }

  const mapCenterX = 500;
  const mapCenterY = 300;

  return (
    <div className="w-full min-h-[600px] bg-gradient-to-br from-red-950/90 via-black/95 to-red-900/80 backdrop-blur-xl rounded-3xl border-4 border-red-500/50 p-8 relative overflow-hidden shadow-[0_0_100px_rgba(239,68,68,0.3)]">
      {/* Header */}
      <motion.div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-5 h-5 bg-red-500 rounded-full animate-ping shadow-[0_0_30px_rgba(239,68,68,0.8)]" />
          <h2 className="text-4xl font-black bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent uppercase tracking-wider font-mono">
            Real-Time Network Scanner
          </h2>
        </div>
        <div className="text-sm text-red-400 font-mono">
          {devices.length} PHONE nodes | Live 📱
        </div>
      </motion.div>

      {/* Cyber Red Map */}
      <div className="w-full h-[500px] relative">
        <svg viewBox="0 0 1000 600" className="w-full h-full bg-gradient-to-br from-red-900/50 via-black to-red-900/30 rounded-2xl shadow-[inset_0_0_100px_rgba(239,68,68,0.1)]">
          {/* Red Glow Defs */}
          <defs>
            <radialGradient id="redGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor={CYBER_RED} stopOpacity="1" />
              <stop offset="50%" stopColor={CYBER_RED} stopOpacity="0.6" />
              <stop offset="100%" stopColor={CYBER_RED} stopOpacity="0" />
            </radialGradient>
            <filter id="redGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" floodColor={CYBER_RED} result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/> 
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
          </defs>

          {/* Network Boundary */}
          <circle cx={mapCenterX} cy={mapCenterY} r="250" fill="none" stroke={CYBER_RED} strokeWidth="4" opacity="0.4" filter="url(#redGlowFilter)">
            <animate attributeName="r" values="200;280;200" dur="4s" repeatCount="indefinite"/>
          </circle>

          {/* Gateway Center */}
          <g transform={`translate(${mapCenterX}, ${mapCenterY})`}>
            <circle r="25" fill={RED_GLOW} stroke={CYBER_RED} strokeWidth="5" className="animate-pulse" filter="url(#redGlowFilter)" />
            <circle r="45" fill="none" stroke={CYBER_RED} strokeWidth="3" opacity="0.5" className="animate-ping" style={{animationDelay: '1s'}} />
            <text y="-40" textAnchor="middle" fill={CYBER_RED} fontSize="14" fontWeight="bold" fontFamily="monospace" className="drop-shadow-lg filter drop-shadow-[0_0_5px_rgba(239,68,68,1)]">
              YOUR GATEWAY
            </text>
          </g>

          {/* Pulsing Device Markers */}
          <AnimatePresence>
            {devices.map((device, i) => {
              const angle = (i / devices.length) * Math.PI * 2;
              const radius = 100 + Math.random() * 150;
              const x = mapCenterX + Math.cos(angle) * radius;
              const y = mapCenterY + Math.sin(angle) * radius;

              return (
                <motion.g
                  key={device.ip}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Connection Line */}
                  <line
                    x1={mapCenterX} y1={mapCenterY}
                    x2={x} y2={y}
                    stroke={CYBER_RED} strokeWidth="3" strokeDasharray="10 5"
                    className="animate-pulse opacity-60"
                    filter="url(#redGlowFilter)"
                  >
                    <animate attributeName="stroke-dashoffset" values="0;15;0" dur="2s" repeatCount="indefinite" />
                  </line>

                  {/* Pulsing Marker */}
                  <circle 
                    cx={x} cy={y} r="16" 
                    fill={RED_GLOW} stroke={CYBER_RED} strokeWidth="4"
                    className="animate-bounce"
                    filter="url(#redGlowFilter)"
                  />

                  {/* IP Label */}
                  <text 
                    x={x + 30} y={y - 5} 
                    fontSize="12" fontFamily="monospace" fill={CYBER_RED} fontWeight="bold"
                    className="drop-shadow-lg filter drop-shadow-[0_0_3px_rgba(239,68,68,1)]"
                  >
                    {device.ip.slice(-8)}
                  </text>
                  
                  <title>{`${device.ip} | Latency: ${device.latency}ms | ${device.vendor}`}</title>
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>

        {/* Status Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-red-950/30">
          <div className="text-red-400 font-mono text-xl bg-black/80 p-8 rounded-2xl border-2 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.5)]">
            🔴 PHONE-REPORTED: {devices.length} NODES | Live API sync 📱<br/>
            <small>Real-time phone → server → map (2s poll)</small>
          </div>
        </div>
      </div>

      {/* Red Stats Footer */}
      <motion.div className="mt-8 grid grid-cols-3 gap-6 text-center p-8 bg-red-950/50 rounded-2xl border-2 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
        <div className="font-mono">
          <div className="text-3xl font-black text-red-400 drop-shadow-lg">{devices.length}</div>
          <div className="text-sm uppercase tracking-wider text-red-300 opacity-90">DETECTED NODES</div>
        </div>
        <div>
          <div className="text-xl font-black text-red-300">API SYNC</div>
          <div className="text-xs uppercase text-red-400">PHONE DATA</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-red-400 font-mono">{localIP || 'Detecting...'}</div>
          <div className="text-xs uppercase text-red-300">LOCAL HOST</div>
        </div>
      </motion.div>
    </div>
  );
};

export default NodeTopology;

