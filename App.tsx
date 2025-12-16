import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
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

import { LandingConsumer } from './pages/LandingConsumer';
import { LandingPartner } from './pages/LandingPartner';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './src/contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SessionNotification } from './components/SessionNotification';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <HashRouter>
                <ScrollToTop />
                <SessionNotification />
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/sou-cliente" element={<LandingConsumer />} />
                    <Route path="/sou-parceiro" element={<LandingPartner />} />
                    <Route path="/company/:id" element={<CompanyProfile />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route 
                        path="/admin" 
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <Admin />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute requiredRole="company">
                                <CompanyDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route path="/terms" element={<Legal />} />
                    <Route path="/privacy" element={<Legal />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />
            </HashRouter>
        </AuthProvider>
    );
};

export default App;