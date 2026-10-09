import { create } from 'zustand';
import { registerSessionListener, refreshSession, setAccessToken } from '@/services/api';
import { authService } from '@/services';

export const useAuthStore = create((set) => ({
  user: null,
  status: 'idle', // idle → loading → ready

  // Restores the session from the refresh cookie on first load.
  bootstrap: async () => {
    set({ status: 'loading' });
    try {
      await refreshSession();
    } catch {
      // not logged in
    }
    set({ status: 'ready' });
  },

  login: async (credentials) => {
    const { accessToken, user } = await authService.login(credentials);
    setAccessToken(accessToken);
    set({ user, status: 'ready' });
    return user;
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      setAccessToken(null);
      set({ user: null });
    }
  },

  setUser: (user) => set({ user }),
}));

registerSessionListener((user) => useAuthStore.setState({ user }));
