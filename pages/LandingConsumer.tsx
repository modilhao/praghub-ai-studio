import React from 'react';
import { Link } from 'react-router-dom';

export const LandingConsumer: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
            {/* Hero Section */}
            <section className="bg-background-dark py-20 lg:py-24 relative overflow-hidden border-b border-card-border">
                <div className="absolute inset-0 z-0 opacity-20">
                    <img className="w-full h-full object-cover" alt="Background pattern" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzye5-FUUCAoX_D-vwabk5O_ed_30rApSJgD3CUbLD5pxE1Kzfu_cD90t2_gpnXx3tHHNsFWbaPr9JgrL-38RdQFPn3_1Cu4hFN0LS_G1qQRtmusxMTUZ-rzUs9WGoTJe7fwvSs2BRw-fWPV9sO-UAmpRHkShjmFcxFCZhrxHsrMMHo2Klra3RCe0EJD7laUE9WvktAC536J1s5uc46nPthagp8Y4IDDA76XyrcVXsgfvSjqMWA29cAwQUCuitJMt53DL6Eza2HXNi" />
                    <div className="absolute inset-0 bg-gradient-to-b from-background-dark via-background-dark/95 to-background-dark"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
                        Encontre empresas de controle de pragas <span className="text-primary">confiáveis</span>, na sua região.
                    </h1>
                    <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                        Contratar controle de pragas não é só resolver um problema imediato. É evitar riscos operacionais, sanitários e reputacionais.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/" className="bg-primary hover:bg-primary-hover text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-primary/30 transition-all text-lg flex items-center justify-center gap-2">
                            Encontrar uma empresa agora
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                        <Link to="/" className="bg-card-dark border border-card-border hover:border-white text-white font-bold py-4 px-8 rounded-full transition-all text-lg flex items-center justify-center gap-2">
                            Buscar por cidade e tipo de serviço
                            <span className="material-symbols-outlined">search</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Problem Section */}
            <section className="py-16 md:py-24 bg-white dark:bg-background-dark">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                            O problema não é encontrar alguém.<br />
                            <span className="text-red-500">É contratar errado.</span>
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-300">
                            No ambiente B2B, uma contratação mal feita pode gerar:
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {[
                            { icon: 'block', title: 'Interdição de áreas' },
                            { icon: 'campaign', title: 'Reclamações de clientes ou moradores' },
                            { icon: 'health_and_safety', title: 'Problemas com vigilância sanitária' },
                            { icon: 'sync_problem', title: 'Retrabalho e troca de fornecedor' },
                            { icon: 'gavel', title: 'Risco jurídico e de imagem' },
                        ].map((item, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-card-dark p-6 rounded-xl border border-slate-100 dark:border-card-border flex flex-col items-center text-center">
                                <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full mb-4">
                                    <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.title}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-6 text-center">
                        <p className="text-xl font-medium text-red-800 dark:text-red-300">
                            👉 Preço não é o maior risco. <strong>Escolher mal é.</strong>
                        </p>
                    </div>
                </div>
            </section>

            {/* Solution Section */}
            <section className="py-16 md:py-24 bg-slate-50 dark:bg-[#0f172a]">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                            Como o PragHub ajuda você a decidir melhor
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                            O PragHub não é um site de anúncios. É uma plataforma pensada para <strong>reduzir incerteza na contratação</strong>.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="shrink-0 p-3 bg-primary/10 rounded-xl h-fit">
                                    <span className="material-symbols-outlined text-primary text-3xl">search</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Busca objetiva</h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Filtre empresas por cidade, bairro, tipo de praga e tipo de atendimento. Sem perder tempo com quem não atende sua necessidade.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="shrink-0 p-3 bg-primary/10 rounded-xl h-fit">
                                    <span className="material-symbols-outlined text-primary text-3xl">badge</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Perfis claros e profissionais</h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Cada empresa tem um perfil com serviços prestados, regiões e informações essenciais. Menos improviso.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="shrink-0 p-3 bg-primary/10 rounded-xl h-fit">
                                    <span className="material-symbols-outlined text-primary text-3xl">chat</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Contato direto e rápido</h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Fale via WhatsApp com mensagem contextualizada. Sem intermediários. Você resolve rápido e com quem executa.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-card-dark p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-card-border relative">
                            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl shadow-sm">
                                Destaque
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary filled">verified</span>
                                Empresas Premium
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm">
                                Empresas Premium aparecem com prioridade por maior preparo, organização e compromisso profissional.
                            </p>
                            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                <p className="text-sm text-primary font-medium italic">
                                    "Não é garantia automática. É sinal de posicionamento e seriedade."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Target Audience */}
            <section className="py-16 md:py-24 bg-white dark:bg-background-dark">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">Para quem o PragHub foi criado</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-6 rounded-2xl border border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-900/30">
                            <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined">check_circle</span> Ideal para:
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    'Síndicos e administradoras de condomínios',
                                    'Gestores de facilities',
                                    'Empresas de limpeza e manutenção',
                                    'Comércios, indústrias e escritórios',
                                    'Responsáveis por compras e contratos'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-green-600 text-sm mt-1">check</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-6 rounded-2xl border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/30">
                            <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined">cancel</span> Não é indicado para:
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    'Quem busca apenas o menor preço',
                                    'Quem contrata sem critérios',
                                    'Situações informais ou improvisadas'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-red-600 text-sm mt-1">close</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Future Section (V2) */}
            <section className="py-20 bg-background-dark text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary font-bold text-xs mb-4 border border-primary/30">EM BREVE</span>
                    <h2 className="text-3xl font-bold mb-4">O que está chegando no PragHub 2.0</h2>
                    <p className="text-xl text-slate-400 mb-12">(mais segurança na decisão)</p>

                    <div className="grid md:grid-cols-3 gap-6 text-left">
                        <div className="bg-card-dark p-6 rounded-xl border border-card-border">
                            <div className="p-2 bg-slate-800 rounded-lg w-fit mb-4">
                                <span className="material-symbols-outlined text-primary">security</span>
                            </div>
                            <h3 className="font-bold text-lg mb-2">Indicadores de confiança</h3>
                            <p className="text-slate-400 text-sm">Critérios objetivos de diferenciação. Menos dúvida, mais segurança.</p>
                        </div>
                        <div className="bg-card-dark p-6 rounded-xl border border-card-border">
                            <div className="p-2 bg-slate-800 rounded-lg w-fit mb-4">
                                <span className="material-symbols-outlined text-primary">insights</span>
                            </div>
                            <h3 className="font-bold text-lg mb-2">Match mais inteligente</h3>
                            <p className="text-slate-400 text-sm">Conectar o tipo certo de empresa com a demanda certa.</p>
                        </div>
                        <div className="bg-card-dark p-6 rounded-xl border border-card-border">
                            <div className="p-2 bg-slate-800 rounded-lg w-fit mb-4">
                                <span className="material-symbols-outlined text-primary">history</span>
                            </div>
                            <h3 className="font-bold text-lg mb-2">Histórico e contexto</h3>
                            <p className="text-slate-400 text-sm">Saiba se a empresa atua frequentemente em ambientes como o seu.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 bg-primary text-white text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-8">Comece agora</h2>
                    <p className="text-xl opacity-90 mb-10 max-w-xl mx-auto">
                        Você não precisa criar conta para buscar. Não precisa contrato. Não precisa compromisso inicial.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/" className="bg-white text-primary hover:bg-slate-100 font-bold py-4 px-8 rounded-full shadow-lg transition-all text-lg flex items-center justify-center gap-2">
                            Encontrar empresas agora
                            <span className="material-symbols-outlined">search</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};
