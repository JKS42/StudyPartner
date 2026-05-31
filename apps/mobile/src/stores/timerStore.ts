import { create } from 'zustand';

export type TimerPhase = 'focus' | 'break' | 'idle';

interface TimerState {
  phase: TimerPhase;
  secondsLeft: number;
  isRunning: boolean;
  focusMinutes: number;
  breakMinutes: number;
  linkedNoteId: string | null;
  linkedDeckId: string | null;
  setLinked: (noteId: string | null, deckId?: string | null) => void;
  startFocus: () => void;
  startBreak: () => void;
  tick: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  phase: 'idle',
  secondsLeft: 25 * 60,
  isRunning: false,
  focusMinutes: 25,
  breakMinutes: 5,
  linkedNoteId: null,
  linkedDeckId: null,
  setLinked: (noteId, deckId = null) =>
    set({ linkedNoteId: noteId, linkedDeckId: deckId }),
  startFocus: () => {
    const { focusMinutes } = get();
    set({ phase: 'focus', secondsLeft: focusMinutes * 60, isRunning: true });
  },
  startBreak: () => {
    const { breakMinutes } = get();
    set({ phase: 'break', secondsLeft: breakMinutes * 60, isRunning: true });
  },
  tick: () => {
    const { secondsLeft, isRunning } = get();
    if (!isRunning || secondsLeft <= 0) return;
    set({ secondsLeft: secondsLeft - 1 });
  },
  pause: () => set({ isRunning: false }),
  resume: () => set({ isRunning: true }),
  reset: () =>
    set({
      phase: 'idle',
      secondsLeft: get().focusMinutes * 60,
      isRunning: false,
    }),
}));
