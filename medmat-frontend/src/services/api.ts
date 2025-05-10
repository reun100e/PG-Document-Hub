import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const apiClient = axios.create({
    baseURL: '/api', // Proxied to Django dev server or actual API base in prod
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor to add token
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor (optional, e.g., for handling 401 errors globally)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token might be invalid or expired
            useAuthStore.getState().logout(); // Clear auth state
            // Optionally redirect to login
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default apiClient;