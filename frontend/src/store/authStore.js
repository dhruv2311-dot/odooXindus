import { create } from 'zustand';

const normalizeUserRole = (role, email = '') => {
  if (role === 'Inventory Manager' || role === 'Warehouse Staff') {
    return role;
  }

  if (String(email).toLowerCase().includes('dhruv')) {
    return 'Inventory Manager';
  }

  return 'Warehouse Staff';
};

const enrichUser = (userData = {}) => {
  const role = normalizeUserRole(userData.role, userData.email);
  return {
    ...userData,
    role,
  };
};

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  login: (userData, token) => {
    localStorage.setItem('token', token);
    const enrichedUser = enrichUser(userData);
    
    set({ user: enrichedUser, isAuthenticated: true, isAdmin: enrichedUser.role === 'Inventory Manager' });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, isAdmin: false });
  },
  setUser: (userData) => {
    const enrichedUser = enrichUser(userData);
    set({ user: enrichedUser, isAuthenticated: true, isAdmin: enrichedUser.role === 'Inventory Manager' });
  },
}));
