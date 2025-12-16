import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';

export const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, profile, signOut } = useAuth();
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Resetar erro de avatar quando avatar mudar
    useEffect(() => {
        setAvatarError(false);
    }, [user, profile]);

    // Fechar menu de usuário ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        if (isUserMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserMenuOpen]);

    const handleLogout = async () => {
        try {
            await signOut();
            setIsUserMenuOpen(false);
            navigate('/');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            // Mesmo com erro, tentar navegar
            setIsUserMenuOpen(false);
            navigate('/');
        }
    };

    const getDashboardLink = () => {
        if (profile?.role === 'admin') return '/admin';
        if (profile?.role === 'company') return '/dashboard';
        return '/';
    };

    const getUserDisplayName = () => {
        return profile?.full_name || user?.email || 'Usuário';
    };

    const getUserInitial = () => {
        const name = getUserDisplayName();
        return name.charAt(0).toUpperCase();
    };

    const getUserAvatar = () => {
        // Prioridade: avatar_url do profile > avatar_url do user metadata > null
        return profile?.avatar_url || user?.user_metadata?.avatar_url || null;
    };

    // Check if we are in admin to hide header (dashboard mantém header para acesso ao menu)
    // IMPORTANTE: Este check deve vir DEPOIS de todos os hooks
    const isAdmin = location.pathname.startsWith('/admin');
    if (isAdmin) return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-card-border bg-background-dark/95 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                        <img src="/logo-header.png" alt="PragHub" className="h-8 md:h-10 w-auto" />
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        {user ? (
                            // Menu quando logado
                            <>
                                <nav className="flex gap-6">
                                    <Link to="/sou-cliente" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Para Clientes</Link>
                                    <Link to="/sou-parceiro" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Para Empresas</Link>
                                </nav>
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                                    >
                                        <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold overflow-hidden border-2 border-primary/20 relative">
                                            {getUserAvatar() && !avatarError ? (
                                                <img 
                                                    src={getUserAvatar()!} 
                                                    alt={getUserDisplayName()} 
                                                    className="w-full h-full object-cover"
                                                    onError={() => setAvatarError(true)}
                                                />
                                            ) : (
                                                <span>{getUserInitial()}</span>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium max-w-[150px] truncate">{getUserDisplayName()}</span>
                                        <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                    </button>
                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-card-dark border border-card-border rounded-xl shadow-lg py-2 z-50">
                                            <Link
                                                to={getDashboardLink()}
                                                onClick={(e) => {
                                                    setIsUserMenuOpen(false);
                                                    // Se já estiver na página do dashboard, prevenir navegação desnecessária
                                                    if (location.pathname === getDashboardLink()) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                className="block px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors"
                                            >
                                                {profile?.role === 'admin' ? 'Painel Admin' : 'Meu Dashboard'}
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                                            >
                                                Sair
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            // Menu quando não logado
                            <>
                                <nav className="flex gap-6">
                                    <Link to="/sou-cliente" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Para Clientes</Link>
                                    <Link to="/sou-parceiro" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Para Empresas</Link>
                                    <Link to="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Entrar</Link>
                                </nav>
                                <Link to="/register" className="bg-transparent border border-primary text-primary hover:bg-primary hover:text-white transition-all cursor-pointer items-center justify-center rounded-full h-9 px-4 text-sm font-bold flex">
                                    Cadastrar Empresa
                                </Link>
                            </>
                        )}
                    </div>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </div>
            {isMenuOpen && (
                <div className="md:hidden bg-card-dark border-t border-card-border p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    <Link to="/sou-cliente" className="text-white block font-medium" onClick={() => setIsMenuOpen(false)}>Para Clientes</Link>
                    <Link to="/sou-parceiro" className="text-white block font-medium" onClick={() => setIsMenuOpen(false)}>Para Empresas</Link>
                    {user ? (
                        <>
                            <Link to={getDashboardLink()} className="text-white block font-medium" onClick={() => setIsMenuOpen(false)}>
                                {profile?.role === 'admin' ? 'Painel Admin' : 'Meu Dashboard'}
                            </Link>
                            <button onClick={handleLogout} className="text-red-400 block font-medium text-left">
                                Sair
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-white block font-medium" onClick={() => setIsMenuOpen(false)}>Entrar</Link>
                            <Link to="/register" className="text-primary block font-bold" onClick={() => setIsMenuOpen(false)}>Cadastrar Empresa</Link>
                        </>
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
                <Link to="/" className="hover:opacity-90 transition-opacity">
                    <img src="/logo-footer.png" alt="PragHub" className="h-8 md:h-10 w-auto" />
                </Link>
                <p className="text-slate-500 text-sm">© 2025 PragHub. Todos os direitos reservados.</p>
            </div>
        </footer>
    );
};