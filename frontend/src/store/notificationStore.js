import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      // Set of notification ids the user has dismissed / read
      readIds: new Set(),

      markRead: (id) =>
        set((state) => ({ readIds: new Set([...state.readIds, id]) })),

      markAllRead: (ids) =>
        set((state) => ({ readIds: new Set([...state.readIds, ...ids]) })),

      clearAll: () => set({ readIds: new Set() }),
    }),
    {
      name: 'notifications-read',
      // Serialize Set to array for localStorage
      storage: {
        getItem: (key) => {
          const raw = localStorage.getItem(key);
          if (!raw) return null;
          const parsed = JSON.parse(raw);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              readIds: new Set(parsed.state?.readIds || []),
            },
          };
        },
        setItem: (key, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              readIds: [...(value.state?.readIds || [])],
            },
          };
          localStorage.setItem(key, JSON.stringify(toStore));
        },
        removeItem: (key) => localStorage.removeItem(key),
      },
    }
  )
);
