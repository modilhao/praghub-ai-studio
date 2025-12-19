import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoHeader from '../logo-header.png';
import logoFooter from '../logo-footer.png';

export const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isAdmin = location.pathname.startsWith('/admin');
    if (isAdmin) return null;

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-card-border bg-background-dark/95 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                        <img src={logoHeader} alt="PragHub" className="h-10 w-auto" />
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <nav className="flex gap-6">
                            <Link to="/consumidores" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Para Clientes</Link>
                            <Link to="/parceiros" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Para Empresas</Link>
                        </nav>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-3 p-1 pr-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                                >
                                    <img src={user.picture} alt={user.name} className="size-8 rounded-full border border-primary/20" />
                                    <span className="text-sm font-bold text-white">{user.name?.split(' ')[0]}</span>
                                    <span className="material-symbols-outlined text-slate-500 text-[18px]">keyboard_arrow_down</span>
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-card-dark border border-card-border rounded-2xl shadow-2xl py-2 animate-in fade-in zoom-in-95">
                                        <div className="px-4 py-2 border-b border-card-border mb-2">
                                            <p className="text-xs text-slate-500 font-bold uppercase">Minha Conta</p>
                                        </div>
                                        {user.role === 'ADMIN' && (
                                            <Link to="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">
                                                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span> Painel Admin
                                            </Link>
                                        )}
                                        {user.role === 'COMPANY' && (
                                            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">
                                                <span className="material-symbols-outlined text-[18px]">dashboard</span> Dashboard
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">logout</span> Sair
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-slate-300 hover:text-white text-sm font-medium">Entrar</Link>
                                <Link to="/parceiros" className="bg-primary hover:bg-primary-hover text-white transition-all rounded-full h-9 px-5 text-sm font-bold flex items-center">
                                    Sou Empresa
                                </Link>
                            </div>
                        )}
                    </div>

                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden bg-card-dark border-t border-card-border p-4 flex flex-col gap-4">
                    <Link to="/consumidores" className="text-white block font-medium">Para Clientes</Link>
                    <Link to="/parceiros" className="text-white block font-medium">Para Empresas</Link>
                    {!user && <Link to="/login" className="text-white block font-medium">Entrar</Link>}
                    {user && (
                        <button onClick={handleLogout} className="text-red-400 block font-medium text-left">Sair</button>
                    )}
                </div>
            )}
        </header>
    );
};

export const Footer: React.FC = () => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');
    if (isAdmin) return null;

    return (
        <footer className="border-t border-card-border bg-background-dark mt-auto py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-white">
                    <img src={logoFooter} alt="PragHub" className="h-8 w-auto opacity-80" />
                </div>
                <p className="text-slate-500 text-sm">© 2024 PragHub. Todos os direitos reservados.</p>
            </div>
        </footer>
    );
};