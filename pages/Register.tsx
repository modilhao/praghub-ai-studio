import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';

export const Register: React.FC = () => {
    const { user, signUpWithEmail } = useAuth();
    const { toast, showError, showInfo, hideToast } = useToast();
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        companyName: '',
        city: '',
        whatsapp: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let currentUser = user;

            // Se o usuário não estiver logado, cria a conta primeiro
            if (!currentUser) {
                const { error: signUpError } = await signUpWithEmail(formData.email, formData.password);
                if (signUpError) throw signUpError;

                // Aguarda um momento para a trigger do banco criar o profile
                await new Promise(resolve => setTimeout(resolve, 2000));

                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    showInfo('Conta criada! Por favor, verifique seu e-mail (se habilitado) ou tente logar.');
                    setIsLoading(false);
                    return;
                }
                currentUser = session.user as any;
            }

            // Retry logic para garantir que o profile existe antes de criar a empresa
            let profileExists = false;
            for (let i = 0; i < 3; i++) {
                const { data: profile } = await supabase.from('profiles').select('id').eq('id', currentUser?.id).single();
                if (profile) {
                    profileExists = true;
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            if (!profileExists) {
                throw new Error("Erro ao criar perfil de usuário. Tente novamente.");
            }

            // Preparar dados adicionais (arrays)
            // No protótipo simples, vamos enviar arrays vazios ou mockados se não estiverem no state
            // Mas o form tem checks visuais que não estão no state formData. Vamos corrigir isso depois.
            // Por enquanto, enviamos dados básicos garantidos.

            const { error: companyError } = await supabase.from('companies').insert({
                owner_id: currentUser?.id,
                name: formData.companyName,
                city: formData.city,
                whatsapp: formData.whatsapp,
                status: 'PENDING',
                services: ['Controle de Pragas'], // Default
                conversion_rate: 0,
                leads_generated: 0,
                rating: 5.0,
                reviews_count: 0
            });

            if (companyError) {
                console.error('Erro detalhado Supabase:', companyError);
                throw new Error(`Erro ao criar empresa: ${companyError.message}`);
            }

            // Atualizar o role do usuário para COMPANY
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ role: 'COMPANY' })
                .eq('id', currentUser?.id);

            if (profileError) {
                console.error('Erro ao atualizar role:', profileError);
            }

            setSubmitted(true);

            setTimeout(() => {
                window.location.href = '/#/dashboard';
                window.location.reload();
            }, 2000);

        } catch (error: any) {
            console.error('Erro no registro:', error);
            showError(error.message || 'Ocorreu um erro ao salvar os dados.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Toast
                message={toast?.message || ''}
                type={toast?.type || 'info'}
                isVisible={!!toast}
                onClose={hideToast}
                duration={toast?.type === 'error' ? 6000 : 4000}
            />
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
                                Junte-se ao PragHub hoje. Receba leads diretos via WhatsApp, gerencie sua visibilidade e aumente sua receita com nosso diretório especializado.
                            </p>
                        </div>
                        <div className="grid gap-4 mt-4">
                            {[
                                { icon: 'chat', title: 'Leads Diretos Via WhatsApp', desc: 'Clientes entram em contato diretamente com você, sem intermediários ou taxas ocultas.' },
                                { icon: 'dashboard', title: 'Painel de Admin Simples', desc: 'Atualize seu perfil, áreas de cobertura e serviços em segundos.' },
                                { icon: 'stars', title: 'Visibilidade Premium', desc: 'Obtenha destaque e selos para maiores taxas de conversão.' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-surface-border shadow-sm hover:border-primary/30 transition-colors">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined">{item.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1 text-slate-900 dark:text-white">{item.title}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-7 w-full">
                        {submitted ? (
                            <div className="mt-8 p-6 bg-surface-dark rounded-xl border border-primary/20 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Cadastro recebido!</h3>
                                <p className="text-gray-400 mb-6">Vamos revisar seus dados e liberar sua conta em breve.</p>
                                <Link to="/login" className="text-primary font-bold hover:underline">Ir para Login →</Link>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-surface-border shadow-2xl overflow-hidden flex flex-col h-full">
                                <div className="px-8 py-6 border-b border-gray-100 dark:border-surface-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Registro</h3>
                                        <span className="text-sm font-medium text-primary">Etapa 1 de 2</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-1/2 rounded-full relative shadow-[0_0_10px_rgba(0,123,255,0.5)]">
                                            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/30 to-transparent"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 md:p-8 flex-1 overflow-y-auto max-h-[800px]">
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="space-y-6">
                                            <h4 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-800 text-white dark:text-primary text-sm border border-slate-700">1</span>
                                                Informações da Conta
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">Email</label>
                                                    <input
                                                        className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-500"
                                                        id="email"
                                                        type="email"
                                                        required
                                                        placeholder="seu@email.com"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">Senha</label>
                                                    <input
                                                        className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-500"
                                                        id="password"
                                                        type="password"
                                                        required
                                                        placeholder="••••••••"
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="border-gray-100 dark:border-slate-800" />

                                        <div className="space-y-6">
                                            <h4 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-800 text-white dark:text-primary text-sm border border-slate-700">2</span>
                                                Informações da Empresa
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="companyName">Nome da Empresa</label>
                                                    <input
                                                        className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-500"
                                                        id="companyName"
                                                        placeholder="ex: Dedetizadora Rápida"
                                                        type="text"
                                                        required
                                                        value={formData.companyName}
                                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="city">Sua Cidade</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 material-symbols-outlined text-[20px]">location_on</span>
                                                        <input
                                                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-500"
                                                            id="city"
                                                            placeholder="Sua Cidade"
                                                            type="text"
                                                            required
                                                            value={formData.city}
                                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="whatsapp">Número de WhatsApp</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 material-symbols-outlined text-[20px]">chat</span>
                                                        <input
                                                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-500 font-mono"
                                                            id="whatsapp"
                                                            placeholder="(00) 00000-0000"
                                                            type="tel"
                                                            required
                                                            value={formData.whatsapp}
                                                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <hr className="border-gray-100 dark:border-slate-800" />
                                        <div className="space-y-8">
                                            <h4 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-800 text-white dark:text-primary text-sm border border-slate-700">3</span>
                                                Serviços e Cobertura
                                            </h4>
                                            <div className="space-y-3">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Serviços Oferecidos</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Cupins', 'Roedores', 'Insetos', 'Sanitização', 'Controle de Aves'].map((s, i) => (
                                                        <label key={i} className="cursor-pointer group">
                                                            <input defaultChecked={i < 3} className="sr-only chip-checkbox" type="checkbox" />
                                                            <div className="px-4 py-2 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:border-primary/50 transition-all">{s}</div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Segmentos de Atendimento</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Residencial', 'Comercial', 'Condomínios', 'Industrial'].map((s, i) => (
                                                        <label key={i} className="cursor-pointer group">
                                                            <input defaultChecked={i < 2} className="sr-only chip-checkbox" type="checkbox" />
                                                            <div className="px-4 py-2 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:border-primary/50 transition-all">{s}</div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bairros Atendidos</label>
                                                <div className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-2 py-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
                                                    {['Centro', 'Zona Oeste'].map(tag => (
                                                        <div key={tag} className="flex items-center gap-1 bg-white dark:bg-slate-800 text-xs font-medium px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 dark:text-white">
                                                            {tag}
                                                            <button className="hover:text-red-400" type="button"><span className="material-symbols-outlined text-[14px]">close</span></button>
                                                        </div>
                                                    ))}
                                                    <input className="bg-transparent border-none outline-none text-sm px-2 py-1 flex-1 min-w-[120px] focus:ring-0 text-slate-900 dark:text-white" placeholder="Digite e pressione Enter" type="text" />
                                                </div>
                                                <p className="text-xs text-gray-500">Liste os principais bairros que você atende para melhorar a relevância da busca.</p>
                                            </div>
                                            <label className="block cursor-pointer group relative overflow-hidden">
                                                <input className="peer sr-only" type="checkbox" />
                                                <div className="absolute inset-0 bg-blue-500/5 opacity-0 peer-checked:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
                                                <div className="relative flex items-start gap-4 p-5 rounded-xl border border-gray-200 dark:border-slate-700 peer-checked:border-primary transition-all bg-white dark:bg-surface-dark group-hover:border-primary/50">
                                                    <div className="flex items-center h-6">
                                                        <div className="w-6 h-6 rounded border border-gray-400 dark:border-gray-500 peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-colors">
                                                            <span className="material-symbols-outlined text-white text-sm opacity-0 peer-checked:opacity-100 font-bold">check</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-bold text-slate-900 dark:text-white">Quero o Plano Premium</span>
                                                            <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">RECOMENDADO</span>
                                                        </div>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Apareça na página inicial e no topo dos resultados de busca. 3x mais leads em média.</p>
                                                        <div className="text-xs font-semibold text-primary underline">Ver detalhes do plano</div>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                        <div className="pt-4">
                                            <button
                                                disabled={isLoading}
                                                className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-lg py-4 rounded-full shadow-[0_0_20px_rgba(0,123,255,0.3)] hover:shadow-[0_0_30px_rgba(0,123,255,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                                type="submit"
                                            >
                                                {isLoading ? 'Enviando...' : 'Enviar cadastro'}
                                            </button>
                                            <p className="text-center text-xs text-gray-500 mt-4">
                                                Ao clicar em Enviar, você concorda com nossos <Link className="underline hover:text-primary" to="/terms">Termos de Uso</Link> e <Link className="underline hover:text-primary" to="/privacy">Política de Privacidade</Link>.
                                            </p>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
        </>
    );
};