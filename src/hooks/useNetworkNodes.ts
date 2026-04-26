"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface NetworkNode {
  ip: string;
  status: "active" | "inactive";
  responseTime?: number;
  city?: string;
  lastSeen: number;
  position: [number, number, number];
}

interface ApiNode {
  ip: string;
  status?: string;
  response_time?: number;
  city?: string;
}

interface UseNetworkNodesOptions {
  pollInterval?: number;
  maxNodes?: number;
  apiEndpoint?: string;
}

function generatePosition(index: number, total: number): [number, number, number] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (index / (total - 1 || 1)) * 2;
  const radius = Math.sqrt(1 - y * y);
  const theta = goldenAngle * index;
  const x = Math.cos(theta) * radius;
  const z = Math.sin(theta) * radius;
  const scale = 3 + Math.floor(index / 20) * 1.5;
  return [x * scale, y * scale, z * scale];
}

export function useNetworkNodes(options: UseNetworkNodesOptions = {}) {
  const {
    pollInterval = 15000,
    maxNodes = 200,
    apiEndpoint = "/api/get_nodes",
  } = options;

  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const nodesRef = useRef<Map<string, NetworkNode>>(new Map());
  const abortRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNodes = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiEndpoint, {
        signal: controller.signal,
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as {
        nodes?: ApiNode[];
        success?: boolean;
      };

      if (!data?.nodes || !Array.isArray(data.nodes)) {
        throw new Error("Invalid response format");
      }

      const now = Date.now();
      const currentMap = nodesRef.current;
      const newMap = new Map<string, NetworkNode>();

      // Process incoming nodes
      data.nodes.forEach((apiNode, index) => {
        const ip = apiNode.ip;
        if (!ip) return;

        const existing = currentMap.get(ip);
        const position: [number, number, number] = existing
          ? existing.position
          : generatePosition(index, Math.min(data.nodes!.length, maxNodes));

        newMap.set(ip, {
          ip,
          status: apiNode.status === "offline" ? "inactive" : "active",
          responseTime: apiNode.response_time,
          city: apiNode.city,
          lastSeen: now,
          position,
        });
      });

      // Keep recently seen nodes that weren't in this response (grace period)
      currentMap.forEach((node, ip) => {
        if (!newMap.has(ip) && now - node.lastSeen < pollInterval * 2) {
          newMap.set(ip, { ...node, status: "inactive" });
        }
      });

      // Enforce max nodes limit - remove oldest inactive first
      if (newMap.size > maxNodes) {
        const sorted = Array.from(newMap.values()).sort((a, b) => {
          if (a.status !== b.status) {
            return a.status === "active" ? -1 : 1;
          }
          return a.lastSeen - b.lastSeen;
        });
        const toKeep = sorted.slice(0, maxNodes);
        newMap.clear();
        toKeep.forEach((n) => newMap.set(n.ip, n));
      }

      nodesRef.current = newMap;
      setNodes(Array.from(newMap.values()));
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint, pollInterval, maxNodes]);

  const refresh = useCallback(() => {
    fetchNodes();
  }, [fetchNodes]);

  useEffect(() => {
    fetchNodes();
    intervalRef.current = setInterval(fetchNodes, pollInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchNodes, pollInterval]);

  return {
    nodes,
    isLoading,
    error,
    lastUpdated,
    refresh,
  };
}

