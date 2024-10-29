// src/store/usePhotoStore.ts
import { create } from 'zustand';

interface PhotoState {
  photo: string | null;
  setPhoto: (photo: string | null) => void;
}

export const usePhotoStore = create<PhotoState>((set) => ({
  photo: null,
  setPhoto: (photo) => set({ photo }),
}));
