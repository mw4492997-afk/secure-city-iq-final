"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  getClientIP,
  getGeolocation,
  fetchNetworkDevices,
  getNetworkMetrics,
  NetworkDevice,
} from "@/lib/networkUtils";
import { useNetworkNodes } from "@/hooks/useNetworkNodes";
import NetworkTopology3D from "@/components/NetworkTopology3D";
import type { Locale } from "@/lib/translations";

interface NodeTopologyProps {
  t: Record<string, string>;
  language: Locale;
}

const NodeTopology = ({ t, language }: NodeTopologyProps) => {
  const {
    nodes,
    isLoading,
    error,
    lastUpdated,
    refresh,
  } = useNetworkNodes({
    pollInterval: 15000,
    apiEndpoint: "/api/get_nodes",
  });

  const [clientIP, setClientIP] = useState<string>("127.0.0.1");
  const [localIP, setLocalIP] = useState<string>("127.0.0.1");
  const [localSubnet, setLocalSubnet] = useState<string>("unknown");
  const [geo, setGeo] = useState({
    city: "Localhost",
    country: "Local",
    lat: 0,
    lon: 0,
    ip: "",
  });
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [selectedNode, setSelectedNode] = useState<
    ReturnType<typeof useNetworkNodes>["nodes"][number] | null
  >(null);
  const [networkMetrics, setNetworkMetrics] = useState({ downlink: 0, rtt: 0 });
  const [scanStatus, setScanStatus] = useState(t.extractingClientMetadata);

  const sortedDevices = useMemo(() => {
    return [...devices].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "active" ? -1 : 1;
      }
      return a.ip.localeCompare(b.ip, undefined, { numeric: true });
    });
  }, [devices]);

  const sortedNodes = useMemo(() => {
    return [...nodes].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "active" ? -1 : 1;
      }
      if (a.responseTime !== undefined && b.responseTime !== undefined) {
        return a.responseTime - b.responseTime;
      }
      return a.ip.localeCompare(b.ip, undefined, { numeric: true });
    });
  }, [nodes]);

  const extraCount = Math.max(0, nodes.length - 1 - sortedNodes.slice(1).length);

  // Load local metadata once on mount
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setScanStatus(t.extractingClientMetadata);
        const ip = await getClientIP();
        if (cancelled) return;
        setClientIP(ip);

        setScanStatus(t.resolvingGeoLocation);
        const geoData = await getGeolocation(ip);
        if (cancelled) return;
        setGeo(geoData);

        setScanStatus(t.gatheringLocalInventory);
        const result = await fetchNetworkDevices();
        if (cancelled) return;
        if (result.success) {
          setLocalIP(result.localIP || ip);
          setLocalSubnet(result.localSubnet || "unknown");
          setDevices(result.devices || []);
        }

        setScanStatus(`${t.extractionComplete} ${nodes.length} ${t.nodesDetected}`);
        setNetworkMetrics(getNetworkMetrics());
      } catch (err) {
        console.error("Local metadata load error:", err);
        setScanStatus(t.extractionFailed);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [t, nodes.length]);

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className="w-full h-full grid gap-4 lg:grid-cols-[minmax(320px,380px)_1fr] rounded-3xl overflow-hidden"
    >
      {/* Sidebar */}
      <div className="glass-card border border-cyan-500/20 bg-slate-950/80 p-5 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
              {t.topologyPanelTitle}
            </div>
            <div className="mt-3 text-2xl font-black text-white">
              {t.topologyPanelSubtitle}
            </div>
          </div>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
          >
            {isLoading ? t.updating : t.refreshNow}
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            API Error: {error}
          </div>
        )}

        <div className="grid gap-3 mb-4">
          <div className="rounded-3xl border border-cyan-500/20 bg-black/30 p-4">
            <div className="text-xs uppercase text-cyan-300/70">
              {t.localNetworkOverview}
            </div>
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
                <span className="text-cyan-300">
                  {geo.city}, {geo.country}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>{t.connectionStatus}</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-300">
                  {t.nodeActive}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-cyan-500/20 bg-black/30 p-4">
              <div className="text-xs uppercase text-cyan-300/70">
                {t.connectedNodes}
              </div>
              <div className="mt-3 text-3xl font-black text-white">
                {nodes.length}
              </div>
            </div>
            <div className="rounded-3xl border border-cyan-500/20 bg-black/30 p-4">
              <div className="text-xs uppercase text-cyan-300/70">
                {t.networkDevices}
              </div>
              <div className="mt-3 text-3xl font-black text-white">
                {devices.length}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-500/20 bg-black/30 p-4">
            <div className="text-xs uppercase text-cyan-300/70">
              {t.connectionPerformance}
            </div>
            <div className="mt-3 text-sm text-slate-200 space-y-2">
              <div className="flex justify-between">
                <span>{t.downlink}</span>
                <span>{networkMetrics.downlink.toFixed(1)} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span>{t.rtt}</span>
                <span>{networkMetrics.rtt} ms</span>
              </div>
              <div className="flex justify-between">
                <span>{t.lastUpdated}</span>
                <span>{lastUpdated || "..."}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-cyan-500/20 bg-black/30 p-4 overflow-hidden flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase text-cyan-300/70">
                {t.extractionDetails}
              </div>
              <div className="mt-2 text-sm text-slate-200">{scanStatus}</div>
            </div>
          </div>
          <div className="grid gap-3 overflow-y-auto pr-1">
            {sortedNodes.slice(0, 6).map((node) => (
              <div
                key={node.ip}
                className="rounded-3xl border border-cyan-500/10 bg-slate-950/70 p-3 cursor-pointer transition hover:border-cyan-400/30 hover:bg-slate-900/90"
                onClick={() => setSelectedNode(node)}
              >
                <div className="flex items-center justify-between text-sm text-zinc-400">
                  <span>{node.ip}</span>
                  <span
                    className={`text-xs uppercase ${
                      node.status === "active"
                        ? "text-emerald-300"
                        : "text-amber-300"
                    }`}
                  >
                    {node.status === "active" ? t.nodeActive : t.nodeMonitoring}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-cyan-200">
                  {node.city && (
                    <span className="rounded-full bg-cyan-500/10 px-2 py-1">
                      {node.city}
                    </span>
                  )}
                  {node.responseTime !== undefined && (
                    <span className="rounded-full bg-slate-800/80 px-2 py-1">
                      {node.responseTime}ms
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-cyan-500/15 bg-black/30 p-4 overflow-hidden flex-1 min-h-0 flex flex-col">
          <div className="text-xs uppercase text-cyan-300/70 mb-3">
            {t.sortedNetworkDevicesTitle}
          </div>
          <div className="space-y-2 overflow-y-auto pr-2">
            {sortedDevices.length > 0 ? (
              sortedDevices.map((device) => (
                <div
                  key={`${device.ip}-${device.mac}`}
                  className="rounded-3xl bg-slate-950/70 border border-cyan-500/10 p-3"
                >
                  <div className="flex items-center justify-between gap-2 text-sm text-white">
                    <span className="font-mono truncate">{device.ip}</span>
                    <span
                      className={`text-[11px] uppercase ${
                        device.status === "active"
                          ? "text-emerald-300"
                          : "text-amber-300"
                      }`}
                    >
                      {device.status === "active"
                        ? t.nodeActive
                        : t.nodeMonitoring}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-zinc-400 flex flex-wrap gap-2">
                    <span>{device.name || t.unknown || "unknown"}</span>
                    <span>{device.mac}</span>
                    <span>{device.source || "arp"}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-500">{t.noDevicesDetected}</div>
            )}
          </div>
        </div>
      </div>

      {/* 3D Topology View */}
      <div className="glass-card border border-cyan-500/20 bg-slate-950/70 p-4 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
              {t.topologyWindowTitle}
            </div>
            <div className="text-lg font-black text-white">
              {t.topologyWindowDescription}
            </div>
          </div>
          <div className="rounded-3xl border border-cyan-500/20 bg-black/20 px-3 py-2 text-xs text-cyan-200">
            {t.nodeCountLabel}: {nodes.length}
          </div>
        </div>

        <div className="flex-1 min-h-0 relative rounded-3xl border border-cyan-500/10 bg-slate-900/80 overflow-hidden">
          <NetworkTopology3D
            nodes={nodes}
            onNodeClick={setSelectedNode}
            selectedNode={selectedNode}
          />
        </div>

        <div className="mt-4 rounded-3xl border border-cyan-500/10 bg-black/30 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase text-cyan-300/70">
                {t.networkNodeListTitle}
              </div>
              <div className="text-sm text-slate-300">
                {t.networkNodeListSubtitle}
              </div>
            </div>
            {extraCount > 0 && (
              <span className="text-[11px] uppercase text-cyan-300/70">
                +{extraCount} {t.hiddenNodes}
              </span>
            )}
          </div>
          <div className="grid gap-3 max-h-[200px] overflow-y-auto pr-2">
            {sortedNodes.slice(1).map((node) => (
              <div
                key={node.ip}
                className="rounded-3xl border border-cyan-500/10 bg-slate-950/70 p-3 transition hover:border-cyan-400/30 hover:bg-slate-900/90 cursor-pointer"
                onClick={() => setSelectedNode(node)}
              >
                <div className="flex items-center justify-between gap-3 text-sm text-white">
                  <span className="font-mono truncate">{node.ip}</span>
                  <span
                    className={`text-[11px] uppercase ${
                      node.status === "active"
                        ? "text-emerald-300"
                        : "text-amber-300"
                    }`}
                  >
                    {node.status === "active"
                      ? t.nodeActive
                      : t.nodeMonitoring}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-400">
                  {node.city && (
                    <span className="rounded-full bg-cyan-500/10 px-2 py-1">
                      {node.city}
                    </span>
                  )}
                  {node.responseTime !== undefined && (
                    <span className="rounded-full bg-slate-800/80 px-2 py-1">
                      {node.responseTime}ms
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Node Modal */}
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
            <div className="text-2xl font-black text-cyan-300 mb-4">
              {t.nodeDetailsTitle}
            </div>
            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex justify-between">
                <span>{t.ipAddress}</span>
                <span className="font-mono text-cyan-200">
                  {selectedNode.ip}
                </span>
              </div>
              {selectedNode.city && (
                <div className="flex justify-between">
                  <span>{t.location}</span>
                  <span>{selectedNode.city}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t.connectionStatus}</span>
                <span
                  className={
                    selectedNode.status === "active"
                      ? "text-emerald-300"
                      : "text-amber-300"
                  }
                >
                  {selectedNode.status === "active"
                    ? t.nodeActive
                    : t.nodeMonitoring}
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

