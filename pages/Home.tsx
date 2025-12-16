import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';
import { Company } from '../types';
import { getCompanyInitials } from '../src/lib/utils';

export const Home: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchLocation, setSearchLocation] = useState('');
    const [isPremiumOnly, setIsPremiumOnly] = useState(false);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .eq('status', 'Aprovado')
                .order('is_premium', { ascending: false })
                .order('rating', { ascending: false });

            if (error) {
                console.error('Error fetching companies:', error);
                setCompanies([]);
                return;
            }

            if (data) {
                const mappedCompanies: Company[] = data.map((item) => ({
                    id: item.slug, // Usando slug como id para URLs
                    slug: item.slug,
                    name: item.name,
                    rating: item.rating || 0,
                    reviews: item.reviews || 0,
                    location: item.location || '',
                    shortLocation: item.short_location || '',
                    description: item.description,
                    cep: item.cep,
                    street: item.street,
                    number: item.number,
                    neighborhood: item.neighborhood,
                    city: item.city,
                    state: item.state,
                    tags: item.tags || [],
                    specialties: item.specialties || [],
                    imageUrl: item.image_url,
                    whatsapp: item.whatsapp,
                    isPremium: item.is_premium || false,
                    status: item.status || 'Pendente'
                }));
                setCompanies(mappedCompanies);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredCompanies = companies.filter(c => {
        const matchesLocation = searchLocation === '' ||
            c.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
            c.shortLocation.toLowerCase().includes(searchLocation.toLowerCase());

        const matchesPremium = !isPremiumOnly || c.isPremium;

        return matchesLocation && matchesPremium;
    });

    return (
        <div className="flex flex-col min-h-screen">
            <section className="relative bg-background-dark border-b border-card-border overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-30">
                    <img className="w-full h-full object-cover" alt="Background pattern" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzye5-FUUCAoX_D-vwabk5O_ed_30rApSJgD3CUbLD5pxE1Kzfu_cD90t2_gpnXx3tHHNsFWbaPr9JgrL-38RdQFPn3_1Cu4hFN0LS_G1qQRtmusxMTUZ-rzUs9WGoTJe7fwvSs2BRw-fWPV9sO-UAmpRHkShjmFcxFCZhrxHsrMMHo2Klra3RCe0EJD7laUE9WvktAC536J1s5uc46nPthagp8Y4IDDA76XyrcVXsgfvSjqMWA29cAwQUCuitJMt53DL6Eza2HXNi" />
                    <div className="absolute inset-0 bg-gradient-to-b from-background-dark via-background-dark/90 to-background-dark"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 flex flex-col items-center text-center">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 max-w-3xl">
                        Encontre uma controladora de pragas <span className="text-primary">confiável</span> na sua região
                    </h1>
                    <p className="text-slate-400 text-base md:text-lg mb-8 max-w-2xl">
                        Conecte-se rapidamente com empresas verificadas, compare avaliações e solicite orçamento via WhatsApp em segundos.
                    </p>
                    <div className="w-full max-w-4xl bg-card-dark border border-card-border p-3 rounded-2xl shadow-2xl shadow-blue-900/10 flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                <span className="material-symbols-outlined">location_on</span>
                            </div>
                            <input
                                value={searchLocation}
                                onChange={(e) => setSearchLocation(e.target.value)}
                                className="w-full bg-background-dark/50 border border-card-border rounded-xl h-12 pl-12 pr-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                                placeholder="Cidade ou Bairro (Ex: Moema, SP)"
                                type="text"
                            />
                        </div>
                        <div className="flex-1 relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                <span className="material-symbols-outlined">pest_control</span>
                            </div>
                            <select className="w-full bg-background-dark/50 border border-card-border rounded-xl h-12 pl-12 pr-10 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none transition-all outline-none cursor-pointer">
                                <option disabled defaultValue="">Tipo de Serviço / Praga</option>
                                <option value="all">Todos os serviços</option>
                                <option value="termites">Dedetização de Cupins</option>
                                <option value="ants">Formigas e Baratas</option>
                                <option value="rats">Desratização</option>
                                <option value="sanitize">Sanitização de Ambientes</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                <span className="material-symbols-outlined">expand_more</span>
                            </div>
                        </div>
                        <button className="bg-primary hover:bg-primary-hover text-white font-bold h-12 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(0,120,215,0.4)] hover:shadow-[0_0_25px_rgba(0,120,215,0.6)] flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">search</span>
                            <span>Buscar</span>
                        </button>
                    </div>
                </div>
            </section>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                        <div className="flex items-center justify-between lg:hidden">
                            <h3 className="text-xl font-bold text-white">Filtros</h3>
                            <button className="text-primary text-sm font-medium">Limpar tudo</button>
                        </div>
                        <div className="bg-card-dark border border-card-border rounded-xl p-5">
                            <div className="flex items-center gap-3">
                                <div className="relative flex items-center">
                                    <input
                                        checked={isPremiumOnly}
                                        onChange={() => setIsPremiumOnly(!isPremiumOnly)}
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-card-border bg-background-dark checked:border-primary checked:bg-primary transition-all"
                                        id="premium-filter"
                                        type="checkbox"
                                    />
                                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
                                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                                    </span>
                                </div>
                                <label className="text-white font-medium cursor-pointer select-none flex items-center gap-2" htmlFor="premium-filter">
                                    Apenas Premium
                                    <span className="material-symbols-outlined text-primary text-sm filled">verified</span>
                                </label>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tipo de Atendimento</h4>
                            <div className="flex flex-wrap gap-2">
                                <button className="px-3 py-1.5 rounded-full bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20">Residencial</button>
                                <button className="px-3 py-1.5 rounded-full bg-card-dark border border-card-border text-slate-300 hover:border-primary hover:text-white text-sm font-medium transition-colors">Comercial</button>
                                <button className="px-3 py-1.5 rounded-full bg-card-dark border border-card-border text-slate-300 hover:border-primary hover:text-white text-sm font-medium transition-colors">Condomínios</button>
                                <button className="px-3 py-1.5 rounded-full bg-card-dark border border-card-border text-slate-300 hover:border-primary hover:text-white text-sm font-medium transition-colors">Industrial</button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Ordenar por</h4>
                            <div className="relative">
                                <select className="w-full bg-card-dark border border-card-border text-white text-sm rounded-lg p-3 appearance-none focus:outline-none focus:border-primary cursor-pointer">
                                    <option>Mais relevantes</option>
                                    <option>Menor distância</option>
                                    <option>Melhor avaliados</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                    <span className="material-symbols-outlined">sort</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-slate-400 text-sm"><span className="text-white font-bold">{filteredCompanies.length}</span> empresas encontradas</p>
                            <div className="hidden lg:block text-right">
                                <span className="text-xs text-slate-500">Exibindo resultados para "São Paulo"</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {loading ? (
                                // Loading skeleton
                                Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="bg-card-dark border border-card-border rounded-2xl overflow-hidden flex flex-col p-5">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-14 h-14 rounded-full shimmer shrink-0"></div>
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-5 w-3/4 shimmer rounded"></div>
                                                <div className="h-4 w-1/2 shimmer rounded"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-3 mb-5 flex-1">
                                            <div className="h-4 w-full shimmer rounded"></div>
                                            <div className="flex gap-2 pt-1">
                                                <div className="h-6 w-16 shimmer rounded-md"></div>
                                                <div className="h-6 w-16 shimmer rounded-md"></div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 mt-auto">
                                            <div className="h-11 w-full shimmer rounded-xl"></div>
                                            <div className="h-11 w-full shimmer rounded-xl"></div>
                                        </div>
                                    </div>
                                ))
                            ) : filteredCompanies.length === 0 ? (
                                <article className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-3 bg-card-dark/30 border border-dashed border-card-border rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-card-dark flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-slate-500 text-3xl">search_off</span>
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-1">Nenhuma empresa encontrada</h3>
                                    <p className="text-slate-400 text-sm mb-4">Tente expandir sua busca para regiões próximas ou remova alguns filtros.</p>
                                    <button onClick={() => { setSearchLocation(''); setIsPremiumOnly(false); }} className="text-primary hover:underline text-sm font-medium">Limpar todos os filtros</button>
                                </article>
                            ) : (
                                filteredCompanies.map(company => (
                                <div
                                    key={company.id}
                                    className={`group relative bg-card-dark border ${company.isPremium ? 'border-primary/50 shadow-xl shadow-primary/5 hover:shadow-primary/15' : 'border-card-border hover:border-slate-500 hover:shadow-lg hover:shadow-black/20'} rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-1`}
                                >
                                    {company.isPremium && (
                                        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10 flex items-center gap-1 shadow-sm">
                                            <span className="material-symbols-outlined text-[14px] filled">star</span>
                                            Destaque
                                        </div>
                                    )}
                                    <div className="p-5 flex flex-col h-full">
                                        <Link to={`/company/${company.id}`} className="flex items-start gap-4 mb-4 group-hover:opacity-90 transition-opacity">
                                            {company.imageUrl ? (
                                                <div className={`w-14 h-14 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 ${company.isPremium ? 'border-2 border-primary/20' : 'border border-slate-700'}`}>
                                                    <img className="w-full h-full object-cover" src={company.imageUrl} alt={company.name} />
                                                </div>
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-700">
                                                    <span className="text-xl font-bold text-slate-400">{getCompanyInitials(company.name)}</span>
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-white font-bold text-lg leading-tight group-hover:text-primary transition-colors">{company.name}</h3>
                                                <div className="flex items-center gap-1 mt-1 text-yellow-400">
                                                    <span className="material-symbols-outlined text-[16px] filled">star</span>
                                                    <span className="text-white text-sm font-bold">{company.rating}</span>
                                                    <span className="text-slate-500 text-xs ml-1">({company.reviews} avaliações)</span>
                                                </div>
                                            </div>
                                        </Link>
                                        <div className="space-y-3 mb-5 flex-1">
                                            <div className="flex items-start gap-2 text-slate-300 text-sm">
                                                <span className={`material-symbols-outlined ${company.isPremium ? 'text-primary' : 'text-slate-500'} text-[18px] mt-0.5`}>location_on</span>
                                                <span className="leading-snug">{company.location}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {company.tags.map(tag => (
                                                    <span key={tag} className="bg-background-dark border border-card-border text-slate-400 text-xs px-2 py-1 rounded-md">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 mt-auto">
                                            {company.whatsapp && company.whatsapp !== 'Não informado' ? (
                                                <a
                                                    href={`https://wa.me/55${company.whatsapp.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">chat</span>
                                                    Chamar no WhatsApp
                                                </a>
                                            ) : (
                                                <button disabled className="w-full bg-slate-700 text-slate-400 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed opacity-70">
                                                    <span className="material-symbols-outlined text-[20px]">block</span>
                                                    WhatsApp Indisponível
                                                </button>
                                            )}

                                            <Link
                                                to={`/company/${company.id}`}
                                                className="w-full bg-transparent border border-card-border hover:border-white text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-center"
                                            >
                                                Ver perfil completo
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};