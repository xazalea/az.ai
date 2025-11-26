declare global {
  interface Window {
    liquidGL?: (config: {
      snapshot?: string;
      target: string;
      resolution?: number;
      refraction?: number;
      bevelDepth?: number;
      bevelWidth?: number;
      frost?: number;
      shadow?: boolean;
      specular?: boolean;
      reveal?: string;
      tilt?: boolean;
      tiltFactor?: number;
      magnify?: number;
      on?: {
        init?: () => void;
      };
    }) => any;
    html2canvas?: any;
  }
}

export {};

