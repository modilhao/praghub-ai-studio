import React from 'react';
import { Link } from 'react-router-dom';

export const LandingPartner: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-background-dark">
            {/* Hero Section */}
            <section className="bg-background-dark py-20 lg:py-24 relative overflow-hidden border-b border-card-border text-center">
                <div className="absolute inset-0 z-0 opacity-20">
                    <img className="w-full h-full object-cover" alt="Background pattern" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzye5-FUUCAoX_D-vwabk5O_ed_30rApSJgD3CUbLD5pxE1Kzfu_cD90t2_gpnXx3tHHNsFWbaPr9JgrL-38RdQFPn3_1Cu4hFN0LS_G1qQRtmusxMTUZ-rzUs9WGoTJe7fwvSs2BRw-fWPV9sO-UAmpRHkShjmFcxFCZhrxHsrMMHo2Klra3RCe0EJD7laUE9WvktAC536J1s5uc46nPthagp8Y4IDDA76XyrcVXsgfvSjqMWA29cAwQUCuitJMt53DL6Eza2HXNi" />
                    <div className="absolute inset-0 bg-gradient-to-b from-background-dark via-background-dark/95 to-background-dark"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
                        Sua empresa de controle de pragas precisa de <span className="text-primary">mais contratos</span>, não de mais promessas.
                    </h1>
                    <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
                        O PragHub conecta sua empresa a clientes que já estão procurando controle de pragas — com contato direto, visibilidade regional e vantagens competitivas.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="bg-primary hover:bg-primary-hover text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-primary/30 transition-all text-lg flex items-center justify-center gap-2">
                            Cadastre sua empresa gratuitamente
                            <span className="material-symbols-outlined">rocket_launch</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Problem Recognition */}
            <section className="py-16 bg-background-dark">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Se você vive de controle de pragas, provavelmente já percebeu:
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto mb-10">
                        {[
                            'Indicação não escala',
                            'WhatsApp chega sem contexto',
                            'Concorrentes "mais baratos" confundem o cliente',
                            'O cliente não entende a diferença entre empresas',
                            'Fica difícil crescer sem virar refém de anúncio'
                        ].map((issue, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-200 p-4 border border-card-border rounded-xl">
                                <span className="material-symbols-outlined text-red-400">warning</span>
                                <span>{issue}</span>
                            </div>
                        ))}
                    </div>

                    <p className="text-xl font-medium text-slate-200">
                        👉 O problema não é seu serviço. <strong>É como ele é encontrado e percebido.</strong>
                    </p>
                </div>
            </section>

            {/* Solution / Consideration */}
            <section className="py-16 bg-background-dark">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-6">
                            O cliente mudou.
                        </h2>
                        <p className="text-lg text-slate-200">
                            Antes de chamar no WhatsApp, o cliente quer comparar opções, sentir confiança e entender se você atende o problema dele.
                        </p>
                    </div>

                    <div className="bg-card-dark p-8 rounded-2xl shadow-sm border border-card-border text-center">
                        <p className="text-xl font-bold text-primary">
                            O PragHub existe para organizar essa decisão a seu favor.
                        </p>
                    </div>
                </div>
            </section>

            {/* Value V1 */}
            <section className="py-20 bg-background-dark">
                <div className="max-w-5xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-white mb-12 text-center">O que você já ganha ao entrar agora</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <div className="p-3 bg-blue-900/20 text-blue-400 rounded-xl w-fit">
                                <span className="material-symbols-outlined text-3xl">visibility</span>
                            </div>
                            <h3 className="text-xl font-bold text-white">Visibilidade qualificada</h3>
                            <p className="text-slate-300 text-sm">Sua empresa aparece em um diretório especializado. Busca por cidade, bairro e praga. Cliente chega com intenção real.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="p-3 bg-green-900/20 text-green-400 rounded-xl w-fit">
                                <span className="material-symbols-outlined text-3xl">chat</span>
                            </div>
                            <h3 className="text-xl font-bold text-white">Contato direto</h3>
                            <p className="text-slate-300 text-sm">Sem intermediários. Sem comissão por lead. O cliente fala direto com você via WhatsApp.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="p-3 bg-primary/10 text-primary rounded-xl w-fit">
                                <span className="material-symbols-outlined text-3xl">rocket_launch</span>
                            </div>
                            <h3 className="text-xl font-bold text-white">Plataforma simples</h3>
                            <p className="text-slate-300 text-sm">Cadastro rápido. Perfil claro. Nada de painel complicado. Você entra, configura e usa.</p>
                        </div>
                    </div>

                    <div className="mt-16 p-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <span className="material-symbols-outlined text-9xl">verified</span>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined filled text-yellow-500">star</span>
                                Destaque Premium (Opcional)
                            </h3>
                            <p className="text-slate-200 max-w-2xl mb-4">
                                Empresas Premium aparecem com prioridade, ganham mais atenção e se posicionam como referência.
                            </p>
                            <p className="text-sm font-bold text-yellow-300 italic">
                                "Premium não é para todo mundo. É para quem quer ser escolhido primeiro."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Risk Reduction */}
            <section className="py-16 bg-background-dark text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-2xl font-bold text-white mb-8">PragHub não prende você</h2>
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                        {['Sem contrato longo', 'Sem taxa escondida', 'Sem obrigação de upgrade'].map((item, i) => (
                            <span key={i} className="px-4 py-2 bg-card-dark rounded-full shadow-sm border border-card-border text-slate-200 font-medium text-sm">
                                {item}
                            </span>
                        ))}
                    </div>
                    <p className="text-xl font-bold text-primary">👉 Risco baixo. Potencial alto.</p>
                </div>
            </section>

            {/* V2 Anticipation */}
            <section className="py-20 bg-background-dark text-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary font-bold text-xs mb-4 border border-primary/30">PragHub 2.0</span>
                    <h2 className="text-3xl font-bold mb-4">Quem entra antes, constrói vantagem depois.</h2>
                    <p className="text-slate-300 mb-12">A versão 2.0 vai trazer o que nenhuma controladora tem sozinha.</p>

                    <div className="grid md:grid-cols-3 gap-6 text-left">
                        <div className="border border-card-border p-6 rounded-xl bg-card-dark">
                            <h3 className="font-bold text-lg mb-2 text-primary">Diagnóstico inteligente</h3>
                            <p className="text-sm text-slate-300">Enxergue onde sua empresa perde oportunidades.</p>
                        </div>
                        <div className="border border-card-border p-6 rounded-xl bg-card-dark">
                            <h3 className="font-bold text-lg mb-2 text-primary">Inteligência de demanda</h3>
                            <p className="text-sm text-slate-300">Saiba quais serviços são mais buscados e onde.</p>
                        </div>
                        <div className="border border-card-border p-6 rounded-xl bg-card-dark">
                            <h3 className="font-bold text-lg mb-2 text-primary">Camadas de confiança</h3>
                            <p className="text-sm text-slate-300">Mecanismos para destacar empresas preparadas.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Qualification */}
            <section className="py-16 md:py-24 bg-background-dark">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-8 rounded-2xl border border-green-500/30 bg-green-900/20">
                            <h3 className="text-xl font-bold text-green-300 mb-6">O PragHub é para você se:</h3>
                            <ul className="space-y-4">
                                {['Quer crescer de forma organizada', 'Atende bem seus clientes', 'Quer menos dependência de indicação', 'Entende que posicionamento importa'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-slate-200">
                                        <span className="material-symbols-outlined text-green-300">check</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-8 rounded-2xl border border-red-500/30 bg-red-900/20">
                            <h3 className="text-xl font-bold text-red-300 mb-6">Não é para você se:</h3>
                            <ul className="space-y-4">
                                {['Você só compete por preço', 'Não responde clientes', 'Não se preocupa com imagem e confiança'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-slate-200">
                                        <span className="material-symbols-outlined text-red-300">close</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Licensed Companies */}
            <section className="py-16 bg-background-dark border-t border-card-border">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-white mb-12">
                        Empresas Licenciadas PragHub
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Dedetizadora Dedemax */}
                        <div className="bg-card-dark p-6 rounded-2xl border border-card-border shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-bold text-white mb-2">Dedetizadora Dedemax</h3>
                            <p className="text-slate-300 text-sm mb-4">
                                Com atuação consolidada em Cerquilho (SP) e região, a Dedemax se posiciona como parceira confiável no controle de pragas urbanas, oferecendo soluções para residências, empresas, indústrias e órgãos públicos. <a href="https://dedetizadoradedemax.com.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">dedetizadoradedemax.com.br</a>
                            </p>
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <h4 className="font-bold text-primary text-sm mb-2">Por que é um prestador‐referência PragHub:</h4>
                                <ul className="space-y-1 text-sm text-slate-200">
                                    <li className="flex items-start gap-2"><span className="material-symbols-outlined text-[16px] text-green-400 mt-0.5">check_circle</span> Foco claro em qualidade, tecnologia e transparência.</li>
                                    <li className="flex items-start gap-2"><span className="material-symbols-outlined text-[16px] text-green-400 mt-0.5">check_circle</span> Carteira de clientes expressiva, incluindo escolas e órgãos públicos.</li>
                                    <li className="flex items-start gap-2"><span className="material-symbols-outlined text-[16px] text-green-400 mt-0.5">check_circle</span> Comunicação direta e amigável.</li>
                                </ul>
                                <p className="mt-3 text-xs italic text-slate-300">
                                    "A Dedemax se uniu à rede PragHub para ampliar sua visibilidade e foco no serviço, enquanto a plataforma cuida da gestão e dos chamados. Resultado: mais contratos recorrentes, menos carga administrativa."
                                </p>
                            </div>
                        </div>

                        {/* Detecta Dedetizadora */}
                        <div className="bg-card-dark p-6 rounded-2xl border border-card-border shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-bold text-white mb-2">Detecta Dedetizadora</h3>
                            <p className="text-slate-300 text-sm mb-4">
                                Localizada em Campinas (SP), a Detecta se destaca pelo modelo de atuação ampliada — unidades próprias + franquias — e pela oferta de serviços completos para residências, indústrias e comércios.
                            </p>
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <h4 className="font-bold text-primary text-sm mb-2">Por que é um prestador‐referência PragHub:</h4>
                                <ul className="space-y-1 text-sm text-slate-200">
                                    <li className="flex items-start gap-2"><span className="material-symbols-outlined text-[16px] text-green-400 mt-0.5">check_circle</span> Estrutura robusta com monitoramento contínuo.</li>
                                    <li className="flex items-start gap-2"><span className="material-symbols-outlined text-[16px] text-green-400 mt-0.5">check_circle</span> Modelo de rede/franquia que demonstra escala e credibilidade.</li>
                                </ul>
                                <p className="mt-3 text-xs italic text-slate-300">
                                    "Com a Detecta integrando a rede PragHub, nossos clientes ganharam acesso a técnicos com escala e cobertura regional – e a Detecta ampliou seu pipeline de contratos corporativos com a robustez de nossa plataforma."
                                </p>
                            </div>
                        </div>

                        {/* Ártica Saúde Ambiental */}
                        <div className="bg-card-dark p-6 rounded-2xl border border-card-border shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-bold text-white mb-2">Ártica Saúde Ambiental</h3>
                            <p className="text-slate-300 text-sm mb-4">
                                A Ártica atua há mais de 25 anos no ramo de controle de pragas, com soluções sustentáveis, tecnologia moderna e atendimento emergencial 24h. <a href="https://articaambiental.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">articaambiental.com</a>
                            </p>
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <h4 className="font-bold text-primary text-sm mb-2">Por que é um prestador‐referência PragHub:</h4>
                                <ul className="space-y-1 text-sm text-slate-200">
                                    <li className="flex items-start gap-2"><span className="material-symbols-outlined text-[16px] text-green-400 mt-0.5">check_circle</span> Mais de 25 anos de mercado, transmitindo confiança.</li>
                                    <li className="flex items-start gap-2"><span className="material-symbols-outlined text-[16px] text-green-400 mt-0.5">check_circle</span> Abordagem orientada para excelência e sustentabilidade.</li>
                                </ul>
                                <p className="mt-3 text-xs italic text-slate-300">
                                    "A Ártica escolheu o selo PragHub para oficializar sua qualidade e aumentar sua penetração em clientes que exigem compliance e rigidez técnica – hoje, é um dos nossos prestadores premium."
                                </p>
                            </div>
                        </div>

                        {/* DEDEMAX Dedetizadora (Facilities) */}
                        <div className="bg-card-dark p-6 rounded-2xl border border-card-border shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-bold text-white mb-2">DEDEMAX (Facilities)</h3>
                            <p className="text-slate-300 text-sm mb-4">
                                A DEDEMAX, com 12 anos de atividade, oferece soluções de desinsetização, desratização, limpeza de caixas d'água, sanitização e outros serviços, para empresas, indústrias e residências.
                            </p>
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <h4 className="font-bold text-primary text-sm mb-2">Por que é um prestador‐referência PragHub:</h4>
                                <ul className="space-y-1 text-sm text-slate-200">
                                    <li className="flex items-start gap-2"><span className="material-symbols-outlined text-[16px] text-green-400 mt-0.5">check_circle</span> Transparência profunda, demonstrando seriedade com compliance.</li>
                                    <li className="flex items-start gap-2"><span className="material-symbols-outlined text-[16px] text-green-400 mt-0.5">check_circle</span> Amplo espectro de serviços, alinhado à proposição de "facilities" do PragHub.</li>
                                </ul>
                                <p className="mt-3 text-xs italic text-slate-300">
                                    "A DEDEMAX integra nossa rede e traz a oferta completa de facilities (pragas + sanitização + limpeza de reservatórios) para clientes PragHub que querem um único prestador homologado e confiável."
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <a
                            href="https://wa.me/5511973241927"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
                        >
                            <span className="material-symbols-outlined">chat</span>
                            Mais Informações no WhatsApp
                        </a>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20 bg-primary text-white text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-8">Comece agora. Evolua junto.</h2>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="bg-card-dark border border-primary text-primary hover:bg-primary hover:text-white font-bold py-4 px-8 rounded-full shadow-lg transition-all text-lg flex items-center justify-center gap-2">
                            Cadastrar minha empresa
                            <span className="material-symbols-outlined">rocket_launch</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};
