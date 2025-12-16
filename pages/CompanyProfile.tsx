import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';
import { Company } from '../types';
import { getCompanyInitials } from '../src/lib/utils';

export const CompanyProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // This is the slug
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [quoteSent, setQuoteSent] = useState(false);

    useEffect(() => {
        if (id) {
            fetchCompany(id);
        }
    }, [id]);

    const fetchCompany = async (slug: string) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) {
                console.error('Error fetching company:', error);
                setCompany(null); // Ensure company is null on error
            } else if (data) {
                const mappedCompany: Company = {
                    id: data.slug, // Using slug as id for consistency with URL
                    slug: data.slug,
                    name: data.name,
                    rating: data.rating || 0,
                    reviews: data.reviews || 0,
                    location: data.location || '',
                    shortLocation: data.short_location || '',
                    description: data.description,
                    cep: data.cep,
                    street: data.street,
                    number: data.number,
                    neighborhood: data.neighborhood,
                    city: data.city,
                    state: data.state,
                    tags: data.tags || [],
                    specialties: data.specialties || [],
                    imageUrl: data.image_url,
                    whatsapp: data.whatsapp,
                    isPremium: data.is_premium || false,
                    status: data.status || 'Pendente'
                };
                setCompany(mappedCompany);
            } else {
                setCompany(null); // No data found
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            setCompany(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSendQuote = (e: React.FormEvent) => {
        e.preventDefault();
        setQuoteSent(true);
        setTimeout(() => {
            setQuoteSent(false);
            setShowQuoteModal(false);
        }, 2000);
    };

    if (!company) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">Empresa não encontrada</h1>
                <Link to="/" className="text-primary hover:underline">Voltar para Home</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-8">
                <nav className="flex mb-6 text-sm font-medium text-slate-500 dark:text-text-secondary">
                    <ol className="flex flex-wrap items-center gap-2">
                        <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                        <li><span className="material-symbols-outlined text-[16px] align-middle">chevron_right</span></li>
                        <li><span className="text-slate-900 dark:text-white font-semibold">{company.shortLocation}</span></li>
                        <li><span className="material-symbols-outlined text-[16px] align-middle">chevron_right</span></li>
                        <li aria-current="page" className="text-slate-900 dark:text-white font-semibold">{company.name}</li>
                    </ol>
                </nav>

                {/* Status Banner - Show if no tags/incomplete profile logic could go here, but for now just showing specific Logic if we want */}
                {!company.isPremium && (
                    <div className="mb-8 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-500/20 rounded-full shrink-0 text-blue-500">
                                <span className="material-symbols-outlined">visibility_off</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-blue-600 dark:text-blue-400">Perfil Básico</h3>
                                <p className="text-sm text-blue-700/80 dark:text-blue-200/70 mt-1">Este perfil tem informações resumidas.</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white dark:bg-card-dark rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-card-border flex flex-col md:flex-row gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            <div className="shrink-0 relative">
                                {company.imageUrl ? (
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-cover bg-center border-4 border-white dark:border-[#334155] shadow-lg" style={{ backgroundImage: `url('${company.imageUrl}')` }}></div>
                                ) : (
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-slate-800 flex items-center justify-center border-4 border-white dark:border-[#334155] shadow-lg">
                                        <span className="text-4xl font-bold text-slate-400">{getCompanyInitials(company.name)}</span>
                                    </div>
                                )}

                                {company.isPremium && (
                                    <div className="absolute bottom-1 right-1 bg-white dark:bg-[#0f172a] rounded-full p-1.5 shadow-md border border-gray-100 dark:border-gray-800" title="Verificado">
                                        <span className="material-symbols-outlined text-primary text-[24px] filled">verified</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col justify-center flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    {company.isPremium && (
                                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                            <span className="material-symbols-outlined text-[14px] filled">star</span>
                                            PREMIUM PARTNER
                                        </span>
                                    )}
                                    <span className="bg-primary/20 text-primary dark:text-primary-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                        VERIFICADA
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">{company.name}</h1>
                                <div className="flex flex-col gap-1 text-slate-500 dark:text-text-secondary">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[20px] text-slate-400 dark:text-slate-500">location_on</span>
                                        <span className="text-base font-medium">{company.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex text-yellow-400 text-[18px]">
                                            <span className="material-symbols-outlined filled">star</span>
                                            <span className="text-slate-700 dark:text-slate-200 font-bold ml-1">{company.rating}</span>
                                        </div>
                                        <span className="text-sm text-slate-400 dark:text-slate-500">({company.reviews} avaliações)</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* About Section */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">info</span> Sobre a Empresa
                            </h2>
                            <div className="bg-white dark:bg-card-dark rounded-xl p-6 border border-gray-100 dark:border-card-border shadow-sm">
                                {company.description ? (
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{company.description}</p>
                                ) : (
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                        A {company.name} atua no controle de pragas na região de {company.shortLocation}.
                                        Comprometida com a segurança e eficiência, oferecendo serviços especializados para proteger seu ambiente.
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Tags Section */}
                        {(company.tags.length > 0 || (company.specialties && company.specialties.length > 0)) && (
                            <section>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">pest_control</span> Especialidades
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {company.specialties && company.specialties.length > 0 ? (
                                        company.specialties.map((spec, i) => (
                                            <span key={i} className="px-4 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border rounded-full text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 hover:border-primary/50 transition-colors cursor-default hover:bg-slate-50 dark:hover:bg-slate-800">
                                                <span className="size-2 rounded-full bg-primary"></span> {spec}
                                            </span>
                                        ))
                                    ) : (
                                        company.tags.map((tag, i) => (
                                            <span key={i} className="px-4 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border rounded-full text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 hover:border-primary/50 transition-colors cursor-default hover:bg-slate-50 dark:hover:bg-slate-800">
                                                <span className="size-2 rounded-full bg-primary"></span> {tag}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </section>
                        )}

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">domain</span> Áreas de Atendimento
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-100 dark:border-card-border flex flex-col items-center gap-3 text-center hover:border-primary/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                                    <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                        <span className="material-symbols-outlined text-[32px]">home</span>
                                    </div>
                                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">Residencial</span>
                                </div>
                                {/* Reduced areas for brevity in generic profiles, usually conditional */}
                                <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-100 dark:border-card-border flex flex-col items-center gap-3 text-center hover:border-primary/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                                    <div className="p-3 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                                        <span className="material-symbols-outlined text-[32px]">storefront</span>
                                    </div>
                                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">Comercial</span>
                                </div>
                            </div>
                        </section>
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">security</span> Credibilidade e Segurança
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-card-dark border border-gray-100 dark:border-card-border">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                                        <span className="material-symbols-outlined">badge</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Licença ANVISA</h4>
                                        <p className="text-xs text-slate-500">Válida até Dez/2024</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-card-dark border border-gray-100 dark:border-card-border">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                                        <span className="material-symbols-outlined">psychiatry</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Responsável Técnico</h4>
                                        <p className="text-xs text-slate-500">CRQ IV Região Ativo</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-lg border border-gray-100 dark:border-card-border">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Falar com a FastClean</h3>
                                <div className="space-y-3">
                                    <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-full shadow-lg shadow-primary/30 transition-all transform active:scale-[0.98]">
                                        <span className="material-symbols-outlined text-[24px]">chat</span>
                                        Chamar no WhatsApp
                                    </button>
                                    <button onClick={() => setShowQuoteModal(true)} className="w-full flex items-center justify-center gap-2 bg-transparent border-2 border-slate-200 dark:border-card-border text-slate-700 dark:text-white font-semibold py-3.5 rounded-full hover:bg-slate-50 dark:hover:bg-[#334155] transition-all">
                                        <span className="material-symbols-outlined text-[22px]">request_quote</span>
                                        Pedir Orçamento
                                    </button>
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-card-border space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 dark:text-text-secondary flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">schedule</span> Funcionamento
                                        </span>
                                        <span className="font-medium text-green-600 dark:text-green-400">Aberto agora</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 dark:text-text-secondary flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">timer</span> Tempo de resp.
                                        </span>
                                        <span className="font-medium text-slate-700 dark:text-white">~ 5 min</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-card-dark rounded-xl p-6 border border-gray-100 dark:border-card-border">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Informações de Contato</h3>
                                <ul className="space-y-4">
                                    <li>
                                        <a className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors group" href="#">
                                            <div className="size-8 rounded-full bg-gray-100 dark:bg-[#334155] flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">language</span>
                                            </div>
                                            <span className="text-sm font-medium">www.fastclean.com.br</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors group" href="#">
                                            <div className="size-8 rounded-full bg-gray-100 dark:bg-[#334155] flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                                            </div>
                                            <span className="text-sm font-medium">@fastclean.sp</span>
                                        </a>
                                    </li>
                                    <li>
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                            <div className="size-8 rounded-full bg-gray-100 dark:bg-[#334155] flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-[18px]">map</span>
                                            </div>
                                            <span className="text-sm font-medium leading-tight">Rua das Palmeiras, 123 - Santa Cecília, São Paulo - SP</span>
                                        </div>
                                    </li>
                                </ul>
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-card-border">
                                    <div className="w-full h-32 rounded-lg bg-gray-200 dark:bg-[#334155] overflow-hidden relative">
                                        <div className="w-full h-full bg-cover bg-center opacity-60 dark:opacity-40" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCzRVaMmTtbz-50Vxt17eTus7xKsRsuKBsRpowkKH8f4EbWzJZ_79ZVUvTLf-S3AtSXo9GLV0xHZhfTMQwNyRpZ3C6NBkTlKZmT3Yqc8rq1BuUxFRbjjzXYTocVXv9OKs55fRkp5Tch-eugL0ycYZZkNS7_L3RAYxKD63IVMEJRxx3uj3DFxIWUN7faCClTV9_dgmLnJYy6P-rTUGNWKAIEO4qjWyFwQN8BXZAzltrfjMkiGYVoy3zQBZPp3RRk9mJsZDJFupOWv2OO')" }}></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <button className="px-3 py-1 bg-white/90 dark:bg-black/70 text-xs font-bold rounded-full backdrop-blur-sm shadow-sm hover:bg-white dark:hover:bg-black transition-colors">
                                                Ver no mapa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Request Quote Modal */}
            {showQuoteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-card-dark rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
                        {quoteSent ? (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-4xl">check</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Pedido Enviado!</h3>
                                <p className="text-slate-500">A empresa recebeu sua solicitação e entrará em contato em breve.</p>
                            </div>
                        ) : (
                            <>
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-card-border flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Solicitar Orçamento Grátis</h3>
                                    <button onClick={() => setShowQuoteModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                                <form onSubmit={handleSendQuote} className="p-6 space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Seu Nome</label>
                                        <input required type="text" className="w-full bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-card-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary" placeholder="Como podemos te chamar?" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Seu Contato (WhatsApp)</label>
                                        <input required type="tel" className="w-full bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-card-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary" placeholder="(DDD) 00000-0000" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">O que você precisa?</label>
                                        <textarea required rows={3} className="w-full bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-card-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Descreva brevemente o problema (ex: ratos no telhado, baratas na cozinha...)" />
                                    </div>
                                    <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 mt-2 transition-all">
                                        Enviar Solicitação
                                    </button>
                                    <p className="text-center text-xs text-slate-400">Seus dados são enviados apenas para esta empresa.</p>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};