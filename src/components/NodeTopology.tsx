"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getClientIP, realNetworkScan, getGeolocation, pingIP } from '@/lib/networkUtils';

interface Node {
  ip: string;
  city?: string;
  status: string;
  responseTime?: number;
}

const NodeTopology = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [clientIP, setClientIP] = useState<string>('127.0.0.1');
  const [geo, setGeo] = useState({ city: 'Localhost', country: 'Local', lat: 0, lon: 0, ip: '' });
  const [scanStatus, setScanStatus] = useState('Initializing...');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const fetchScannedNodes = async () => {
    try {
      setScanStatus('Fetching client IP...');
      
      // Get client IP and geolocation
      const [ip, geoData] = await Promise.all([
        getClientIP(),
        getGeolocation()
      ]);

      setClientIP(ip);
      setGeo(geoData);
      
      setScanStatus('Scanning network...');

      // Perform real network scan
      const scanResults = await realNetworkScan(ip);
      
      // Combine client node with scan results
      const dynamicNodes: Node[] = [
        { 
          ip: ip, 
          city: geoData.city, 
          status: 'active',
          responseTime: 0
        },
        ...scanResults.map(result => ({
          ip: result.ip,
          city: result.city || geoData.city,
          status: result.status,
          responseTime: result.responseTime
        }))
      ];

      setNodes(dynamicNodes);
      setScanStatus(`Scan complete: ${dynamicNodes.length} nodes detected`);
      
      console.log("🔥 REAL NETWORK SCAN COMPLETE:", dynamicNodes.length, "nodes detected");
    } catch (error) {
      console.error("Network scan error:", error);
      setScanStatus('Scan failed - showing local node only');
      
      // Fallback: show at least the client IP
      setNodes([{ 
        ip: clientIP || '127.0.0.1', 
        city: geo.city, 
        status: 'active',
        responseTime: 0
      }]);
    }
  };

  useEffect(() => {
    // Initial scan on mount
    fetchScannedNodes();
    
    // Refresh scan every 30 seconds (reduced frequency to avoid API rate limits)
    const interval = setInterval(fetchScannedNodes, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 rounded-xl flex flex-col items-center justify-center border border-cyan-500/30 overflow-hidden shadow-2xl">
      {/* Cyber Security Globe Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-cyan-400/20 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-cyan-300/15 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-cyan-200/10 rounded-full animate-spin" style={{ animationDuration: '25s' }} />
        
        {/* Longitude lines */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-80 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-pulse"
            style={{
              transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
        
        {/* Latitude lines */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 border border-cyan-400/10 rounded-full animate-pulse"
            style={{
              width: `${320 - i * 40}px`,
              height: `${320 - i * 40}px`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
      </div>

      <div className="absolute top-4 left-4 text-cyan-400 font-mono text-sm bg-black/70 p-4 rounded-lg border border-cyan-500/40 max-w-xs backdrop-blur-md shadow-lg">
        <div className="text-lg font-bold mb-2">🌐 CYBER SECURITY NETWORK</div>
        <div className="text-xs text-cyan-300 mt-1 space-y-1">
          <div>🔍 Real-time IP scanning</div>
          <div>🛡️ Global threat monitoring</div>
          <div>⚡ Live network topology</div>
          <div className="mt-2 pt-2 border-t border-cyan-500/30">
            <div>Client: {clientIP}</div>
            <div>Nodes: {nodes.length}</div>
            <div className="text-green-400 font-semibold">Status: ACTIVE</div>
          </div>
        </div>
      </div>

      <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '1400px' }}>
        <motion.div 
          className="relative w-96 h-96" 
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Central Globe Core */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ transform: 'translate(-50%, -50%) translateZ(0px)' }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-[0_0_50px_cyan] animate-pulse border-2 border-cyan-300" />
            <div className="text-lg text-white font-bold bg-gradient-to-r from-cyan-500/90 to-blue-500/90 px-4 py-3 rounded-xl mt-4 whitespace-nowrap border-2 border-cyan-400/60 shadow-xl backdrop-blur-sm">
              🌍 {clientIP}
            </div>
            <div className="text-sm text-cyan-300 font-semibold bg-black/50 px-3 py-1 rounded-lg mt-1">{geo.city}</div>
            <div className="text-xs text-green-400 font-bold bg-green-500/20 px-2 py-1 rounded mt-1 border border-green-500/40">SECURE NODE</div>
          </motion.div>
          
          {nodes && nodes.length > 1 && nodes.slice(1).map((node, index) => {
            const angle = (index * (360 / Math.max(nodes.length - 1, 1))) * (Math.PI / 180);
            const radius = 170;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const z = Math.sin(angle * 3) * 70;

            return (
              <motion.div
                key={node.ip || index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  x, 
                  y,
                  z,
                  rotateX: Math.sin(angle) * 25,
                  rotateY: Math.cos(angle) * 25
                }}
                transition={{ type: "spring", stiffness: 120, delay: index * 0.15 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
                whileHover={{ 
                  scale: 2.2, 
                  z: 60,
                  rotateX: 0,
                  rotateY: 0
                }}
                onClick={() => setSelectedNode(node)}
                title={`${node.ip} - ${node.status} - ${node.responseTime ? node.responseTime + 'ms' : 'N/A'}`}
              >
                <div 
                  className={`w-6 h-6 rounded-full shadow-[0_0_30px_rgba(74,222,128,1)] border-2 ${
                    node.status === 'active' 
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-300 animate-pulse' 
                      : 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300'
                  }`} 
                  style={{ filter: 'drop-shadow(0 0 15px rgba(74,222,128,1))' }}
                />
                
                {/* Connection line to center */}
                <div 
                  className="absolute top-3 left-3 w-px bg-gradient-to-b from-cyan-400/60 to-transparent"
                  style={{
                    height: `${radius - 20}px`,
                    transform: `rotate(${angle * 180 / Math.PI + 90}deg) translateY(-${radius - 20}px)`,
                    transformOrigin: 'top center'
                  }}
                />
                
                <div className="text-base text-white font-bold bg-gradient-to-r from-slate-800/95 to-slate-700/95 px-4 py-3 rounded-xl mt-3 whitespace-nowrap max-w-[180px] truncate group-hover:max-w-[280px] group-hover:z-40 transition-all border-2 border-green-400/70 shadow-2xl backdrop-blur-md">
                  <div className="text-cyan-200 font-mono text-lg drop-shadow-lg">{node.ip}</div>
                  {node.city && (
                    <div className="text-sm text-green-300 font-semibold">{node.city}</div>
                  )}
                  {node.responseTime !== undefined && (
                    <div className="text-sm text-yellow-300 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                      {node.responseTime}ms
                    </div>
                  )}
                  <div className="text-xs text-blue-300 font-bold mt-1">
                    {node.status === 'active' ? '🛡️ SECURE' : '⚠️ MONITORING'}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Enhanced 3D Grid */}
          <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  rotateY: 360,
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ 
                  duration: 25, 
                  repeat: Infinity, 
                  ease: "linear", 
                  delay: i * 1.5,
                  opacity: { duration: 3, repeat: Infinity }
                }}
                className="absolute top-1/2 left-1/2 w-96 h-96 border border-cyan-400/15 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                style={{ 
                  transform: `translate(-50%, -50%) rotateY(${i * 22.5}deg)`,
                  transformOrigin: 'center center'
                }}
              />
            ))}
          </div>

          {/* Data flow particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              animate={{
                x: [0, Math.cos(i * 45 * Math.PI / 180) * 180],
                y: [0, Math.sin(i * 45 * Math.PI / 180) * 180],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
              className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan]"
              style={{ transform: 'translate(-50%, -50%)' }}
            />
          ))}

          {/* Pulsing security rings */}
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1], 
              opacity: [0.6, 0.2, 0.6],
              borderColor: ['rgba(34,211,238,0.4)', 'rgba(34,211,238,0.1)', 'rgba(34,211,238,0.4)']
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 w-96 h-96 border-4 border-cyan-400/30 rounded-full"
            style={{ transform: 'translate(-50%, -50%)' }}
          />
          <motion.div 
            animate={{ 
              scale: [1.1, 1.4, 1.1], 
              opacity: [0.3, 0.1, 0.3],
              borderColor: ['rgba(34,211,238,0.2)', 'rgba(34,211,238,0.05)', 'rgba(34,211,238,0.2)']
            }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute top-1/2 left-1/2 w-96 h-96 border-2 border-cyan-300/20 rounded-full"
            style={{ transform: 'translate(-50%, -50%)' }}
          />
        </motion.div>
      </div>

      {/* IP Information Modal */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 backdrop-blur-md border border-cyan-400/50 rounded-xl p-6 shadow-2xl z-50 max-w-sm"
          onClick={() => setSelectedNode(null)}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-4">🔍 IP INFORMATION</div>
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-cyan-300 font-semibold">IP Address:</span>
                <span className="text-white font-mono">{selectedNode.ip}</span>
              </div>
              {selectedNode.city && (
                <div className="flex justify-between">
                  <span className="text-cyan-300 font-semibold">Location:</span>
                  <span className="text-white">{selectedNode.city}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-cyan-300 font-semibold">Status:</span>
                <span className={`font-bold ${selectedNode.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {selectedNode.status === 'active' ? '🛡️ ACTIVE' : '⚠️ MONITORING'}
                </span>
              </div>
              {selectedNode.responseTime !== undefined && (
                <div className="flex justify-between">
                  <span className="text-cyan-300 font-semibold">Response Time:</span>
                  <span className="text-yellow-400 font-mono">{selectedNode.responseTime}ms</span>
                </div>
              )}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg border border-cyan-400/50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNode(null);
              }}
            >
              Close
            </button>
          </div>
        </motion.div>
      )}

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/80 to-blue-900/60 backdrop-blur-lg rounded-xl border border-cyan-500/30">
          <div className="text-center">
            <div className="text-2xl font-mono text-cyan-400 mb-6 animate-pulse">🌐 INITIALIZING CYBER NETWORK</div>
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-lg text-cyan-300 mb-2">Scanning Global Infrastructure</div>
            <div className="text-sm text-cyan-400/80">Building secure topology map...</div>
            <div className="mt-4 flex justify-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className="w-3 h-3 bg-cyan-400 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeTopology;
