import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Toast } from './Toast';

export const SessionNotification: React.FC = () => {
    const { sessionEvent } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (sessionEvent) {
            switch (sessionEvent) {
                case 'SIGNED_IN':
                    setMessage('Sessão iniciada com sucesso');
                    setIsVisible(true);
                    break;
                case 'SIGNED_OUT':
                    setMessage('Sessão encerrada');
                    setIsVisible(true);
                    break;
                case 'TOKEN_REFRESHED':
                    // Não mostrar notificação para refresh de token (muito frequente)
                    setIsVisible(false);
                    break;
                case 'USER_UPDATED':
                    setMessage('Perfil atualizado');
                    setIsVisible(true);
                    break;
                default:
                    setIsVisible(false);
            }
        }
    }, [sessionEvent]);

    const getToastType = (): 'success' | 'error' | 'info' | 'warning' => {
        switch (sessionEvent) {
            case 'SIGNED_IN':
            case 'USER_UPDATED':
                return 'success';
            case 'SIGNED_OUT':
                return 'info';
            default:
                return 'info';
        }
    };

    return (
        <Toast
            message={message}
            type={getToastType()}
            isVisible={isVisible}
            onClose={() => setIsVisible(false)}
            duration={3000}
        />
    );
};

