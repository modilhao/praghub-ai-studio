import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
import { ProtectedRoute } from './components/ProtectedRoute';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <HashRouter>
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
            </HashRouter>
        </AuthProvider>
    );
};

export default App;