import { create } from "zustand";

interface TakerStoreState {
  testId: string | null;
  setTestId: (id: string) => void;
}

export const useTakerStore = create<TakerStoreState>((set) => ({
  testId: null, // 초기값 설정
  setTestId: (id) => set({ testId: id }), // 시험 ID 설정 메서드
}));