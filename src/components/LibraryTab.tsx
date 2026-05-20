import React from 'react';
import { Preset } from '../types';
import { 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  ArrowRightLeft, 
  Minimize2, 
  HelpCircle,
  Zap
} from 'lucide-react';

interface LibraryTabProps {
  onSelectPreset: (sigma: number, omega: number) => void;
  activeSigma: number;
  activeOmega: number;
}

const PRESETS: Preset[] = [
  {
    id: 'damped-oscillation',
    name: 'Damped Oscillation',
    description: 'An oscillating signal that gradually decays over time. Represents real-world physical systems like a plucked guitar string, shock absorber, or pendulum subjected to friction.',
    sigma: -0.22,
    omega: 3.5,
    category: 'Stable',
    symbol: 'e^{-0.22t} \\cos(3.5t)',
  },
  {
    id: 'pure-sinusoid',
    name: 'Pure Sinusoid',
    description: 'Constant undamped oscillation with neutral stability. Perfect theoretical AC source, ideal wave generator, or standard electromagnetic carrier wave.',
    sigma: 0.00,
    omega: 4.5,
    category: 'Neutral',
    symbol: '\\cos(4.5t) + i\\sin(4.5t)',
  },
  {
    id: 'exponential-decay',
    name: 'Exponential Decay',
    description: 'A pure damping mechanism without rotation. Simulates passive capacitive discharging, radioactive nuclear decay, Newton\'s cooling law, or thermal dissipation.',
    sigma: -0.60,
    omega: 0.0,
    category: 'Stable',
    symbol: 'e^{-0.60t}',
  },
  {
    id: 'unstable-growth',
    name: 'Unstable Resonance',
    description: 'An oscillating wave that grows exponentially, drawing power from external sources. Models aeroelastic flutter in bridge suspension, laser excitation, or acoustic feedback.',
    sigma: 0.15,
    omega: 3.0,
    category: 'Unstable',
    symbol: 'e^{0.15t} \\cos(3.0t)',
  },
  {
    id: 'dc-steady',
    name: 'DC Steady State',
    description: 'Constant state with zero frequency and zero growth. Represents a battery baseline voltage, static structural support force, or zero-frequency baseline.',
    sigma: 0.00,
    omega: 0.0,
    category: 'Neutral',
    symbol: 's = 0',
  },
  {
    id: 'explosive-growth',
    name: 'Pure Exponential Growth',
    description: 'Fast non-rotating exponential rise. Simulates nuclear fission chain reactions, uncontrolled chemical combustion, or initial viral epidemic reproduction steps.',
    sigma: 0.40,
    omega: 0.0,
    category: 'Unstable',
    symbol: 'e^{0.40t}',
  },
  {
    id: 'high-freq-ringing',
    name: 'High Frequency Ringing',
    description: 'Rapid rotation speed with small decay. Simulates transient sparks, quartz crystal clock resonances, acoustic whistles, or piezo ringers.',
    sigma: -0.10,
    omega: 8.5,
    category: 'Stable',
    symbol: 'e^{-0.10t} \\cos(8.5t)',
  }
];

export const LibraryTab: React.FC<LibraryTabProps> = ({
  onSelectPreset,
  activeSigma,
  activeOmega,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
          <Activity className="text-blue-400 w-5 h-5" />
          Eigenvalue & Wave Preset Library
        </h2>
        <p className="text-slate-400 text-sm">
          Select standard mathematical formulations of the complex exponential to see how setting corresponding poles $s = \sigma + i\omega$ alters the physical system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRESETS.map((preset) => {
          const isSelected = activeSigma === preset.sigma && activeOmega === preset.omega;
          
          // Select theme based on category
          const badgeColors = {
            Stable: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            Neutral: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            Unstable: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          }[preset.category];

          const categoryIcons = {
            Stable: <TrendingDown className="w-4 h-4 text-emerald-400" />,
            Neutral: <ArrowRightLeft className="w-4 h-4 text-blue-400" />,
            Unstable: <TrendingUp className="w-4 h-4 text-rose-400" />,
          }[preset.category];

          return (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset.sigma, preset.omega)}
              className={`group flex flex-col justify-between p-5 rounded border bg-slate-900/60 hover:bg-slate-800/60 cursor-pointer transition-all duration-200 select-none ${
                isSelected 
                  ? 'border-blue-400 ring-2 ring-blue-400/20 bg-slate-800' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-sm text-slate-100 group-hover:text-blue-300 transition-colors">
                    {preset.name}
                  </h3>
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${badgeColors} flex items-center gap-1`}>
                    {categoryIcons}
                    {preset.category}
                  </span>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded font-serif text-center text-xs text-blue-200/90 border border-slate-900 leading-relaxed tracking-wider select-text">
                  y(t) = {preset.symbol}
                </div>

                <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                  {preset.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-950 flex justify-between items-center text-[11px] font-mono">
                <div className="flex gap-3 text-slate-400">
                  <span>σ = <strong className="text-slate-100">{preset.sigma.toFixed(2)}</strong></span>
                  <span>ω = <strong className="text-slate-100">{preset.omega.toFixed(2)}</strong></span>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                  isSelected 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'bg-slate-950 text-slate-400 group-hover:bg-blue-500 group-hover:text-white'
                }`}>
                  {isSelected ? 'Active Now' : 'Apply Preset'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-slate-900/20 border border-slate-800/80 p-5 rounded-lg flex gap-4 items-start">
        <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <h4 className="font-medium text-xs text-slate-200">How stability relates to the pole coordinates:</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            - When <strong>Real Part (σ) &lt; 0 (Left-Half Plane)</strong>: The envelope shrinks exponentially. The system dissipates heat or energy, making it <strong>Stable</strong>.
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            - When <strong>Real Part (σ) = 0 (Imaginary Axis)</strong>: The wave maintains constant magnitude. The energy is perfectly preserved, making it <strong>Neutrally Stable</strong>.
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            - When <strong>Real Part (σ) &gt; 0 (Right-Half Plane)</strong>: The amplitude expands exponentially and bounds off to infinity. The system receives continuous energy feed, making it <strong>Unstable</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
