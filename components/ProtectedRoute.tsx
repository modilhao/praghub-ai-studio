import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'company' | 'consumer';
    redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole,
    redirectTo = '/login'
}) => {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background-dark text-white">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    <span>Carregando...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to={redirectTo} replace />;
    }

    if (requiredRole && profile?.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

