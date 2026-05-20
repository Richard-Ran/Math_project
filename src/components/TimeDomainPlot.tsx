import React, { useRef, useEffect } from 'react';

interface TimeDomainPlotProps {
  sigma: number;
  omega: number;
  currentTime: number;
  onTimeChange: (time: number) => void;
}

export const TimeDomainPlot: React.FC<TimeDomainPlotProps> = ({
  sigma,
  omega,
  currentTime,
  onTimeChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleInteraction = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const w = rect.width;

    const tOriginX = 25;
    const tWidth = w - 50;

    // Map x coordinates back to time in [0, 10]
    let t = ((x - tOriginX) / tWidth) * 10;
    t = Math.max(0, Math.min(10, t));
    onTimeChange(Number(t.toFixed(2)));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.buttons === 1) {
      handleInteraction(e.clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.buttons === 1) {
      handleInteraction(e.clientX);
    }
  };

  const handleTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      handleInteraction(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

      const tOriginX = 25;
      const tWidth = w - 50;
      const tOriginY = h / 2;

      // Amplitude Scale
      // We scale based on sigma. If sigma is positive, we scale down so we can fit exponential growth.
      // Maximum amplitude of system on [0, 10]:
      const maxAmp = sigma > 0 ? Math.exp(sigma * 10) : 1.2;
      const yScale = (h / 2 - 30) / Math.max(1.2, maxAmp);

      // 1. Draw Grid lines and Time ticks
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let t = 0; t <= 10; t += 1.0) {
        const x = tOriginX + (t / 10) * tWidth;
        ctx.moveTo(x, 15);
        ctx.lineTo(x, h - 25);
      }
      // Horizontal level ticks
      const levels = [-2.0, -1.0, -0.5, 0.5, 1.0, 2.0];
      levels.forEach(lvl => {
        if (Math.abs(lvl) * yScale < h / 2 - 20) {
          const y = tOriginY - lvl * yScale;
          ctx.moveTo(tOriginX, y);
          ctx.lineTo(tOriginX + tWidth, y);
        }
      });
      ctx.stroke();

      // Time axis baseline and center
      ctx.strokeStyle = '#424754';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tOriginX, tOriginY);
      ctx.lineTo(tOriginX + tWidth, tOriginY);
      ctx.stroke();

      // Label Ticks
      ctx.fillStyle = '#64748b';
      ctx.font = '9px JetBrains Mono';
      for (let t = 0; t <= 10; t += 2) {
        const x = tOriginX + (t / 10) * tWidth;
        ctx.fillText(`${t}s`, x - 8, h - 10);
      }

      // 2. Draw Exponential Envelopes: ± e^(sigma * t)
      ctx.strokeStyle = 'rgba(74, 85, 104, 0.6)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.2;

      // Positive envelope
      ctx.beginPath();
      for (let t = 0; t <= 10; t += 0.05) {
        const envVal = Math.exp(sigma * t);
        const x = tOriginX + (t / 10) * tWidth;
        const y = tOriginY - envVal * yScale;
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Negative envelope
      ctx.beginPath();
      for (let t = 0; t <= 10; t += 0.05) {
        const envVal = -Math.exp(sigma * t);
        const x = tOriginX + (t / 10) * tWidth;
        const y = tOriginY - envVal * yScale;
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash state

      const stepsCount = 300;

      // 3. Draw Imaginary Curve (Sunset Orange: #ffb690)
      ctx.beginPath();
      ctx.strokeStyle = '#ffb690';
      ctx.lineWidth = 2;
      for (let i = 0; i <= stepsCount; i++) {
        const t = (i / stepsCount) * 10;
        const val = Math.exp(sigma * t) * Math.sin(omega * t);
        const x = tOriginX + (t / 10) * tWidth;
        const y = tOriginY - val * yScale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 4. Draw Real Curve (Electric Blue: #adc6ff)
      ctx.beginPath();
      ctx.strokeStyle = '#adc6ff';
      ctx.lineWidth = 2;
      for (let i = 0; i <= stepsCount; i++) {
        const t = (i / stepsCount) * 10;
        const val = Math.exp(sigma * t) * Math.cos(omega * t);
        const x = tOriginX + (t / 10) * tWidth;
        const y = tOriginY - val * yScale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 5. Draw Vertically aligned Current Time indicator
      const currentIndicatorX = tOriginX + (currentTime / 10) * tWidth;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(currentIndicatorX, 10);
      ctx.lineTo(currentIndicatorX, h - 25);
      ctx.stroke();

      // Target current real & imag points
      const currentRealVal = Math.exp(sigma * currentTime) * Math.cos(omega * currentTime);
      const currentImagVal = Math.exp(sigma * currentTime) * Math.sin(omega * currentTime);

      const rDotY = tOriginY - currentRealVal * yScale;
      const iDotY = tOriginY - currentImagVal * yScale;

      // Draw dot outlines for contrast
      ctx.lineWidth = 1.5;

      // Real dot (Electric Blue)
      ctx.fillStyle = '#adc6ff';
      ctx.strokeStyle = '#060e20';
      ctx.beginPath();
      ctx.arc(currentIndicatorX, rDotY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Imag dot (Sunset Orange)
      ctx.fillStyle = '#ffb690';
      ctx.strokeStyle = '#060e20';
      ctx.beginPath();
      ctx.arc(currentIndicatorX, iDotY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Live Readouts inside the graph
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Inter';
      ctx.fillText(`Real: ${currentRealVal.toFixed(2)}`, tOriginX + 5, 23);
      ctx.fillText(`Imag: ${currentImagVal.toFixed(2)}`, tOriginX + 5, 37);

      if (sigma > 0) {
        ctx.fillStyle = '#ef4444';
        ctx.fillText('⚡ Exponential Growth Output', w - 180, 23);
      } else if (sigma < 0) {
        ctx.fillStyle = '#4edea3';
        ctx.fillText('📉 Damped Decay Output', w - 140, 23);
      }
    };

    draw();

    return () => {
      resizeObserver.disconnect();
    };
  }, [sigma, omega, currentTime]);

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-col-resize">
      <canvas
        ref={canvasRef}
        className="block rounded bg-slate-950/40 select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        id="time-domain-canvas"
      />
      <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-slate-400 select-none pointer-events-none border border-slate-800">
        Drag/Click horizontally to slide time t
      </div>
    </div>
  );
};
