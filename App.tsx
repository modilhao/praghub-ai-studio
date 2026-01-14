import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { Header, Footer } from './components/Shared';
import { Home } from './pages/Home';
import { CompanyProfile } from './pages/CompanyProfile';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';
import { CompanyDashboard } from './pages/CompanyDashboard';
import { NotFound } from './pages/NotFound';
import { Legal } from './pages/Legal';
import { ForgotPassword } from './pages/ForgotPassword';
import { LandingPartner } from './pages/LandingPartner';
import { LandingConsumer } from './pages/LandingConsumer';
import { Planos } from './pages/Planos';
import { ProtectedRoute } from './components/ProtectedRoute';

// Componente para tratar redirecionamento após autenticação
const AuthRedirectHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Aguardar até que o auth termine de carregar
        if (isLoading) return;

        // Se há um usuário logado
        if (user) {
            const currentPath = location.pathname;
            
            // Se está na rota /dashboard ou /admin, não fazer nada (já está na rota correta)
            if (currentPath === '/dashboard' || currentPath === '/admin') {
                return;
            }
            
            // Se está em /login ou /register e o usuário está logado, redirecionar
            if (currentPath === '/login' || currentPath === '/register') {
                if (user.role === 'ADMIN') {
                    navigate('/admin', { replace: true });
                } else if (user.role === 'COMPANY') {
                    navigate('/dashboard', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            }
        }
    }, [user, isLoading, location.pathname, navigate]);

    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<LandingPartner />} />
                <Route path="/company/:id" element={<CompanyProfile />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/terms" element={<Legal />} />
                <Route path="/privacy" element={<Legal />} />
                <Route path="/demonstracao" element={<Home />} />
                <Route path="/consumidores" element={<LandingConsumer />} />
                <Route path="/planos" element={<Planos />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                    <Route path="/admin" element={<Admin />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['COMPANY', 'ADMIN']} />}>
                    <Route path="/dashboard" element={<CompanyDashboard />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
        </>
    );
};

const AppWithAuth: React.FC = () => {
    return (
        <HashRouter>
            <AuthRedirectHandler>
                <AppRoutes />
            </AuthRedirectHandler>
        </HashRouter>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <SubscriptionProvider>
                <AppWithAuth />
            </SubscriptionProvider>
        </AuthProvider>
    );
};

export default App;