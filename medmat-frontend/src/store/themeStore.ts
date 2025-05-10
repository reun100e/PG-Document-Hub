import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light',
            setTheme: (theme) => {
                set({ theme });
                document.documentElement.classList.toggle('dark', theme === 'dark');
            },
            toggleTheme: () => {
                const newTheme = get().theme === 'light' ? 'dark' : 'light';
                set({ theme: newTheme });
                document.documentElement.classList.toggle('dark', newTheme === 'dark');
            },
        }),
        {
            name: 'theme-storage', // unique name for localStorage key
            onRehydrateStorage: () => (state) => { // Apply theme on rehydration
                if (state) {
                    document.documentElement.classList.toggle('dark', state.theme === 'dark');
                }
            }
        }
    )
);

// Initialize theme on load (if not handled by onRehydrateStorage adequately for initial load)
const initialTheme = useThemeStore.getState().theme;
document.documentElement.classList.toggle('dark', initialTheme === 'dark');