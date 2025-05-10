import { useAuthStore } from '../store/authStore';
// You can add more complex logic here if needed,
// but for basic access, directly using the store is often fine.

export const useAuth = () => {
    const {
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        setUser,
        setLoading,
        setError,
        fetchAndUpdateUser,
    } = useAuthStore();

    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        setUser,
        setLoading,
        setError,
        fetchAndUpdateUser,
    };
};