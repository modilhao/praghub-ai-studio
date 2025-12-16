import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    // Check if we are in admin to show a different or no header, 
    // but per design requirements, standard header is used for public pages.
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
                        <nav className="flex gap-6">
                            <Link to="/sou-cliente" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Para Clientes</Link>
                            <Link to="/sou-parceiro" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Para Empresas</Link>
                            <Link to="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Entrar</Link>
                        </nav>
                        <Link to="/register" className="bg-transparent border border-primary text-primary hover:bg-primary hover:text-white transition-all cursor-pointer items-center justify-center rounded-full h-9 px-4 text-sm font-bold flex">
                            Cadastrar Empresa
                        </Link>
                    </div>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </div>
            {isMenuOpen && (
                <div className="md:hidden bg-card-dark border-t border-card-border p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    <Link to="/sou-cliente" className="text-white block font-medium">Para Clientes</Link>
                    <Link to="/sou-parceiro" className="text-white block font-medium">Para Empresas</Link>
                    <Link to="/login" className="text-white block font-medium">Entrar</Link>
                    <Link to="/register" className="text-primary block font-bold">Cadastrar Empresa</Link>
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