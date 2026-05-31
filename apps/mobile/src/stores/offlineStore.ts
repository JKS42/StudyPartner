import { create } from 'zustand';

export interface OfflineMutation {
  id: string;
  type: 'note_create' | 'note_update' | 'session_log';
  payload: Record<string, unknown>;
  createdAt: string;
}

interface OfflineState {
  queue: OfflineMutation[];
  isOnline: boolean;
  addMutation: (mutation: Omit<OfflineMutation, 'createdAt'>) => void;
  removeMutation: (id: string) => void;
  setOnline: (online: boolean) => void;
  clearQueue: () => void;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  queue: [],
  isOnline: true,
  addMutation: (mutation) =>
    set((state) => ({
      queue: [
        ...state.queue,
        { ...mutation, createdAt: new Date().toISOString() },
      ],
    })),
  removeMutation: (id) =>
    set((state) => ({
      queue: state.queue.filter((m) => m.id !== id),
    })),
  setOnline: (isOnline) => set({ isOnline }),
  clearQueue: () => set({ queue: [] }),
}));
