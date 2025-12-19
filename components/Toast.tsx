import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
    message, 
    type = 'info', 
    isVisible, 
    onClose, 
    duration = 4000 
}) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const typeStyles = {
        success: 'bg-green-500/10 border-green-500/20 text-green-400',
        error: 'bg-red-500/10 border-red-500/20 text-red-400',
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
    };

    const icons = {
        success: 'check_circle',
        error: 'error',
        info: 'info',
        warning: 'warning'
    };

    return (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 fade-in">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm ${typeStyles[type]} max-w-sm`}>
                <span className="material-symbols-outlined text-[20px]">{icons[type]}</span>
                <p className="text-sm font-medium flex-1">{message}</p>
                <button 
                    onClick={onClose}
                    className="text-current opacity-70 hover:opacity-100 transition-opacity"
                >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
            </div>
        </div>
    );
};

