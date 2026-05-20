import React, { useRef, useEffect, useState } from 'react';
import { TrajectoryPoint } from '../types';

interface ComplexPlaneProps {
  sigma: number;
  omega: number;
  currentTime: number;
  onChangeParams: (sigma: number, omega: number) => void;
  trajectory: TrajectoryPoint[];
}

export const ComplexPlane: React.FC<ComplexPlaneProps> = ({
  sigma,
  omega,
  currentTime,
  onChangeParams,
  trajectory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Convert coordinate on plane back to sigma & omega values
  const handleCanvasInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const w = rect.width;
    const h = rect.height;
    const centerX = w / 2;
    const centerY = h / 2;

    // We fit range [-2.5, 2.5] across the smaller of width & height
    const zoom = Math.min(w, h) / 6.0;

    const newSigma = (x - centerX) / zoom;
    // in canvas, y goes down, but imaginary axis goes up
    const newOmega = -(y - centerY) / zoom;

    // Clamp values to slider bounds
    const clampedSigma = Math.max(-2.0, Math.min(1.0, newSigma));
    const clampedOmega = Math.max(0.0, Math.min(10.0, newOmega));

    onChangeParams(Number(clampedSigma.toFixed(3)), Number(clampedOmega.toFixed(3)));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    handleCanvasInteraction(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      handleCanvasInteraction(e.clientX, e.clientY);
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch screen support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDragging && e.touches.length > 0) {
      handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const resizeObserver = new ResizeObserver(() => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight || 400;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      draw();
    });

    resizeObserver.observe(canvas.parentElement!);

    const draw = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2;
      const zoom = Math.min(w, h) / 6.0;

      // Draw Grid Lines (Subtle)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.font = '10px JetBrains Mono';
      ctx.fillStyle = '#64748b';

      // Spacing for major ticks (every 1.0 units)
      for (let val = -3; val <= 3; val += 0.5) {
        if (val === 0) continue;
        const screenX = centerX + val * zoom;
        const screenY = centerY - val * zoom;

        // Vertical Grid line
        ctx.beginPath();
        ctx.strokeStyle = val % 1 === 0 ? '#1e293b' : '#0f172a';
        ctx.moveTo(screenX, 0);
        ctx.lineTo(screenX, h);
        ctx.stroke();

        // Horizontal Grid line
        ctx.beginPath();
        ctx.strokeStyle = val % 1 === 0 ? '#1e293b' : '#0f172a';
        ctx.moveTo(0, screenY);
        ctx.lineTo(w, screenY);
        ctx.stroke();

        // Labels
        if (val % 1.0 === 0) {
          ctx.fillText(`${val > 0 ? '+' : ''}${val}`, screenX - 8, centerY + 14);
          ctx.fillText(`${val > 0 ? '+' : ''}${val}i`, centerX + 6, screenY + 4);
        }
      }

      // Draw Main Axes
      ctx.strokeStyle = '#424754';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Real axis
      ctx.moveTo(0, centerY);
      ctx.lineTo(w, centerY);
      // Imaginary axis
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, h);
      ctx.stroke();

      // Axis label titles
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Re (Real)', w - 60, centerY - 8);
      ctx.fillText('Im (Imag)', centerX + 12, 18);

      // Trajectory trace of y(t)
      if (trajectory.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(173, 198, 255, 0.75)'; // Electric Blue
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#adc6ff';

        trajectory.forEach((pt, i) => {
          const px = centerX + pt.real * zoom;
          const py = centerY - pt.imag * zoom;
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        });
        ctx.stroke();
        // Reset shadow
        ctx.shadowBlur = 0;
      }

      // Dynamic vector of current y(t)
      const currentReal = Math.exp(sigma * currentTime) * Math.cos(omega * currentTime);
      const currentImag = Math.exp(sigma * currentTime) * Math.sin(omega * currentTime);

      const vx = centerX + currentReal * zoom;
      const vy = centerY - currentImag * zoom;

      // Draw line connecting center to current y(t) representation
      ctx.strokeStyle = '#adc6ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(vx, vy);
      ctx.stroke();

      // Draw vector head (endpoint of current trajectory)
      ctx.fillStyle = '#adc6ff';
      ctx.beginPath();
      ctx.arc(vx, vy, 6, 0, Math.PI * 2);
      ctx.fill();

      // Draw pole position s = sigma + i·omega (the system eigenvalue)
      const px = centerX + sigma * zoom;
      const py = centerY - omega * zoom;

      // Subtle dash line from pole to axes
      ctx.strokeStyle = '#ef4444'; // Red-orange representing eigenvalue parameter
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(centerX, py);
      ctx.moveTo(px, py);
      ctx.lineTo(px, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Pole Dot
      ctx.fillStyle = '#ffb690'; // Sunset Orange
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring for pole
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.stroke();

      // Label the pole
      ctx.fillStyle = '#ffdcca';
      ctx.font = 'bold 11px Inter';
      ctx.fillText(`s = ${sigma.toFixed(2)} + ${omega.toFixed(2)}i`, px + 12, py - 4);
      ctx.fillStyle = '#adc6ff';
      ctx.fillText(`y(t)`, vx + 10, vy + 12);
    };

    draw();

    return () => {
      resizeObserver.disconnect();
    };
  }, [sigma, omega, currentTime, trajectory]);

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-crosshair">
      <canvas
        ref={canvasRef}
        className="block rounded bg-slate-950/40 select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUpOrLeave}
        id="complex-plane-canvas"
      />
      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-slate-400 select-none pointer-events-none border border-slate-800">
        Click/Drag to relocate eigenvalue pole s
      </div>
    </div>
  );
};
