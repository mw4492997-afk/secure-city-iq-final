"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const NodeTopology = () => {
  const [nodes, setNodes] = useState([]);

  const fetchScannedNodes = async () => {
    try {
      const response = await fetch('/api/update-nodes');
      if (!response.ok) return;
      const data = await response.json();
      
      // Safe Check: Ensure we have an array of ips from the phone
      if (data && data.ips && Array.isArray(data.ips)) {
        setNodes(data.ips);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchScannedNodes();
    const interval = setInterval(fetchScannedNodes, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[500px] bg-black/20 rounded-xl flex flex-col items-center justify-center border border-white/10">
      <div className="absolute top-4 text-cyan-400 font-mono text-sm bg-black/40 p-2 rounded-lg border border-cyan-500/20">
        📡 LIVE RADAR: {nodes.length} DEVICES DETECTED
      </div>

      <div className="relative w-80 h-80 border border-cyan-500/20 rounded-full flex items-center justify-center">
        <div className="w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_20px_cyan]" />
        
        {nodes && nodes.length > 0 && nodes.map((node, index) => {
          const angle = (index * (360 / nodes.length)) * (Math.PI / 180);
          const x = Math.cos(angle) * 130;
          const y = Math.sin(angle) * 130;

          return (
            <motion.div
              key={node.ip || index}
              initial={{ scale: 0 }}
              animate={{ scale: 1, x, y }}
              className="absolute flex flex-col items-center"
            >
              <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_#4ade80]" />
              <div className="text-[10px] text-white font-mono bg-black/60 px-1 rounded mt-1">
                {node.ip}
              </div>
            </motion.div>
          );
        })}

        <motion.div 
          animate={{ scale: [1, 2], opacity: [0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute w-full h-full border border-cyan-500/40 rounded-full"
        />
      </div>
    </div>
  );
};

export default NodeTopology;
