"use client";

import { useEffect, useState } from "react";

interface Blip {
  id: number;
  x: number;
  y: number;
  opacity: number;
}

export default function RadarHUD() {
  const [blips, setBlips] = useState<Blip[]>([]);
  const [gps, setGps] = useState({ lat: 34.0522, lng: -118.2437 });

  useEffect(() => {
    const blipInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setBlips(prev => [
          ...prev.slice(-4),
          { id: Date.now(), x: Math.random() * 80 + 10, y: Math.random() * 80 + 10, opacity: 1 }
        ]);
      }
      setGps({
        lat: 34.0522 + (Math.random() - 0.5) * 0.01,
        lng: -118.2437 + (Math.random() - 0.5) * 0.01
      });
    }, 1000);

    const fadeInterval = setInterval(() => {
      setBlips(prev => prev.map(b => ({ ...b, opacity: Math.max(0, b.opacity - 0.1) })));
    }, 200);

    return () => {
      clearInterval(blipInterval);
      clearInterval(fadeInterval);
    };
  }, []);

  return (
    <div className="relative w-48 h-48 rounded-full border border-[var(--active-neon)] flex items-center justify-center bg-[var(--active-neon)]/5 overflow-hidden">
      {/* Rotating Sweep */}
      <div className="absolute inset-0 animate-[spin_4s_linear_infinite] bg-gradient-to-r from-transparent via-[var(--active-neon)]/20 to-transparent origin-center" />
      
      {/* Grid Lines */}
      <div className="absolute inset-0 border border-[var(--active-neon)]/20 rounded-full scale-75" />
      <div className="absolute inset-0 border border-[var(--active-neon)]/20 rounded-full scale-50" />
      <div className="absolute h-full w-[1px] bg-[var(--active-neon)]/20" />
      <div className="absolute w-full h-[1px] bg-[var(--active-neon)]/20" />

      {/* Blips */}
      {blips.map(blip => (
        <div
          key={blip.id}
          className="absolute w-2 h-2 rounded-full bg-[var(--active-neon)] shadow-[0_0_8px_var(--active-neon-glow)]"
          style={{
            left: `${blip.x}%`,
            top: `${blip.y}%`,
            opacity: blip.opacity
          }}
        />
      ))}

      {/* GPS Overlay */}
      <div className="absolute bottom-2 left-0 w-full text-center text-[10px] font-mono text-[var(--active-neon)]">
        GPS: {gps.lat.toFixed(4)}N {gps.lng.toFixed(4)}W
      </div>
    </div>
  );
}
