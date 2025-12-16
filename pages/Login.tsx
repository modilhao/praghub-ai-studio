import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/contexts/AuthContext';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { user, profile, loading: authLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirecionar se já estiver logado
    useEffect(() => {
        if (!authLoading && user) {
            if (profile?.role === 'admin') {
                navigate('/admin', { replace: true });
            } else if (profile?.role === 'company') {
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [user, profile, authLoading, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw authError;

            if (user) {
                // Check if profile exists and has a role
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    // Fallback using metadata if profile fetch fails (e.g. trigger delay)
                    const role = user.user_metadata?.role;
                    if (role === 'admin') {
                        navigate('/admin');
                    } else if (role === 'consumer') {
                        navigate('/');
                    } else {
                        navigate('/dashboard');
                    }
                } else if (profile) {
                    if (profile.role === 'admin') {
                        navigate('/admin');
                    } else if (profile.role === 'consumer') {
                        navigate('/');
                    } else {
                        navigate('/dashboard');
                    }
                } else {
                    // Default fallback
                    navigate('/dashboard');
                }
            } else {
                throw new Error("Usuário não encontrado.");
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar login');
        } finally {
            setLoading(false);
        }
    };

    const fillCredentials = (role: 'admin' | 'company') => {
        if (role === 'admin') {
            setEmail('admin@praghub.com');
            setPassword('password');
        } else {
            setEmail('contato@fastclean.com.br');
            setPassword('password');
        }
    };

    // Mostrar loading enquanto verifica autenticação
    if (authLoading) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    <span>Carregando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24">
                <div className="hidden md:flex flex-col flex-1 max-w-lg">
                    <div className="flex items-center gap-3 mb-8">
                        <Link to="/" className="size-10 flex items-center justify-center bg-white rounded-xl text-primary border border-gray-100">
                            <span className="material-symbols-outlined !text-3xl">pest_control</span>
                        </Link>
                        <h1 className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight">PragHub</h1>
                    </div>
                    <h2 className="text-gray-900 dark:text-white text-4xl lg:text-5xl font-bold leading-tight mb-6">
                        Conectando controle e segurança.
                    </h2>
                    <p className="text-gray-600 dark:text-text-secondary text-lg leading-relaxed mb-8">
                        Gerencie sua empresa de controle de pragas ou encontre os melhores profissionais para o seu negócio. Simples, rápido e confiável.
                    </p>
                    <div className="flex items-center gap-4 text-gray-700 dark:text-white/80 text-sm">
                        <div className="flex -space-x-3">
                            <img alt="Professional" className="w-10 h-10 rounded-full border-2 border-background-light dark:border-background-dark object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVb5lgCDD1i0t9pRBjqPhYUHprnRbZdmVuru_yrJBRVuZgb6F0Nir15Ox3oRb2ZAiE9Wk-qXGtCpLsTUc2wP5iTeAEp9eCpTNeb3t-Roe49eUcHIY1GiVKs2w1kDQ_Quqe11SS961MPAecwJ6VRPL_ZxqOB1cjiEzuUEfmpFXv_B_3hxpO4CoSOpbjH2d2pYMcDiC5kKjYtCxGMjosmvD8NOSnq_AsI6X_QJ_h9cQwMqJq3fxkgvk4g0XqtpFZ7y_eqLO-ou3o5C3N" />
                            <img alt="Professional" className="w-10 h-10 rounded-full border-2 border-background-light dark:border-background-dark object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuChFmF6te1tDJEtyypD_D8NAUjZqACADqKxExUqOAV6-ajRxenmoNVxSNJw8zLnnPHBZPOBDXP7SSdPnfPIMatsolitngpIecM3XhM8bYSmoC4uM0XGZ5ALjHUvc2Ute3_J6KsIpIgCmjLwtFRuy1EXurgIhmg8k-mdgLmzdUE7JPzXFWR8x0Rl2OXcmJU_4GtfEummX6jblPRt7BccJJN4sqG5mT6bNT2kWKWXDfGCwt_yjdZQ1j4z2zpysW0SMOG_bh7g0ZwfM3P9" />
                            <img alt="Professional" className="w-10 h-10 rounded-full border-2 border-background-light dark:border-background-dark object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWY_Fm7wlrU5jOv1aC8ITS9pLiXHtmk0siN5-igAutkuLCJJ7u6D4WNVAQBqfLRzLW1_bWHYVQzjpV7FXZBbvQ3DmmJmtcz4Bi8COPKFaeKsIHRylkIZAo0B1vsKqbl7RlMr-aQUuBrcuQ5s3cwEGna7qd8VSQgNVOlafMgMP7IpuAbBrY81EPLDv7iq9f38wCzsL2-C5dpZQFm3SYePjqwT7sRNWb8IHwK9bBUtixydAz4KOUWcA0wblaHH4Lyw_wX3mJXiLrMX1u" />
                        </div>
                        <p>Junte-se a +2.000 empresas parceiras</p>
                    </div>
                </div>
                <div className="w-full max-w-[480px] flex-shrink-0">
                    <div className="bg-white dark:bg-card-dark rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100 dark:border-input-border">
                        <div className="md:hidden flex items-center justify-center gap-2 mb-6 text-gray-900 dark:text-white">
                            <span className="material-symbols-outlined text-primary">pest_control</span>
                            <span className="font-bold text-xl">PragHub</span>
                        </div>
                        <div className="text-center md:text-left mb-8">
                            <h3 className="text-gray-900 dark:text-white text-2xl font-bold mb-2">Bem-vindo de volta</h3>
                            <p className="text-gray-500 dark:text-text-secondary text-sm">Acesse o painel da sua empresa ou administração</p>
                        </div>

                        {/* Demo Helpers (Optional: Keep for easy testing if needed, or remove) */}
                        <div className="flex gap-2 mb-6 hidden">
                            <button onClick={() => fillCredentials('company')} className="flex-1 text-xs bg-gray-100 dark:bg-surface-dark py-2 rounded text-slate-500 hover:text-primary transition-colors">
                                Preencher como <strong>Empresa</strong>
                            </button>
                            <button onClick={() => fillCredentials('admin')} className="flex-1 text-xs bg-gray-100 dark:bg-surface-dark py-2 rounded text-slate-500 hover:text-primary transition-colors">
                                Preencher como <strong>Admin</strong>
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-gray-900 dark:text-white text-sm font-medium ml-1" htmlFor="email">Email</label>
                                <div className="relative">
                                    <input
                                        className="w-full bg-gray-50 dark:bg-accent-dark text-gray-900 dark:text-white border border-gray-200 dark:border-input-border rounded-full h-12 px-5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-gray-400 dark:placeholder:text-text-secondary/50 transition-all"
                                        id="email"
                                        placeholder="exemplo@empresa.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-text-secondary pointer-events-none">
                                        <span className="material-symbols-outlined text-[20px]">mail</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-gray-900 dark:text-white text-sm font-medium ml-1" htmlFor="password">Senha</label>
                                <div className="relative">
                                    <input
                                        className="w-full bg-gray-50 dark:bg-accent-dark text-gray-900 dark:text-white border border-gray-200 dark:border-input-border rounded-full h-12 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-gray-400 dark:placeholder:text-text-secondary/50 transition-all"
                                        id="password"
                                        placeholder="********"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-text-secondary hover:text-primary transition-colors cursor-pointer" type="button">
                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-hover dark:text-primary dark:hover:text-[#3b82f6] transition-colors">
                                    Esqueci minha senha
                                </Link>
                            </div>
                            <button disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-base h-12 rounded-full mt-2 transition-all shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] hover:shadow-[0_6px_20px_rgba(0,118,255,0.23)] flex items-center justify-center gap-2 group disabled:opacity-50">
                                <span>{loading ? 'Entrando...' : 'Entrar'}</span>
                                <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
                            </button>
                        </form>
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-input-border"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white dark:bg-card-dark text-gray-500 dark:text-text-secondary">ou continue com</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-text-secondary">
                                Ainda não tem conta?
                                <Link to="/register" className="font-bold text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors ml-1">Cadastre sua empresa</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};