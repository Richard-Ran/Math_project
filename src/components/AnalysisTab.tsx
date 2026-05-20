import React, { useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Flame, 
  Activity, 
  Hash, 
  RotateCw, 
  TrendingDown, 
  Lightbulb 
} from 'lucide-react';

interface AnalysisTabProps {
  sigma: number;
  omega: number;
  currentTime: number;
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({
  sigma,
  omega,
  currentTime,
}) => {
  const phaseCanvasRef = useRef<HTMLCanvasElement>(null);

  // Math derivations
  const period = omega > 0 ? (2 * Math.PI / omega) : Infinity;
  const frequency = omega > 0 ? (omega / (2 * Math.PI)) : 0;
  const timeConstant = Math.abs(sigma) > 0 ? (1 / Math.abs(sigma)) : Infinity;
  const growthFactor = Math.exp(sigma);

  // Status mapping
  let stabilityStatus = 'Neutrally Stable';
  let stabilityColor = 'text-blue-400 border-blue-500/20 bg-blue-500/5';
  let stabilityBanner = 'border-blue-500/30 bg-blue-500/10';
  let stabilityIcon = <Activity className="w-5 h-5 text-blue-400" />;
  let stabilityDesc = 'The system oscillates continuously at constant amplitude. Energy is perfectly preserved.';

  if (sigma < 0) {
    stabilityStatus = 'Asymptotically Stable';
    stabilityColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    stabilityBanner = 'border-emerald-500/30 bg-emerald-500/10';
    stabilityIcon = <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    stabilityDesc = 'The response decays exponentially back to zero equilibrium. Energy dissipates continuously.';
  } else if (sigma > 0) {
    stabilityStatus = 'Dynamically Unstable';
    stabilityColor = 'text-rose-400 border-rose-500/20 bg-rose-500/5';
    stabilityBanner = 'border-rose-500/30 bg-rose-500/10';
    stabilityIcon = <Flame className="w-5 h-5 text-rose-400" />;
    stabilityDesc = 'The system response diverges rapidly to infinity. Constant external power feeding makes it hyper-reactive.';
  }

  // Draw Phase Space Portrait (y vs dy/dt)
  useEffect(() => {
    const canvas = phaseCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleDpr = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight || 260;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    };

    scaleDpr();

    // Reconstruct drawing
    const drawPhase = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2;

      // Draw Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Grid lines
      const step = 20;
      for (let x = step; x < w; x += step) {
        ctx.moveTo(x, 0); ctx.lineTo(x, h);
      }
      for (let y = step; y < h; y += step) {
        ctx.moveTo(0, y); ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Main Axes
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, centerY); ctx.lineTo(w, centerY);
      ctx.moveTo(centerX, 0); ctx.lineTo(centerX, h);
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#64748b';
      ctx.font = '9px JetBrains Mono';
      ctx.fillText('y(t) [Displacement]', w - 110, centerY - 8);
      ctx.fillText('v(t) = dy/dt [Velocity]', centerX + 8, 16);

      // Simulation details
      // Calculate max boundary over 10 seconds to scale properly
      let maxVal = 1.0;
      for (let t = 0; t <= 10; t += 0.05) {
        const y = Math.exp(sigma * t) * Math.cos(omega * t);
        const v = sigma * Math.exp(sigma * t) * Math.cos(omega * t) - omega * Math.exp(sigma * t) * Math.sin(omega * t);
        maxVal = Math.max(maxVal, Math.abs(y), Math.abs(v));
      }

      // Avoid division by zero
      if (maxVal === 0) maxVal = 1.0;
      const graphScale = (Math.min(w, h) / 2.3) / maxVal;

      // Trace full phase path from t = 0 to 10
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(78, 222, 163, 0.75)'; // Emerald
      ctx.lineWidth = 2;
      
      let plottedCount = 0;
      for (let t = 0; t <= 10; t += 0.02) {
        const yVal = Math.exp(sigma * t) * Math.cos(omega * t);
        const vVal = sigma * Math.exp(sigma * t) * Math.cos(omega * t) - omega * Math.exp(sigma * t) * Math.sin(omega * t);

        const screenX = centerX + yVal * graphScale;
        const screenY = centerY - vVal * graphScale; // invert velocity direction because canvas y goes down

        if (plottedCount === 0) {
          ctx.moveTo(screenX, screenY);
        } else {
          ctx.lineTo(screenX, screenY);
        }
        plottedCount++;
      }
      ctx.stroke();

      // Draw current state dot in orange
      const currY = Math.exp(sigma * currentTime) * Math.cos(omega * currentTime);
      const currV = sigma * Math.exp(sigma * currentTime) * Math.cos(omega * currentTime) - omega * Math.exp(sigma * currentTime) * Math.sin(omega * currentTime);
      
      const currScreenX = centerX + currY * graphScale;
      const currScreenY = centerY - currV * graphScale;

      ctx.fillStyle = '#ffb690';
      ctx.strokeStyle = '#060e20';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(currScreenX, currScreenY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw standard starting point dot
      ctx.fillStyle = '#adc6ff';
      ctx.beginPath();
      ctx.arc(centerX + 1.0 * graphScale, centerY - sigma * graphScale, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Add a small start text
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px Inter';
      ctx.fillText('Start (t=0)', centerX + 1.0 * graphScale + 8, centerY - sigma * graphScale + 12);
    };

    drawPhase();

    // Resize handling
    const resizeHandler = () => {
      scaleDpr();
      drawPhase();
    };
    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [sigma, omega, currentTime]);

  return (
    <div className="flex flex-col gap-6">
      {/* Real-time Stability Overview Card */}
      <div className={`p-5 rounded border ${stabilityBanner} flex flex-col md:flex-row gap-4 items-start md:items-center justify-between`}>
        <div className="flex gap-4 items-center">
          <div className="p-3 bg-slate-950/60 rounded-lg shrink-0">
            {stabilityIcon}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-slate-400">System Stability</span>
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${stabilityColor}`}>
                {stabilityStatus}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-100 italic">
              {sigma < 0 ? 'Negative Real Part' : sigma === 0 ? 'Zero Real Part' : 'Positive Real Part'} (σ = {sigma.toFixed(2)})
            </p>
            <p className="text-xs text-slate-400 max-w-xl">
              {stabilityDesc}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phase Space Portrait Visualizer */}
        <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-5 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-semibold text-sm text-slate-200">Phase Space Portrait</h3>
              <p className="text-xs text-slate-400">displacement y(t) plotted against velocity v(t)</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              State Attractor
            </span>
          </div>

          <div className="bg-[#0F172A] rounded overflow-hidden aspect-video relative flex-grow min-h-[220px]">
            <canvas ref={phaseCanvasRef} className="w-full h-full" />
            <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-slate-400 border border-slate-800">
              {sigma < 0 ? 'Spiral Sink (Stable)' : sigma === 0 ? 'Elliptic Center (Preserved)' : 'Spiral Source (Unstable)'}
            </div>
          </div>
        </div>

        {/* Analytics Properties Table */}
        <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-5 flex flex-col gap-3">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-sm text-slate-200">Eigenvalue Properties</h3>
            <p className="text-xs text-slate-400">Mathematical characteristics of your custom formulation</p>
          </div>

          <div className="flex flex-col gap-3 flex-grow justify-center py-2">
            {/* Row 1 */}
            <div className="flex justify-between items-center p-2 rounded hover:bg-slate-800/30 transition-all font-mono text-xs border border-transparent hover:border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                <Hash className="w-4 h-4 text-slate-500" />
                Eigenvalue Formula (s)
              </span>
              <span className="text-slate-100 font-semibold font-serif">
                {sigma.toFixed(2)} + {omega.toFixed(2)}j rad/s
              </span>
            </div>

            {/* Row 2 */}
            <div className="flex justify-between items-center p-2 rounded hover:bg-slate-800/30 transition-all font-mono text-xs border border-transparent hover:border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                <RotateCw className="w-4 h-4 text-slate-400" />
                Angular Frequency (ω)
              </span>
              <span className="text-blue-300">
                {omega.toFixed(2)} rad/s
              </span>
            </div>

            {/* Row 3 */}
            <div className="flex justify-between items-center p-2 rounded hover:bg-slate-800/30 transition-all font-mono text-xs border border-transparent hover:border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                <Activity className="w-4 h-4 text-blue-400" />
                Damping Ratio (ζ)
              </span>
              <span className={sigma === 0 ? 'text-slate-400' : sigma < 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {sigma === 0 && omega === 0 
                  ? 'Critically Damped (1.00)' 
                  : sigma === 0 
                    ? 'Undamped (0.00)' 
                    : `${(-sigma / Math.sqrt(sigma*sigma + omega*omega)).toFixed(3)}`
                }
              </span>
            </div>

            {/* Row 4 */}
            <div className="flex justify-between items-center p-2 rounded hover:bg-slate-800/30 transition-all font-mono text-xs border border-transparent hover:border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                <RotateCw className="w-4 h-4 text-rose-400" />
                Period (T = 2π/ω)
              </span>
              <span className="text-slate-200">
                {omega > 0 ? `${period.toFixed(3)}s` : '∞ (Infinite / DC)'}
              </span>
            </div>

            {/* Row 5 */}
            <div className="flex justify-between items-center p-2 rounded hover:bg-slate-800/30 transition-all font-mono text-xs border border-transparent hover:border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                <Hash className="w-4 h-4 text-indigo-400" />
                Linear Cyclic Freq (f)
              </span>
              <span className="text-slate-200">
                {omega > 0 ? `${frequency.toFixed(3)} Hz` : '0 Hz (Static)'}
              </span>
            </div>

            {/* Row 6 */}
            <div className="flex justify-between items-center p-2 rounded hover:bg-slate-800/30 transition-all font-mono text-xs border border-transparent hover:border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                Time Constant (τ = 1/|σ|)
              </span>
              <span className="text-slate-200">
                {Math.abs(sigma) > 0 ? `${timeConstant.toFixed(3)}s` : '∞ (No Decay)'}
              </span>
            </div>

            {/* Row 7 */}
            <div className="flex justify-between items-center p-2 rounded hover:bg-slate-800/30 transition-all font-mono text-xs border border-transparent hover:border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                <Hash className="w-4 h-4 text-amber-500" />
                Log Decrement (δ)
              </span>
              <span className="text-slate-200 font-mono">
                {omega > 0 ? `${(2 * Math.PI * Math.abs(sigma) / omega).toFixed(3)}` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 bg-slate-900/60 rounded p-4 border border-slate-800 flex gap-3 text-xs text-slate-400 leading-normal">
        <Lightbulb className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong>Phase Space Interpretation:</strong> Think of the phase plot as mapping the total energy cycle. A perfect circle or oval shows infinite harmonic power recycling (0 damping). An inward spiral indicates energy conversion (friction, electrical resistance). An outward spiral represents active feeding from self-excitation, causing amplification mechanisms.
        </div>
      </div>
    </div>
  );
};
