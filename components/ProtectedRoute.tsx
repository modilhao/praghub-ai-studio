import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/69870bc7-00ea-4f64-9298-033124960c3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H5',location:'components/ProtectedRoute.tsx:13',message:'protected_loading',data:{hasUser:!!user,allowedRoles:allowedRoles||null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        return (
            <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!user) {
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/69870bc7-00ea-4f64-9298-033124960c3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H5',location:'components/ProtectedRoute.tsx:21',message:'protected_no_user_redirect',data:{to:'/login'},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect based on role if unauthorized for this specific route
        if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
        if (user.role === 'COMPANY') return <Navigate to="/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
