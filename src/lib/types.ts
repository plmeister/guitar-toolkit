export type StringMatch = {
  string: GuitarString;
  cents: number;
  frequency: number;
};

export type GuitarString = {
  name: string;
  frequency: number;
};

export type Tuning = {
  name: string;
  strings: GuitarString[];
};
