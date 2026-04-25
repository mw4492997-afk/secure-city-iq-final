"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  getClientIP,
  getGeolocation,
  pingIP,
  realNetworkScan,
  fetchNetworkDevices,
  getNetworkMetrics,
  NetworkDevice,
} from '@/lib/networkUtils';
import type { Locale } from '@/lib/translations';

interface Node {
  ip: string;
  city?: string;
  status: string;
  responseTime?: number;
}

interface NodeTopologyProps {
  t: Record<string, string>;
  language: Locale;
}

const NodeTopology = ({ t, language }: NodeTopologyProps) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [clientIP, setClientIP] = useState<string>('127.0.0.1');
  const [localIP, setLocalIP] = useState<string>('127.0.0.1');
  const [localSubnet, setLocalSubnet] = useState<string>('unknown');
  const [geo, setGeo] = useState({ city: 'Localhost', country: 'Local', lat: 0, lon: 0, ip: '' });
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [scanStatus, setScanStatus] = useState(t.extractingClientMetadata);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [networkMetrics, setNetworkMetrics] = useState({ downlink: 0, rtt: 0 });
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sortedDevices = useMemo(() => {
    return [...devices].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'active' ? -1 : 1;
      }
      return a.ip.localeCompare(b.ip, undefined, { numeric: true });
    });
  }, [devices]);

  const sortedNodes = useMemo(() => {
    return [...nodes].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'active' ? -1 : 1;
      }
      if (a.responseTime !== undefined && b.responseTime !== undefined) {
        return a.responseTime - b.responseTime;
      }
      return a.ip.localeCompare(b.ip, undefined, { numeric: true });
    });
  }, [nodes]);

  const orbitNodes = useMemo(() => sortedNodes.slice(1), [sortedNodes]);
  const extraCount = Math.max(0, sortedNodes.length - 1 - orbitNodes.length);
  const orbitRings = useMemo(() => {
    const ringCapacities = [8, 12, 16, 20, 24];
    const rings: number[] = [];
    let remaining = orbitNodes.length;
    let ringIndex = 0;
    while (remaining > 0) {
      const capacity = ringCapacities[ringIndex] ?? (24 + (ringIndex - ringCapacities.length + 1) * 4);
      rings.push(Math.min(remaining, capacity));
      remaining -= capacity;
      ringIndex += 1;
    }
    return rings;
  }, [orbitNodes.length]);

  const loadLocalNetwork = async () => {
    try {
      const result = await fetchNetworkDevices();
      if (result.success) {
        setLocalIP(result.localIP || localIP);
        setLocalSubnet(result.localSubnet || 'unknown');
        setDevices(result.devices || []);
        return { localIP: result.localIP || localIP, localSubnet: result.localSubnet || localSubnet };
      }
    } catch (error) {
      console.error('Local network extraction failed:', error);
    }
    return { localIP, localSubnet };
  };

  const fetchScannedNodes = async () => {
    setIsRefreshing(true);
    try {
      setScanStatus(t.extractingClientMetadata);
      const ip = await getClientIP();
      setClientIP(ip);

      setScanStatus(t.resolvingGeoLocation);
      const geoData = await getGeolocation(ip);
      setGeo(geoData);

      setScanStatus(t.gatheringLocalInventory);
      const localNetwork = await loadLocalNetwork();
      const scanTarget = localNetwork.localIP || ip;

      setScanStatus(t.probingCurrentNode);
      const pingResult = await pingIP(scanTarget);

      setScanStatus(t.scanningSubnet);
      const scanResults = await realNetworkScan(scanTarget);

      const rootNode: Node = {
        ip: scanTarget,
        city: geoData.city,
        status: pingResult.reachable ? 'active' : 'inactive',
        responseTime: pingResult.responseTime >= 0 ? pingResult.responseTime : undefined,
      };

      const discoveredNodes: Node[] = scanResults.map((result) => ({
        ip: result.ip,
        city: result.city || geoData.city,
        status: result.status,
        responseTime: result.responseTime,
      }));

      setNodes([rootNode, ...discoveredNodes]);
      setScanStatus(`${t.extractionComplete} ${discoveredNodes.length + 1} ${t.nodesDetected}`);
      setNetworkMetrics(getNetworkMetrics());
      setLastUpdated(new Date().toLocaleTimeString());
      console.log('🔥 Network extraction complete:', discoveredNodes.length + 1, 'nodes detected');
    } catch (error) {
      console.error('Network scan error:', error);
      setScanStatus(t.extractionFailed);
      setNodes([
        {
          ip: localIP || clientIP || '127.0.0.1',
          city: geo.city,
          status: 'active',
          responseTime: 0,
        },
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScannedNodes();
    const interval = setInterval(fetchScannedNodes, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="w-full h-full grid gap-4 lg:grid-cols-[minmax(320px,380px)_1fr] rounded-3xl overflow-hidden">
      <div className="glass-card border border-cyan-500/20 bg-slate-950/80 p-5 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">{t.topologyPanelTitle}</div>
            <div className="mt-3 text-2xl font-black text-white">{t.topologyPanelSubtitle}</div>
          </div>
          <button
            onClick={fetchScannedNodes}
            disabled={isRefreshing}
            className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
          >
            {isRefreshing ? t.updating : t.refreshNow}
          </button>
        </div>

        <div className="grid gap-3 mb-4">
          <div className="rounded-3xl border border-cyan-500/20 bg-black/30 p-4">
            <div className="text-xs uppercase text-cyan-300/70">{t.localNetworkOverview}</div>
            <div className="mt-3 space-y-2 text-sm text-slate-200">
              <div className="flex justify-between items-center">
                <span>{t.clientIP}</span>
                <span className="font-mono text-cyan-200">{localIP}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>{t.localSubnet}</span>
                <span className="font-mono text-cyan-200">{localSubnet}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>{t.location}</span>
                <span className="text-cyan-300">{geo.city}, {geo.country}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>{t.connectionStatus}</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-300">{t.nodeActive}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-cyan-500/20 bg-black/30 p-4">
              <div className="text-xs uppercase text-cyan-300/70">{t.connectedNodes}</div>
              <div className="mt-3 text-3xl font-black text-white">{nodes.length}</div>
            </div>
            <div className="rounded-3xl border border-cyan-500/20 bg-black/30 p-4">
              <div className="text-xs uppercase text-cyan-300/70">{t.networkDevices}</div>
              <div className="mt-3 text-3xl font-black text-white">{devices.length}</div>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-500/20 bg-black/30 p-4">
            <div className="text-xs uppercase text-cyan-300/70">{t.connectionPerformance}</div>
            <div className="mt-3 text-sm text-slate-200 space-y-2">
              <div className="flex justify-between"><span>{t.downlink}</span><span>{networkMetrics.downlink.toFixed(1)} Mbps</span></div>
              <div className="flex justify-between"><span>{t.rtt}</span><span>{networkMetrics.rtt} ms</span></div>
              <div className="flex justify-between"><span>{t.lastUpdated}</span><span>{lastUpdated || '...'}</span></div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-cyan-500/20 bg-black/30 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase text-cyan-300/70">{t.extractionDetails}</div>
              <div className="mt-2 text-sm text-slate-200">{scanStatus}</div>
            </div>
          </div>
          <div className="grid gap-3">
            {sortedNodes.slice(0, 4).map((node) => (
              <div key={node.ip} className="rounded-3xl border border-cyan-500/10 bg-slate-950/70 p-3">
                <div className="flex items-center justify-between text-sm text-zinc-400">
                  <span>{node.ip}</span>
                  <span className={`text-xs uppercase ${node.status === 'active' ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {node.status === 'active' ? t.nodeActive : t.nodeMonitoring}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-cyan-200">
                  {node.city && <span className="rounded-full bg-cyan-500/10 px-2 py-1">{node.city}</span>}
                  {node.responseTime !== undefined && <span className="rounded-full bg-slate-800/80 px-2 py-1">{node.responseTime}ms</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-cyan-500/15 bg-black/30 p-4 overflow-hidden">
          <div className="text-xs uppercase text-cyan-300/70 mb-3">{t.sortedNetworkDevicesTitle}</div>
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-2">
            {sortedDevices.length > 0 ? (
              sortedDevices.map((device) => (
                <div key={`${device.ip}-${device.mac}`} className="rounded-3xl bg-slate-950/70 border border-cyan-500/10 p-3">
                  <div className="flex items-center justify-between gap-2 text-sm text-white">
                    <span className="font-mono truncate">{device.ip}</span>
                    <span className={`text-[11px] uppercase ${device.status === 'active' ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {device.status === 'active' ? t.nodeActive : t.nodeMonitoring}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-zinc-400 flex flex-wrap gap-2">
                    <span>{device.name || t.unknown || 'unknown'}</span>
                    <span>{device.mac}</span>
                    <span>{device.source || 'arp'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-500">{t.noDevicesDetected}</div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card border border-cyan-500/20 bg-slate-950/70 p-4 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">{t.topologyWindowTitle}</div>
            <div className="text-lg font-black text-white">{t.topologyWindowDescription}</div>
          </div>
          <div className="rounded-3xl border border-cyan-500/20 bg-black/20 px-3 py-2 text-xs text-cyan-200">
            {t.nodeCountLabel}: {nodes.length}
          </div>
        </div>

        <div className="grid gap-4 h-full">
          <div className="relative rounded-3xl border border-cyan-500/10 bg-slate-900/80 p-4 min-h-[320px] overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_40%),linear-gradient(180deg,_rgba(15,23,42,0.8),_rgba(15,23,42,0.95))]" />
            <div className="relative flex h-full items-center justify-center">
              <motion.div className="relative w-full h-full" style={{ minHeight: 320, perspective: '1400px' }}>
                <motion.div
                  className="absolute inset-0"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: [0, 360] }}
                  transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
                >
                  {[...Array(10)].map((_, index) => (
                    <div
                      key={index}
                      className="absolute top-1/2 left-1/2 border border-cyan-500/10 rounded-full"
                      style={{
                        width: `${220 + index * 18}px`,
                        height: `${220 + index * 18}px`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  ))}
                </motion.div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transformStyle: 'preserve-3d' }}>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_60px_rgba(34,211,238,0.55)] border border-cyan-300/40" />
                  <div className="absolute inset-x-0 top-full mt-3 text-center">
                    <div className="text-xs text-slate-100">{geo.city || 'Localhost'}</div>
                    <div className="text-[10px] text-cyan-300 uppercase">{t.secureNodeLabel}</div>
                  </div>
                </div>

                {orbitNodes.map((node, index) => {
                  let cumulative = 0;
                  let ringIndex = 0;
                  while (ringIndex < orbitRings.length && cumulative + orbitRings[ringIndex] <= index) {
                    cumulative += orbitRings[ringIndex];
                    ringIndex += 1;
                  }
                  const ringSize = orbitRings[ringIndex] || 8;
                  const indexInRing = index - cumulative;
                  const angle = (indexInRing / ringSize) * Math.PI * 2;
                  const baseRadius = 120;
                  const ringRadius = baseRadius + ringIndex * 80;
                  const x = Math.cos(angle) * ringRadius;
                  const y = Math.sin(angle) * ringRadius;
                  const z = ringIndex * 12 + Math.sin(angle * 2) * 8;
                  const angleDeg = (angle * 180) / Math.PI;

                  return (
                    <motion.div
                      key={node.ip}
                      className="absolute left-1/2 top-1/2 flex flex-col items-center gap-2 cursor-pointer"
                      style={{
                        transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                        transformStyle: 'preserve-3d',
                      }}
                      initial={{ opacity: 0, scale: 0.75 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.04 }}
                      whileHover={{ scale: 1.15 }}
                      onClick={() => setSelectedNode(node)}
                    >
                      <div className="relative flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full border-2 ${node.status === 'active' ? 'border-emerald-300 bg-emerald-400/20' : 'border-amber-300 bg-amber-400/20'}`} />
                        <div className="w-[100px] rounded-full border border-cyan-500/10 bg-slate-950/90 px-2 py-1 text-[10px] font-mono text-cyan-100 text-center shadow-[0_0_20px_rgba(14,116,144,0.25)]">
                          {node.ip}
                        </div>
                      </div>
                      <div className="absolute left-1/2 top-1/2 h-[80px] w-[1px] bg-gradient-to-b from-cyan-400/70 to-transparent" style={{ transform: `translate(-50%, -50%) rotate(${angleDeg}deg)` }} />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
            <div className="absolute left-4 bottom-4 right-4 text-[11px] text-cyan-300/80">
              {t.topologyWindowHint}
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-500/10 bg-black/30 p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs uppercase text-cyan-300/70">{t.networkNodeListTitle}</div>
                <div className="text-sm text-slate-300">{t.networkNodeListSubtitle}</div>
              </div>
              {extraCount > 0 && (
                <span className="text-[11px] uppercase text-cyan-300/70">+{extraCount} {t.hiddenNodes}</span>
              )}
            </div>
            <div className="grid gap-3 max-h-[240px] overflow-y-auto pr-2">
              {sortedNodes.slice(1).map((node) => (
                <div key={node.ip} className="rounded-3xl border border-cyan-500/10 bg-slate-950/70 p-3 transition hover:border-cyan-400/30 hover:bg-slate-900/90">
                  <div className="flex items-center justify-between gap-3 text-sm text-white">
                    <span className="font-mono truncate">{node.ip}</span>
                    <span className={`text-[11px] uppercase ${node.status === 'active' ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {node.status === 'active' ? t.nodeActive : t.nodeMonitoring}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-400">
                    {node.city && <span className="rounded-full bg-cyan-500/10 px-2 py-1">{node.city}</span>}
                    {node.responseTime !== undefined && <span className="rounded-full bg-slate-800/80 px-2 py-1">{node.responseTime}ms</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-cyan-500/30 bg-slate-950/95 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-2xl font-black text-cyan-300 mb-4">{t.nodeDetailsTitle}</div>
            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex justify-between">
                <span>{t.ipAddress}</span>
                <span className="font-mono text-cyan-200">{selectedNode.ip}</span>
              </div>
              {selectedNode.city && (
                <div className="flex justify-between">
                  <span>{t.location}</span>
                  <span>{selectedNode.city}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t.connectionStatus}</span>
                <span className={selectedNode.status === 'active' ? 'text-emerald-300' : 'text-amber-300'}>
                  {selectedNode.status === 'active' ? t.nodeActive : t.nodeMonitoring}
                </span>
              </div>
              {selectedNode.responseTime !== undefined && (
                <div className="flex justify-between">
                  <span>{t.rtt}</span>
                  <span>{selectedNode.responseTime}ms</span>
                </div>
              )}
            </div>
            <button
              className="mt-6 w-full rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
              onClick={() => setSelectedNode(null)}
            >
              {t.close}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NodeTopology;
