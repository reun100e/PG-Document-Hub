import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, AuthResponse } from '../types'

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (userData: AuthResponse) => void;
    logout: () => void;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    fetchAndUpdateUser: (updatedUser: User) => void; // For updating user profile details
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            login: (userData) => {
                set({
                    user: userData.user,
                    token: userData.token,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });
            },
            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null,
                });
                // Consider also clearing other app-specific cached data if needed
            },
            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),
            setLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ error, isLoading: false }),
            fetchAndUpdateUser: (updatedUser) => {
                set((state) => ({
                    ...state,
                    user: updatedUser,
                }));
            }
        }),
        {
            name: 'auth-storage', // localStorage key
            storage: createJSONStorage(() => localStorage), // Default is localStorage
        }
    )
);