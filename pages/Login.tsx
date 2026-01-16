import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/Toast';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { signInWithEmail, user } = useAuth();
    const { showToast, hideToast, toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Fallback: Redireciona se já estiver logado (ex: sessão existente ao abrir a página)
    useEffect(() => {
        if (user) {
            if (user.role === 'ADMIN') {
                navigate('/admin', { replace: true });
            } else if (user.role === 'COMPANY') {
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [user, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/69870bc7-00ea-4f64-9298-033124960c3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1',location:'pages/Login.tsx:30',message:'login_submit',data:{emailLen:email.length,hasPassword:password.length>0},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        setIsLoading(true);
        try {
            // IMPORTANTE: signInWithEmail retorna o User após carregar o profile
            // Isso permite redirecionamento imediato sem depender apenas do useEffect
            const loggedUser = await signInWithEmail(email, password);
            
            // Redireciona imediatamente após login bem-sucedido
            // O useEffect acima serve como fallback para casos de sessão existente
            if (loggedUser) {
                if (loggedUser.role === 'ADMIN') {
                    navigate('/admin', { replace: true });
                } else if (loggedUser.role === 'COMPANY') {
                    navigate('/dashboard', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            }
        } catch (error: any) {
            console.error('Erro ao fazer login:', error);
            // Exibe mensagem de erro usando Toast ao invés de alert
            const errorMessage = error.message || "Erro ao fazer login. Verifique suas credenciais.";
            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
            // #region agent log
            fetch('http://127.0.0.1:7245/ingest/69870bc7-00ea-4f64-9298-033124960c3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1',location:'pages/Login.tsx:56',message:'login_finalize',data:{isLoading:false},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
        }
    };

    return (
        <>
            {toast.isVisible && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.isVisible}
                    onClose={hideToast}
                    duration={toast.type === 'error' ? 6000 : 4000}
                />
            )}
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