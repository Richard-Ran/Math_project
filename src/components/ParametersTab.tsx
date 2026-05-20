import React, { useState } from 'react';
import { 
  Sliders, 
  Settings, 
  ChevronRight, 
  RotateCcw,
  Binary,
  Table,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface ParametersTabProps {
  sigma: number;
  omega: number;
  trajectoryLimit: number;
  setTrajectoryLimit: (limit: number) => void;
  onChangeParams: (sigma: number, omega: number) => void;
  playSpeed: number;
  setPlaySpeed: (speed: number) => void;
  onClearTrajectory: () => void;
}

export const ParametersTab: React.FC<ParametersTabProps> = ({
  sigma,
  omega,
  trajectoryLimit,
  setTrajectoryLimit,
  onChangeParams,
  playSpeed,
  setPlaySpeed,
  onClearTrajectory,
}) => {
  const [sigmaInput, setSigmaInput] = useState<string>(sigma.toString());
  const [omegaInput, setOmegaInput] = useState<string>(omega.toString());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleApplyPrecisionNumeric = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSigma = parseFloat(sigmaInput);
    const parsedOmega = parseFloat(omegaInput);

    if (isNaN(parsedSigma) || isNaN(parsedOmega)) {
      setErrorMessage('Please feed valid floating-point numbers.');
      return;
    }

    if (parsedSigma < -2.0 || parsedSigma > 1.0) {
      setErrorMessage('Real part (σ) must be between -2.000 and 1.000.');
      return;
    }

    if (parsedOmega < 0.0 || parsedOmega > 10.0) {
      setErrorMessage('Imaginary part (ω) must be between 0.000 and 10.000.');
      return;
    }

    setErrorMessage(null);
    onChangeParams(parsedSigma, parsedOmega);
  };

  // Pre-generate simulated coordinate values for preview table
  const sampleRates = Array.from({ length: 11 }, (_, i) => i); // [0..10]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
          <Sliders className="text-emerald-400 w-5 h-5" />
          Advanced Parameter Calibration
        </h2>
        <p className="text-slate-400 text-sm">
          Fine-tune input coefficients, simulation speed multiplier, trail trajectory depth limit, or inspect the generated coordinate table at discrete intervals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fine Tuning Controllers */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <form onSubmit={handleApplyPrecisionNumeric} className="bg-slate-900/40 border border-slate-800 rounded-lg p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Binary className="w-4 h-4 text-emerald-400" />
              Keyboard Precision Input
            </h3>

            {errorMessage && (
              <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs p-3 rounded">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400 flex justify-between">
                <span>Real Part Stability Factor (σ)</span>
                <span className="text-slate-500 font-mono">[-2.0 to 1.0]</span>
              </label>
              <input
                type="number"
                step="0.001"
                min="-2.0"
                max="1.0"
                value={sigmaInput}
                onChange={(e) => setSigmaInput(e.target.value)}
                className="w-full text-slate-100 font-mono bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400 flex justify-between">
                <span>Imaginary Part Rotation Frequency (ω)</span>
                <span className="text-slate-500 font-mono">[0.0 to 10.0]</span>
              </label>
              <input
                type="number"
                step="0.001"
                min="0.0"
                max="10.0"
                value={omegaInput}
                onChange={(e) => setOmegaInput(e.target.value)}
                className="w-full text-slate-100 font-mono bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded font-medium text-xs transition-all active:scale-[0.98]"
            >
              Calibrate Numerical Coefficients
            </button>
          </form>

          {/* Engine Parameters */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Settings className="w-4 h-4 text-blue-400" />
              Engine Configuration
            </h3>

            {/* Trajectory Trail Limit */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 justify-between flex">
                <span>Trajectory Trail Depth</span>
                <span className="font-mono text-blue-300">{trajectoryLimit} nodes</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[100, 200, 500, 1000].map((limit) => (
                  <button
                    key={limit}
                    onClick={() => setTrajectoryLimit(limit)}
                    className={`py-1.5 rounded text-xs px-2 select-none border transition-all font-mono font-medium ${
                      trajectoryLimit === limit
                        ? 'bg-blue-500/20 text-blue-300 border-blue-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {limit}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Playback Speed */}
            <div className="flex flex-col gap-2 mt-1">
              <label className="text-xs font-semibold text-slate-400 justify-between flex">
                <span>Time Multiplier Speed</span>
                <span className="font-mono text-emerald-400">{playSpeed}x speed</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[0.25, 0.5, 1.0, 2.0].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => setPlaySpeed(speed)}
                    className={`py-1.5 rounded text-xs px-2 select-none border transition-all font-mono font-medium ${
                      playSpeed === speed
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 border-t border-slate-950 flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setSigmaInput('0.00');
                  setOmegaInput('2.00');
                  onChangeParams(0.00, 2.00);
                  setErrorMessage(null);
                }}
                className="flex-grow flex items-center justify-center gap-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 font-medium font-sans text-xs py-2 rounded transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Controls
              </button>
              <button
                type="button"
                onClick={onClearTrajectory}
                className="flex-grow flex items-center justify-center gap-1.5 bg-slate-950 border border-slate-800 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 font-medium font-sans text-xs py-2 rounded transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Trail
              </button>
            </div>
          </div>
        </div>

        {/* Value Preview Table */}
        <div className="lg:col-span-7 border border-slate-800 bg-slate-900/40 rounded-lg p-5 flex flex-col gap-4">
          <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Table className="w-4 h-4 text-blue-400" />
            Value Preview Table (Discrete Sim Taps)
          </h3>

          <div className="overflow-x-auto select-text">
            <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 text-[10px] uppercase font-semibold">
                <tr>
                  <th className="py-2 px-3 border-b border-slate-800 rounded-tl">Time (t)</th>
                  <th className="py-2 px-3 border-b border-slate-800 font-serif font-semibold">Real e^(σt)cos(ωt)</th>
                  <th className="py-2 px-3 border-b border-slate-800 font-serif font-semibold">Imag e^(σt)sin(ωt)</th>
                  <th className="py-2 px-3 border-b border-slate-800 rounded-tr">Magnitude</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {sampleRates.map((t) => {
                  const amp = Math.exp(sigma * t);
                  const real = amp * Math.cos(omega * t);
                  const imag = amp * Math.sin(omega * t);

                  return (
                    <tr key={t} className="hover:bg-slate-800/20 transition-all">
                      <td className="py-1.5 px-3 border-b border-slate-805/50 font-sans font-medium text-slate-400">
                        {t}.0s
                      </td>
                      <td className={real >= 0 ? 'py-1.5 px-3 border-b border-slate-805/50 text-blue-300' : 'py-1.5 px-3 border-b border-slate-805/50 text-indigo-400'}>
                        {real.toFixed(4)}
                      </td>
                      <td className={imag >= 0 ? 'py-1.5 px-3 border-b border-slate-805/50 text-amber-300' : 'py-1.5 px-3 border-b border-slate-805/50 text-orange-400'}>
                        {imag.toFixed(4)}
                      </td>
                      <td className="py-1.5 px-3 border-b border-slate-805/50 text-emerald-400">
                        {amp.toFixed(4)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-950/40 p-2.5 rounded border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>These tabular values are calculated analytically on the spot for reference. Dragging parameters will automatically reflect here.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
