export interface SystemParams {
  sigma: number;      // Damping factor / real part
  omega: number;      // Frequency / imaginary part
  time: number;       // Current simulation time [0, 10]
  isPlaying: boolean; // Animation state
  playSpeed: number;  // Speed multiplier
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  sigma: number;
  omega: number;
  category: 'Stable' | 'Neutral' | 'Unstable';
  symbol: string;
}

export interface TrajectoryPoint {
  t: number;
  real: number;
  imag: number;
}
