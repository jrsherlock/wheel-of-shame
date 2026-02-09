
export interface Punishment {
  id: string;
  title: string;
  description: string;
  color: string;
}

export interface WheelConfig {
  spinDuration: number;
  slowdownDuration: number;
  forceResultId: string | null; // ID of the punishment to force
  isRigged: boolean;
}

export interface SpinResult {
  punishment: Punishment;
  timestamp: string;
}
