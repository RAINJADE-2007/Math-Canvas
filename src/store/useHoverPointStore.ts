import { create } from "zustand";

export interface HoverValue {
  id: string;
  label: string;
  color: string;
  value: number;
  valid: boolean;
  derivative?: number;
  derivativeValid: boolean;
}

export interface HoverPointData {
  x: number;
  y: number;
  values: HoverValue[];
}

interface HoverPointState {
  data: HoverPointData | null;
  setData: (data: HoverPointData | null) => void;
}

export const useHoverPointStore = create<HoverPointState>((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));
