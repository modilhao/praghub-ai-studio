import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { signInWithEmail, user } = useAuth();
    const { toast, showError, hideToast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Redireciona se já estiver logado
    useEffect(() => {
        if (user) {
            if (user.role === 'ADMIN') navigate('/admin');
            else if (user.role === 'COMPANY') navigate('/dashboard');
            else navigate('/');
        }
    }, [user, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            console.log('🔐 Tentando fazer login...');
            await signInWithEmail(email, password);
            console.log('✅ Login bem-sucedido, aguardando redirecionamento...');
            // Redirecionamento é tratado no useEffect e no App.tsx
        } catch (error: any) {
            console.error('❌ Erro no login:', error);
            showError(error.message || "Erro ao fazer login. Verifique suas credenciais.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Toast
                message={toast?.message || ''}
                type={toast?.type || 'error'}
                isVisible={!!toast}
                onClose={hideToast}
                duration={toast?.type === 'error' ? 6000 : 4000}
            />
            <div className="bg-background-dark min-h-screen flex items-center justify-center p-4">
                <div className="relative w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24">
                <div className="hidden md:flex flex-col flex-1 max-w-lg">
                    <div className="flex items-center gap-3 mb-8 text-white">
                        <span className="material-symbols-outlined !text-4xl text-primary">hub</span>
                        <h1 className="text-3xl font-bold tracking-tight">PragHub</h1>
                    </div>
                    <h2 className="text-white text-4xl lg:text-5xl font-bold leading-tight mb-6">
                        Conectando controle e segurança.
                    </h2>
                    <p className="text-text-secondary text-lg leading-relaxed mb-8">
                        Gerencie sua empresa de controle de pragas ou encontre os melhores profissionais. Acesse agora com sua conta.
                    </p>
                </div>

                <div className="w-full max-w-[440px] flex-shrink-0">
                    <div className="bg-card-dark rounded-3xl p-8 md:p-10 shadow-2xl border border-input-border animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-8">
                            <h3 className="text-white text-2xl font-bold mb-2">Bem-vindo</h3>
                            <p className="text-text-secondary text-sm">Entre com sua conta</p>
                        </div>

                        <form onSubmit={handleLogin} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-white text-sm font-medium ml-1" htmlFor="email">Email</label>
                                <input
                                    className="w-full bg-accent-dark text-white border border-input-border rounded-full h-12 px-5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    id="email"
                                    required
                                    placeholder="exemplo@empresa.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-white text-sm font-medium ml-1" htmlFor="password">Senha</label>
                                <input
                                    className="w-full bg-accent-dark text-white border border-input-border rounded-full h-12 px-5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    id="password"
                                    required
                                    placeholder="••••••••"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-hover hover:underline">
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <button
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-base h-12 rounded-full transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                <span>{isLoading ? 'Entrando...' : 'Entrar'}</span>
                            </button>
                        </form>

                        <div className="text-center mt-8 pt-6 border-t border-input-border">
                            <p className="text-sm text-text-secondary">
                                É uma empresa?
                                <Link to="/register" className="font-bold text-primary hover:underline ml-1">Cadastre-se aqui</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};