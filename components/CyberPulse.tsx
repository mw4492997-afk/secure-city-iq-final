"use client";

import { useEffect, useRef } from "react";

export default function CyberPulse() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width: number;
    let height: number;
    let scanLineY = 0;
    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    resize();

    const hexRadius = 40;
    const hexWidth = Math.sqrt(3) * hexRadius;
    const hexHeight = 2 * hexRadius;

    const drawHexagon = (x: number, y: number, radius: number, alpha: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = x + radius * Math.cos(angle);
        const hy = y + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      const isEmergency = document.documentElement.getAttribute("data-emergency") === "true";
      const color = isEmergency ? `rgba(239, 68, 68, ${alpha})` : `rgba(45, 212, 191, ${alpha})`;
      ctx.strokeStyle = color;
      ctx.lineWidth = alpha > 0.4 ? 2 : 1;
      ctx.stroke();
    };

    const render = () => {
      const isEmergency = document.documentElement.getAttribute("data-emergency") === "true";
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = isEmergency ? "#1a0000" : "#001a1a";
      ctx.fillRect(0, 0, width, height);

      const rows = Math.ceil(height / (hexHeight * 0.75)) + 1;
      const cols = Math.ceil(width / hexWidth) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let x = c * hexWidth;
          let y = r * hexHeight * 0.75;

          if (r % 2 === 1) {
            x += hexWidth / 2;
          }

          const distToScanLine = Math.abs(y - scanLineY);
          const distToMouse = Math.sqrt((x - mouse.x) ** 2 + (y - mouse.y) ** 2);
          
          let alpha = Math.max(0.05, 0.3 - distToScanLine / 300);
          if (distToMouse < 200) {
            alpha = Math.max(alpha, (1 - distToMouse / 200) * 0.6);
          }
          
          drawHexagon(x, y, hexRadius, alpha);
        }
      }

      // Draw scan line
      ctx.beginPath();
      ctx.moveTo(0, scanLineY);
      ctx.lineTo(width, scanLineY);
      const scanLineColor = isEmergency ? `rgba(239, 68, 68, 0.2)` : `rgba(45, 212, 191, 0.2)`;
      ctx.strokeStyle = scanLineColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      scanLineY += 2;
      if (scanLineY > height) scanLineY = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
