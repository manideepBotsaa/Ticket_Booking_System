import { create } from 'zustand';

export type AppStatus = 'idle' | 'booking' | 'pending' | 'confirmed' | 'failed';

interface BookingState {
  requestId: string | null;
  appStatus: AppStatus;
  setRequestId: (id: string | null) => void;
  setAppStatus: (status: AppStatus) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  requestId: null,
  appStatus: 'idle',
  setRequestId: (id) => set({ requestId: id }),
  setAppStatus: (status) => set({ appStatus: status }),
  reset: () => set({ requestId: null, appStatus: 'idle' }),
}));
