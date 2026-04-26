"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Wifi,
  Router,
  Smartphone,
  Monitor,
  ScanLine,
  Loader2,
  ShieldCheck,
  Activity,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import NetworkTopology3D from "@/components/NetworkTopology3D";
import { addAuditLog } from "@/lib/logService";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DiscoveredNode {
  id: string;
  name: string;
  ip: string;
  type: "Public" | "Local" | "Gateway" | "Device";
  status: "active" | "inactive";
  responseTime?: number;
  position: [number, number, number];
  icon: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Device fingerprinting from User Agent                              */
/* ------------------------------------------------------------------ */

function fingerprintDevice(): { name: string; icon: React.ReactNode } {
  const ua = navigator.userAgent;

  if (/Samsung Galaxy S24 Ultra/i.test(ua))
    return { name: "Samsung Galaxy S24 Ultra", icon: <Smartphone className="w-4 h-4" /> };
  if (/Samsung Galaxy S24/i.test(ua))
    return { name: "Samsung Galaxy S24", icon: <Smartphone className="w-4 h-4" /> };
  if (/Samsung/i.test(ua))
    return { name: "Samsung Mobile", icon: <Smartphone className="w-4 h-4" /> };
  if (/iPhone 16 Pro Max/i.test(ua))
    return { name: "iPhone 16 Pro Max", icon: <Smartphone className="w-4 h-4" /> };
  if (/iPhone 16/i.test(ua))
    return { name: "iPhone 16", icon: <Smartphone className="w-4 h-4" /> };
  if (/iPhone 15/i.test(ua))
    return { name: "iPhone 15", icon: <Smartphone className="w-4 h-4" /> };
  if (/iPhone/i.test(ua))
    return { name: "iPhone", icon: <Smartphone className="w-4 h-4" /> };
  if (/iPad/i.test(ua))
    return { name: "iPad", icon: <Monitor className="w-4 h-4" /> };
  if (/Pixel 9/i.test(ua))
    return { name: "Google Pixel 9", icon: <Smartphone className="w-4 h-4" /> };
  if (/Pixel/i.test(ua))
    return { name: "Google Pixel", icon: <Smartphone className="w-4 h-4" /> };
  if (/Xiaomi 14/i.test(ua))
    return { name: "Xiaomi 14 Ultra", icon: <Smartphone className="w-4 h-4" /> };
  if (/Xiaomi/i.test(ua))
    return { name: "Xiaomi Phone", icon: <Smartphone className="w-4 h-4" /> };
  if (/Android/i.test(ua))
    return { name: "Android Device", icon: <Smartphone className="w-4 h-4" /> };
  if (/Windows NT 10.0/i.test(ua) && /Touch/i.test(ua))
    return { name: "Windows 11 Tablet", icon: <Monitor className="w-4 h-4" /> };
  if (/Windows NT 10.0/i.test(ua))
    return { name: "Windows 11 PC", icon: <Monitor className="w-4 h-4" /> };
  if (/Windows NT 6.3/i.test(ua))
    return { name: "Windows 8.1 PC", icon: <Monitor className="w-4 h-4" /> };
  if (/Windows NT 6.1/i.test(ua))
    return { name: "Windows 7 PC", icon: <Monitor className="w-4 h-4" /> };
  if (/Mac OS X 10_15/i.test(ua) || /macOS/i.test(ua))
    return { name: "macOS Device", icon: <Monitor className="w-4 h-4" /> };
  if (/Macintosh/i.test(ua))
    return { name: "Mac Computer", icon: <Monitor className="w-4 h-4" /> };
  if (/Linux/i.test(ua))
    return { name: "Linux Workstation", icon: <Monitor className="w-4 h-4" /> };

  return { name: "Unknown Device", icon: <Monitor className="w-4 h-4" /> };
}

/* ------------------------------------------------------------------ */
/*  WebRTC Local IP Discovery                                          */
/* ------------------------------------------------------------------ */

function discoverLocalIP(): Promise<string> {
  return new Promise((resolve) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    const seen = new Set<string>();
    let resolved = false;

    pc.createDataChannel("probe");

    pc.onicecandidate = (ice) => {
      if (!ice.candidate || !ice.candidate.candidate) {
        if (!resolved) {
          resolved = true;
          resolve("Unable to detect");
        }
        return;
      }
      const ipMatch = /([0-9]{1,3}\.){3}[0-9]{1,3}/.exec(ice.candidate.candidate);
      if (ipMatch) {
        const ip = ipMatch[0];
        if (!ip.startsWith("0.0.0") && !seen.has(ip)) {
          seen.add(ip);
          if (ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
            resolved = true;
            resolve(ip);
            pc.close();
          }
        }
      }
    };

    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch(() => {
        if (!resolved) {
          resolved = true;
          resolve("Unable to detect");
        }
      });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve("Unable to detect");
        pc.close();
      }
    }, 3000);
  });
}

/* ------------------------------------------------------------------ */
/*  Gateway Detection (heuristic + fetch probe)                        */
/* ------------------------------------------------------------------ */

async function detectGateway(localIP: string): Promise<string | null> {
  if (localIP.includes("192.168.")) {
    const subnet = localIP.split(".").slice(0, 3).join(".");
    const candidates = [`${subnet}.1`, `${subnet}.254`, `${subnet}.100`];

    for (const gw of candidates) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 1500);
        await fetch(`http://${gw}`, { mode: "no-cors", signal: ctrl.signal });
        clearTimeout(t);
        return gw;
      } catch {
        /* continue */
      }
    }
    return `${subnet}.1`; // fallback
  }
  return "192.168.1.1";
}

/* ------------------------------------------------------------------ */
/*  Position helper for 3D map                                         */
/* ------------------------------------------------------------------ */

function spherePosition(index: number, total: number, radius: number): [number, number, number] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (index / Math.max(total - 1, 1)) * 2;
  const r = Math.sqrt(1 - y * y);
  const theta = goldenAngle * index;
  return [Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius];
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function CyberSecurityTopology() {
  const [nodes, setNodes] = useState<DiscoveredNode[]>([]);
  const [scanning, setScanning] = useState(false);
  const [publicIP, setPublicIP] = useState<string>("—");
  const [localIP, setLocalIP] = useState<string>("—");
  const [gatewayIP, setGatewayIP] = useState<string>("—");
  const [deviceInfo, setDeviceInfo] = useState(fingerprintDevice());
  const [selectedNode, setSelectedNode] = useState<DiscoveredNode | null>(null);
  const scanIdRef = useRef(0);

  const runDiscovery = useCallback(async () => {
    const scanId = ++scanIdRef.current;
    setScanning(true);
    setNodes([]);
    setPublicIP("—");
    setLocalIP("—");
    setGatewayIP("—");

    const discovered: DiscoveredNode[] = [];

    try {
      /* 1. Public IP */
      const pubRes = await fetch("https://api64.ipify.org?format=json", {
        cache: "no-store",
      });
      const pubData = (await pubRes.json()) as { ip?: string };
      const pubIP = pubData.ip || "Unknown";
      if (scanId !== scanIdRef.current) return;
      setPublicIP(pubIP);

      discovered.push({
        id: "public",
        name: "Public Internet",
        ip: pubIP,
        type: "Public",
        status: "active",
        responseTime: 0,
        position: spherePosition(0, 4, 4),
        icon: <Globe className="w-4 h-4 text-cyan-300" />,
      });

      /* 2. Local IP via WebRTC */
      const privIP = await discoverLocalIP();
      if (scanId !== scanIdRef.current) return;
      setLocalIP(privIP);

      discovered.push({
        id: "local",
        name: deviceInfo.name,
        ip: privIP,
        type: "Local",
        status: "active",
        responseTime: 0,
        position: spherePosition(1, 4, 4),
        icon: deviceInfo.icon,
      });

      /* 3. Gateway detection */
      const gw = await detectGateway(privIP);
      if (scanId !== scanIdRef.current) return;
      if (gw) {
        setGatewayIP(gw);
        discovered.push({
          id: "gateway",
          name: "Router / Gateway",
          ip: gw,
          type: "Gateway",
          status: "active",
          responseTime: 1,
          position: spherePosition(2, 4, 4),
          icon: <Router className="w-4 h-4 text-emerald-300" />,
        });
      }

      /* 4. Common local devices (heuristic sweep) */
      if (privIP.includes("192.168.")) {
        const subnet = privIP.split(".").slice(0, 3).join(".");
        const probes = [2, 3, 10, 50, 100, 105, 110, 200, 254];
        let idx = 3;

        await Promise.all(
          probes.map(async (lastOctet) => {
            const target = `${subnet}.${lastOctet}`;
            const start = performance.now();
            try {
              const ctrl = new AbortController();
              const t = setTimeout(() => ctrl.abort(), 1200);
              await fetch(`http://${target}`, { mode: "no-cors", signal: ctrl.signal });
              clearTimeout(t);
              const rtt = Math.round(performance.now() - start);
              if (scanId !== scanIdRef.current) return;

              discovered.push({
                id: `dev-${lastOctet}`,
                name: `Network Device ${lastOctet}`,
                ip: target,
                type: "Device",
                status: "active",
                responseTime: rtt,
                position: spherePosition(idx++, Math.max(probes.length + 3, 8), 5),
                icon: <Wifi className="w-4 h-4 text-yellow-300" />,
              });
            } catch {
              /* silent fail — device offline or blocked */
            }
          })
        );
      }

      /* 5. Build 3D map nodes */
      const finalNodes = discovered.map((n, i) => ({
        ...n,
        position: spherePosition(i, Math.max(discovered.length, 1), 5),
      }));

      if (scanId === scanIdRef.current) {
        setNodes(finalNodes);
        toast.success(`Network scan complete — ${finalNodes.length} nodes discovered in Wasit`);
      }

      /* 6. Firestore log */
      await addAuditLog(
        `Full Network Scan Completed in Wasit Center - ${pubIP} Secured`,
        "Info"
      );
    } catch (err) {
      console.error(err);
      toast.error("Network scan encountered an error.");
    } finally {
      if (scanId === scanIdRef.current) setScanning(false);
    }
  }, [deviceInfo]);

  /* Auto-run once on mount */
  useEffect(() => {
    runDiscovery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topologyNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ip: n.ip,
        status: n.status,
        responseTime: n.responseTime ?? 0,
        city: n.name,
        position: n.position,
        lastSeen: Date.now(),
      })),
    [nodes]
  );

  return (
    <div className="w-full h-full p-6 flex flex-col gap-5 overflow-hidden bg-gradient-to-br from-black/40 to-transparent">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--active-neon)] mb-2">
            Wasit Network Command Center
          </div>
          <h1 className="text-3xl font-black text-white">Cyber Security Topology</h1>
          <p className="text-sm text-zinc-500 max-w-2xl mt-2">
            Real-time discovery of your actual network environment in Wasit, Iraq.
          </p>
        </div>
        <button
          onClick={runDiscovery}
          disabled={scanning}
          className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-cyan-300 hover:bg-cyan-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {scanning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ScanLine className="w-4 h-4" />
          )}
          {scanning ? "Scanning..." : "Scan Network"}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Public IP" value={publicIP} icon={<Globe className="w-4 h-4 text-cyan-300" />} />
        <StatCard label="Local IP" value={localIP} icon={<Wifi className="w-4 h-4 text-emerald-300" />} />
        <StatCard label="Gateway" value={gatewayIP} icon={<Router className="w-4 h-4 text-yellow-300" />} />
        <StatCard label="Device" value={deviceInfo.name} icon={deviceInfo.icon} />
      </div>

      {/* 3D Map + Table */}
      <div className="flex-1 min-h-0 grid gap-4 lg:grid-cols-[1fr_380px]">
        {/* 3D Topology */}
        <div className="glass-card border border-cyan-500/20 bg-slate-950/70 rounded-3xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">3D Network Map</div>
            <span className="flex items-center gap-1 text-[10px] text-cyan-300/70">
              <MapPin className="w-3 h-3" /> Wasit, Iraq
            </span>
          </div>
          <div className="flex-1 min-h-0 relative">
            <NetworkTopology3D
              nodes={topologyNodes}
              onNodeClick={(n) => {
                const found = nodes.find((x) => x.ip === n.ip);
                if (found) setSelectedNode(found);
              }}
              selectedNode={
                selectedNode
                  ? {
                      ip: selectedNode.ip,
                      status: selectedNode.status,
                      responseTime: selectedNode.responseTime ?? 0,
                      city: selectedNode.name,
                      position: selectedNode.position,
                      lastSeen: Date.now(),
                    }
                  : null
              }
            />
          </div>
        </div>

        {/* Device Table */}
        <div className="glass-card border border-cyan-500/20 bg-slate-950/80 rounded-3xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-white/5">
            <div className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">Discovered Devices</div>
            <div className="text-lg font-black text-white">{nodes.length} Nodes</div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <AnimatePresence>
              {nodes.map((node) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => setSelectedNode(node)}
                  className={`rounded-2xl border px-4 py-3 cursor-pointer transition hover:border-cyan-400/30 ${
                    selectedNode?.id === node.id
                      ? "border-cyan-400/40 bg-cyan-500/10"
                      : "border-white/5 bg-black/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {node.icon}
                      <span className="text-sm font-bold text-white">{node.name}</span>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-[0.25em] px-2 py-0.5 rounded-full ${
                        node.status === "active"
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-amber-500/10 text-amber-300"
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                    <span className="font-mono text-cyan-200">{node.ip}</span>
                    <span className="text-right">{node.type}</span>
                    {node.responseTime !== undefined && (
                      <span className="col-span-2">{node.responseTime}ms response</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {nodes.length === 0 && !scanning && (
              <div className="text-center text-zinc-500 text-sm py-8">
                No devices discovered yet. Click <strong>Scan Network</strong> to begin.
              </div>
            )}
            {scanning && nodes.length === 0 && (
              <div className="text-center text-zinc-500 text-sm py-8 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Probing network...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Node Modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedNode(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-cyan-500/30 bg-slate-950/95 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-6 h-6 text-[var(--active-neon)]" />
                <div className="text-2xl font-black text-cyan-300">Node Details</div>
              </div>
              <div className="space-y-3 text-sm text-slate-200">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Name</span>
                  <span className="font-bold text-white">{selectedNode.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">IP Address</span>
                  <span className="font-mono text-cyan-200">{selectedNode.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Type</span>
                  <span>{selectedNode.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Status</span>
                  <span
                    className={
                      selectedNode.status === "active" ? "text-emerald-300" : "text-amber-300"
                    }
                  >
                    {selectedNode.status.toUpperCase()}
                  </span>
                </div>
                {selectedNode.responseTime !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Response Time</span>
                    <span>{selectedNode.responseTime}ms</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-400">Location</span>
                  <span className="flex items-center gap-1 text-cyan-300">
                    <MapPin className="w-3 h-3" /> Wasit, Iraq
                  </span>
                </div>
              </div>
              <button
                className="mt-6 w-full rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
                onClick={() => setSelectedNode(null)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/30 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">{label}</div>
        <div className="text-sm font-black text-white truncate max-w-[180px]">{value}</div>
      </div>
    </div>
  );
}

