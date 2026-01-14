import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Company } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { mapCompanyFromDB } from '../lib/mappers';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';

export const CompanyProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { toast, showError, hideToast } = useToast();
    const [company, setCompany] = useState<Company | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [quoteSent, setQuoteSent] = useState(false);

    useEffect(() => {
        const fetchCompany = async () => {
            if (!id) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                if (data) {
                    setCompany(mapCompanyFromDB(data));
                }
            } catch (error) {
                console.error('Error fetching company:', error);
                setCompany(null); // Ensure company is null on error
            } finally {
                setIsLoading(false);
            }
        };
        fetchCompany();
    }, [id]);

    const [quoteData, setQuoteData] = useState({ name: '', whatsapp: '', message: '' });

    const handleSendQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company || !id) return;

        try {
            const { error } = await supabase
                .from('leads')
                .insert({
                    company_id: id,
                    profile_id: user?.id,
                    customer_name: quoteData.name,
                    customer_phone: quoteData.whatsapp,
                    description: quoteData.message,
                    status: 'NEW'
                });

            if (error) throw error;

            setQuoteSent(true);
            setTimeout(() => {
                setQuoteSent(false);
                setShowQuoteModal(false);
                setQuoteData({ name: '', whatsapp: '', message: '' });
            }, 2000);
        } catch (err) {
            console.error('Error sending quote:', err);
            showError('Erro ao enviar solicitação. Tente novamente.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark animate-pulse">
                <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-8">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-8"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
                        <div className="lg:col-span-1 h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
                    </div>
                </main>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
                <h1 className="text-2xl font-bold">Empresa não encontrada</h1>
                <Link to="/" className="text-primary mt-4">Voltar para Home</Link>
            </div>
        );
    }

    return (
        <>
            <Toast
                message={toast?.message || ''}
                type={toast?.type || 'error'}
                isVisible={!!toast}
                onClose={hideToast}
                duration={toast?.type === 'error' ? 6000 : 4000}
            />
            <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
                <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-8">
                {/* Breadcrumb */}
                <nav className="flex mb-6 text-sm font-medium text-slate-500 dark:text-text-secondary">
                    <ol className="flex flex-wrap items-center gap-2">
                        <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                        <li><span className="material-symbols-outlined text-[16px] align-middle">chevron_right</span></li>
                        <li><span className="text-slate-900 dark:text-white font-semibold">{company.name}</span></li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column: Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Hero Card */}
                        <section className="bg-white dark:bg-card-dark rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-card-border flex flex-col md:flex-row gap-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            <div className="shrink-0 relative">
                                {company.imageUrl ? (
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-cover bg-center border-4 border-white dark:border-[#334155] shadow-2xl" style={{ backgroundImage: `url('${company.imageUrl}')` }}></div>
                                ) : (
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-slate-800 flex items-center justify-center border-4 border-white dark:border-[#334155] shadow-2xl">
                                        <span className="text-4xl font-bold text-slate-500">{company.initials}</span>
                                    </div>
                                )}
                                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-[#0f172a] rounded-full p-2 shadow-lg border border-gray-100 dark:border-gray-800" title="Verificado">
                                    <span className="material-symbols-outlined text-primary text-[28px] filled">verified</span>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    {company.isPremium && (
                                        <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-primary/20">PREMIUM PARTNER</span>
                                    )}
                                    <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20">OPERANDO AGORA</span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3 leading-tight">{company.name}</h1>
                                <div className="flex items-center gap-4 text-slate-500 dark:text-text-secondary">
                                    <div className="flex items-center gap-1.5 text-yellow-400">
                                        <span className="material-symbols-outlined text-[20px] filled">star</span>
                                        <span className="text-slate-900 dark:text-white font-black text-lg">{company.rating}</span>
                                        <span className="text-xs font-bold text-slate-500 ml-1">({company.reviewsCount} reviews)</span>
                                    </div>
                                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[20px] text-primary">location_on</span>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{company.location}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Content Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section className="md:col-span-2">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <span className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[20px]">info</span>
                                    </span>
                                    História e Especialidades
                                </h3>
                                <div className="bg-white dark:bg-card-dark rounded-3xl p-8 border border-gray-100 dark:border-card-border shadow-sm">
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                                        {company.description || "Esta empresa ainda não forneceu uma descrição detalhada."}
                                    </p>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <span className="size-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[20px]">schedule</span>
                                    </span>
                                    Horários
                                </h3>
                                <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-100 dark:border-card-border shadow-sm">
                                    <p className="text-slate-700 dark:text-slate-300 font-bold text-sm">{company.businessHours || "Segunda à Sexta: 08:00 às 18:00"}</p>
                                    <p className="text-emerald-500 text-xs mt-2 font-black uppercase tracking-widest">Respostas em menos de 10 min</p>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <span className="size-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[20px]">share</span>
                                    </span>
                                    Redes Sociais
                                </h3>
                                <div className="flex gap-3">
                                    {company.website && (
                                        <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" className="size-12 rounded-2xl bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-all shadow-sm">
                                            <span className="material-symbols-outlined">language</span>
                                        </a >
                                    )}
                                    {
                                        company.instagram && (
                                            <a href={`https://instagram.com/${company.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="size-12 rounded-2xl bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-all shadow-sm">
                                                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                                            </a>
                                        )
                                    }
                                    <div className="flex-1 bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-card-border flex items-center px-4">
                                        <span className="text-xs font-bold text-slate-400">{company.instagram || "Não disponível"}</span>
                                    </div>
                                </div >
                            </section >
                        </div >
                    </div >

                    {/* Right Column: CTA */}
                    < aside className="lg:col-span-1 space-y-6" >
                        <div className="sticky top-24">
                            <div className="bg-white dark:bg-card-dark rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-gray-100 dark:border-card-border text-center">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Solicitar Orçamento</h3>
                                <p className="text-slate-500 text-sm mb-8">Converse diretamente com o técnico via WhatsApp.</p>

                                <div className="space-y-4">
                                    <a
                                        href={`https://wa.me/${company.whatsapp?.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-primary hover:bg-primary-hover text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/30 transition-all transform active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        <span className="material-symbols-outlined text-[24px]">chat</span>
                                        FALAR NO WHATSAPP
                                    </a>
                                    <button onClick={() => setShowQuoteModal(true)} className="w-full bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold py-4 rounded-2xl transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3">
                                        <span className="material-symbols-outlined text-[22px]">request_quote</span>
                                        PEDIR ORÇAMENTO
                                    </button>
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-6">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Satisfação</p>
                                        <p className="text-lg font-black text-primary">99%</p>
                                    </div>
                                    <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Garantia</p>
                                        <p className="text-lg font-black text-primary">6 Meses</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside >
                </div >
            </main >

            {/* Modal Quote - Simple for Prototype */}
            {
                showQuoteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white dark:bg-card-dark rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-12">
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Seu Orçamento</h3>
                                    <button onClick={() => setShowQuoteModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                                {quoteSent ? (
                                    <div className="py-12 text-center space-y-4">
                                        <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 scale-in animate-bounce">
                                            <span className="material-symbols-outlined text-[40px]">check_circle</span>
                                        </div>
                                        <h3 className="text-xl font-bold">Orçamento Enviado!</h3>
                                        <p className="text-slate-500">O técnico entrará em contato em breve.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSendQuote} className="space-y-6">
                                        <div>
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Nome Completo</label>
                                            <input
                                                required
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                                                placeholder="Ex: Maria Oliveira"
                                                value={quoteData.name}
                                                onChange={(e) => setQuoteData({ ...quoteData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Seu Celular (Whats)</label>
                                            <input
                                                required
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                                                placeholder="(11) 90000-0000"
                                                value={quoteData.whatsapp}
                                                onChange={(e) => setQuoteData({ ...quoteData, whatsapp: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">O que você precisa?</label>
                                            <textarea
                                                required
                                                rows={3}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white resize-none"
                                                placeholder="Ex: Tenho cupins nos móveis do quarto."
                                                value={quoteData.message}
                                                onChange={(e) => setQuoteData({ ...quoteData, message: e.target.value })}
                                            />
                                        </div>
                                        <button className="w-full bg-primary hover:bg-primary-hover text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/30 transition-all">ENVIAR AGORA</button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
            </div>
        </>
    );
};
