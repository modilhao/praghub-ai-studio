import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        companyName: '',
        city: '',
        whatsapp: '',
        email: '',
        password: '',
        services: [] as string[],
        segments: [] as string[],
        neighborhoods: [] as string[]
    });

    // Helper to update form data
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Sign Up User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;

            // 2. Create Company Slug
            const slug = formData.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

            // 3. Insert Company Data (only if we have a user/session, otherwise we can't due to RLS)
            // Note: If email confirmation is enabled, this might fail or require different logic.
            // For MVP, we attempt insertion.
            if (authData.user) {
                const { error: companyError } = await supabase.from('companies').insert({
                    owner_id: authData.user.id,
                    slug: slug,
                    name: formData.companyName,
                    location: formData.city,
                    short_location: formData.city.split('-')[0].trim(),
                    whatsapp: formData.whatsapp,
                    tags: [...formData.services, ...formData.segments], // Combine simplified tags
                    status: 'Pendente',
                    is_premium: false
                });

                if (companyError) {
                    console.error('Company creation failed:', companyError);
                    // We don't throw here to at least allow the user to exist
                }
            }

            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
            <main className="flex-grow flex justify-center py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-5 flex flex-col justify-center gap-8 pt-4 lg:pt-12">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-primary text-xs font-bold uppercase tracking-wider">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                PROGRAMA DE PARCERIA
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white">
                                Impulsione Seu Negócio de Controle de Pragas
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                                Junte-se ao PragHub hoje. Receba leads diretos via WhatsApp, gerencie sua visibilidade e aumente sua receita.
                            </p>
                        </div>
                    </div>
                    <div className="lg:col-span-7 w-full">
                        {submitted ? (
                            <div className="mt-8 p-6 bg-surface-dark rounded-xl border border-primary/20 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Cadastro recebido!</h3>
                                <p className="text-gray-400 mb-6">Verifique seu e-mail para confirmar a conta.</p>
                                <Link to="/login" className="text-primary font-bold hover:underline">Ir para Login →</Link>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-surface-border shadow-2xl overflow-hidden flex flex-col h-full">
                                <div className="px-8 py-6 border-b border-gray-100 dark:border-surface-border">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Registro</h3>
                                </div>
                                <div className="p-6 md:p-8 flex-1 overflow-y-auto max-h-[800px]">
                                    {error && (
                                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                                            {error}
                                        </div>
                                    )}
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="space-y-6">
                                            <h4 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                                Informações da Empresa
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="companyName">Nome da Empresa</label>
                                                    <input onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none" id="companyName" placeholder="ex: Dedetizadora Rápida" type="text" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="city">Cidade</label>
                                                    <input onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none" id="city" placeholder="São Paulo - SP" type="text" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="whatsapp">WhatsApp</label>
                                                    <input onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none" id="whatsapp" placeholder="(11) 99999-9999" type="tel" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">E-mail de Login</label>
                                                    <input onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none" id="email" placeholder="seu@email.com" type="email" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">Senha</label>
                                                    <input onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none" id="password" placeholder="******" type="password" required />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <button disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-lg py-4 rounded-full shadow-lg transition-all disabled:opacity-50" type="submit">
                                                {loading ? 'Criando conta...' : 'Criar Conta'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};