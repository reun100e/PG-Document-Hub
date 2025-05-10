// src/hooks/useToast.ts
import { toast as hotToast, type ToastOptions } from 'react-hot-toast';

export const useToast = () => {
    const toast = {
        success: (message: string, options?: ToastOptions) => hotToast.success(message, options),
        error: (message: string, options?: ToastOptions) => hotToast.error(message, options),
        info: (message: string, options?: ToastOptions) => hotToast(message, { icon: 'ℹ️', ...options }), // Custom icon for info
        loading: (message: string, options?: ToastOptions) => hotToast.loading(message, options),
        dismiss: (toastId?: string) => hotToast.dismiss(toastId),
    };
    return { toast };
};