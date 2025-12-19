import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/#/login`,
            });

            if (error) throw error;
            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar email. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-2xl shadow-xl border border-gray-100 dark:border-card-border p-8">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-2xl">lock_reset</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recuperar Senha</h2>
                    <p className="text-slate-500 text-sm mt-2">
                        Digite seu email para recebermos um link de redefinição.
                    </p>
                </div>

                {submitted ? (
                    <div className="text-center animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/50 mb-6">
                            <p className="text-green-800 dark:text-green-200 font-medium">Email enviado!</p>
                            <p className="text-green-700 dark:text-green-300 text-sm mt-1">Verifique sua caixa de entrada.</p>
                        </div>
                        <Link to="/login" className="text-primary font-bold hover:underline text-sm">
                            Voltar para o Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50">
                                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-slate-900 dark:text-white">Email cadastrado</label>
                            <input
                                id="email"
                                type="email"
                                required
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-surface-border rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-bold h-12 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Enviando...' : 'Enviar Link'}
                        </button>
                        <div className="text-center">
                            <Link to="/login" className="text-sm text-slate-500 hover:text-primary transition-colors">
                                Voltar para o Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};