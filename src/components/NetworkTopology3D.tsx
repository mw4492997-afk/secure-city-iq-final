"use client";

import React, { useMemo, useRef, useCallback, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import type { NetworkNode } from "@/hooks/useNetworkNodes";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NetworkTopology3DProps {
  nodes: NetworkNode[];
  onNodeClick?: (node: NetworkNode) => void;
  selectedNode?: NetworkNode | null;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const NODE_RADIUS = 0.18;
const ROOT_NODE_RADIUS = 0.35;
const CONNECTION_OPACITY = 0.12;
const MAX_CONNECTIONS_PER_NODE = 4;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function lerpColor(status: "active" | "inactive"): THREE.Color {
  return status === "active"
    ? new THREE.Color("#00ff99")
    : new THREE.Color("#f59e0b");
}

/* ------------------------------------------------------------------ */
/*  Instanced Nodes                                                    */
/* ------------------------------------------------------------------ */

const InstancedNodes = React.memo(function InstancedNodes({
  nodes,
  onNodeClick,
  selectedNode,
}: {
  nodes: NetworkNode[];
  onNodeClick?: (node: NetworkNode) => void;
  selectedNode?: NetworkNode | null;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  // Track hovered instance for cursor change
  const [hovered, setHovered] = useState<number | null>(null);

  useFrame(() => {
    if (!meshRef.current) return;

    nodes.forEach((node, i) => {
      dummy.position.set(...node.position);
      const isRoot = i === 0;
      const scale = isRoot ? 1.8 : 1;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, lerpColor(node.status));
    });

    // Highlight selected node
    if (selectedNode) {
      const idx = nodes.findIndex((n) => n.ip === selectedNode.ip);
      if (idx !== -1) {
        color.set("#22d3ee");
        meshRef.current.setColorAt(idx, color);
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation?.();
      const instanceId = e.instanceId as number;
      if (instanceId != null && nodes[instanceId]) {
        onNodeClick?.(nodes[instanceId]);
      }
    },
    [nodes, onNodeClick]
  );

  const handlePointerOver = useCallback(
    (e: any) => {
      e.stopPropagation?.();
      const instanceId = e.instanceId as number;
      if (instanceId != null) {
        setHovered(instanceId);
        document.body.style.cursor = "pointer";
      }
    },
    []
  );

  const handlePointerOut = useCallback(() => {
    setHovered(null);
    document.body.style.cursor = "auto";
  }, []);

  const geometry = useMemo(
    () => new THREE.SphereGeometry(NODE_RADIUS, 16, 16),
    []
  );
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.3,
        metalness: 0.7,
        emissive: new THREE.Color("#000000"),
        emissiveIntensity: 0.2,
      }),
    []
  );

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, Math.max(nodes.length, 1)]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* geometry & material passed via args */}
    </instancedMesh>
  );
});

/* ------------------------------------------------------------------ */
/*  Connection Lines (BufferGeometry)                                  */
/* ------------------------------------------------------------------ */

const ConnectionLines = React.memo(function ConnectionLines({
  nodes,
}: {
  nodes: NetworkNode[];
}) {
  const lineRef = useRef<THREE.LineSegments>(null);

  const { positions, count } = useMemo(() => {
    if (nodes.length < 2) return { positions: new Float32Array(0), count: 0 };

    const lines: number[] = [];
    const root = nodes[0];

    // Connect every node to root (star topology base)
    for (let i = 1; i < nodes.length; i++) {
      lines.push(...root.position, ...nodes[i].position);
    }

    // Connect nearby nodes (limited per node for performance)
    for (let i = 1; i < nodes.length; i++) {
      let connections = 0;
      for (let j = i + 1; j < nodes.length && connections < MAX_CONNECTIONS_PER_NODE; j++) {
        const dx = nodes[i].position[0] - nodes[j].position[0];
        const dy = nodes[i].position[1] - nodes[j].position[1];
        const dz = nodes[i].position[2] - nodes[j].position[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 4) {
          lines.push(...nodes[i].position, ...nodes[j].position);
          connections++;
        }
      }
    }

    return {
      positions: new Float32Array(lines),
      count: lines.length / 3,
    };
  }, [nodes]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#06b6d4"),
        transparent: true,
        opacity: CONNECTION_OPACITY,
        depthWrite: false,
      }),
    []
  );

  if (count === 0) return null;

  return <lineSegments ref={lineRef} geometry={geometry} material={material} />;
});

/* ------------------------------------------------------------------ */
/*  Root Node Glow                                                     */
/* ------------------------------------------------------------------ */

const RootNodeGlow = React.memo(function RootNodeGlow({
  position,
}: {
  position: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.08;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[ROOT_NODE_RADIUS, 32, 32]} />
      <meshStandardMaterial
        color="#22d3ee"
        emissive="#0891b2"
        emissiveIntensity={0.6}
        roughness={0.2}
        metalness={0.8}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
});

/* ------------------------------------------------------------------ */
/*  Node Labels (Html)                                                 */
/* ------------------------------------------------------------------ */

const NodeLabels = React.memo(function NodeLabels({
  nodes,
}: {
  nodes: NetworkNode[];
}) {
  return (
    <>
      {nodes.map((node, i) => (
        <Html
          key={node.ip}
          position={[
            node.position[0],
            node.position[1] + NODE_RADIUS * 1.5,
            node.position[2],
          ]}
          center
          distanceFactor={12}
          style={{
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div
            className="px-2 py-0.5 rounded-full text-[10px] font-mono whitespace-nowrap"
            style={{
              background: "rgba(0,0,0,0.7)",
              border: `1px solid ${
                node.status === "active" ? "#00ff99" : "#f59e0b"
              }`,
              color: node.status === "active" ? "#00ff99" : "#f59e0b",
              backdropFilter: "blur(4px)",
            }}
          >
            {node.ip}
          </div>
        </Html>
      ))}
    </>
  );
});

/* ------------------------------------------------------------------ */
/*  Scene Rotation                                                     */
/* ------------------------------------------------------------------ */

function SceneRotation({
  children,
  speed = 0.05,
}: {
  children: React.ReactNode;
  speed?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * speed;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function NetworkTopology3D({
  nodes,
  onNodeClick,
  selectedNode,
}: NetworkTopology3DProps) {
  const rootNode = nodes[0];

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 14], fov: 50 }}
        dpr={[1, 1.5]} // Cap pixel ratio for performance
        gl={{
          antialias: false, // Disable MSAA for performance
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#22d3ee" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#0891b2" />

        <SceneRotation speed={0.03}>
          {rootNode && <RootNodeGlow position={rootNode.position} />}
          <InstancedNodes
            nodes={nodes}
            onNodeClick={onNodeClick}
            selectedNode={selectedNode}
          />
          <ConnectionLines nodes={nodes} />
          <NodeLabels nodes={nodes} />
        </SceneRotation>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={5}
          maxDistance={30}
          autoRotate={false}
          rotateSpeed={0.5}
        />
      </Canvas>

      {/* Overlay hint */}
      <div className="absolute bottom-3 left-3 text-[10px] text-cyan-300/60 pointer-events-none select-none">
        Drag to rotate • Scroll to zoom • Click node for details
      </div>
    </div>
  );
}

