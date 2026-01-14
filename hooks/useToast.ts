import { useState, useCallback } from 'react';

export interface ToastState {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    isVisible: boolean;
}

export const useToast = () => {
    const [toast, setToast] = useState<ToastState>({
        message: '',
        type: 'info',
        isVisible: false
    });

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        setToast({
            message,
            type,
            isVisible: true
        });
    }, []);

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, isVisible: false }));
    }, []);

    return {
        showToast,
        hideToast,
        toast
    };
};
