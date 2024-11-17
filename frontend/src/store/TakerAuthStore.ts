import { create } from "zustand";

interface TakerStoreState {
  testId: string | null;
  setTestId: (id: string) => void;
  birth: string;
  setBirth: (birth: string) => void;
}

export const useTakerStore = create<TakerStoreState>((set) => ({
  testId: null,
  setTestId: (id) => set({ testId: id }),
  birth: "",
  setBirth: (birth) => set({ birth }),
}));
