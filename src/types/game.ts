export type DestinationId = 'about' | 'skills' | 'projects' | 'experience' | 'contact';

export interface Destination {
  id: DestinationId;
  index: number; // 0 to 4
  title: string;
  subtitle: string;
  description: string;
  roadDistance: number; // T value along the road spline (0.0 to 1.0)
  position: [number, number, number];
  color: string;
  iconName: string;
}

export interface CyclistState {
  x: number;
  y: number;
  z: number;
  speed: number;
  maxSpeed: number;
  rotationY: number;
  steerAngle: number;
  pedalRotation: number;
  wheelRotation: number;
  isMoving: boolean;
  isNitro: boolean;
  distanceTraveled: number;
  currentRoadT: number;
}

export interface GameControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
  brake: boolean;
  nitro: boolean;
}

export type ViewMode = 'game' | 'recruiter';
