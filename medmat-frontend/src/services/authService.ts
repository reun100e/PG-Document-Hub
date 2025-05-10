import apiClient from './api';
import type { AuthResponse, User, SimpleUser } from '../types';
import { useAuthStore } from '../store/authStore';

interface LoginCredentials {
    username: string; // This will be the selected doctor's name
    password: string;
}

// Fetch usernames for the login dropdown
export const fetchUsernamesForLogin = async (): Promise<SimpleUser[]> => {
    try {
        const response = await apiClient.get<SimpleUser[]>('/auth/usernames/');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch usernames:", error);
        throw error; // Re-throw to be handled by the component
    }
};

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { setLoading, setError } = useAuthStore.getState();
    setLoading(true);
    setError(null);
    try {
        const response = await apiClient.post<AuthResponse>('/auth/login/', credentials);
        // setLoading(false); // Login in authStore will set loading to false
        return response.data; // The login action in authStore will handle setting user, token, etc.
    } catch (error: any) {
        setLoading(false);
        const errorMessage = error.response?.data?.detail || // Backend's custom error
            error.response?.data?.non_field_errors?.[0] ||
            'Login failed. Please check credentials.';
        setError(errorMessage);
        throw error;
    }
};

// fetchCurrentUser remains the same
export const fetchCurrentUser = async (): Promise<void> => {
    const { setUser, setLoading, setError, token, logout, isAuthenticated } = useAuthStore.getState();
    if (!token) {
        if (isAuthenticated) logout(); // If somehow isAuthenticated is true but no token
        return;
    }
    setLoading(true);
    setError(null);
    try {
        const response = await apiClient.get<User>('/users/me/'); // Updated path based on router
        setUser(response.data);
        // setLoading(false); // setUser should ideally handle this or it's handled in the store action
    } catch (error: any) {
        // setLoading(false);
        setError('Failed to fetch user details.');
        console.error("Fetch current user failed:", error);
        logout();
    } finally {
        setLoading(false); // Ensure loading is always set to false
    }
};