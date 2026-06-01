import type { GuitarString } from "$lib/types";

export type TunerState = {
  running: boolean;
  frequency: number;
  detectedString: string | null;
  centsByString: Record<string, number>;
  selectedString: string;
};

export type TunerEvents = {
  frequency: { frequency: number };

  match: {
    string: GuitarString;
    cents: number;
  };

  stableMatch: {
    string: GuitarString;
    cents: number;
  };

  state: {
    running: boolean;
  };
};
