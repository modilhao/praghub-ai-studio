import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';
import { Company } from '../types';
import { getCompanyInitials } from '../src/lib/utils';
import { useAuth } from '../src/contexts/AuthContext';

export const Admin: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'companies'>('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pendente' | 'Aprovado' | 'Rejeitado'>('Todos');
    const [premiumFilter, setPremiumFilter] = useState<'Todos' | 'Premium' | 'Não Premium'>('Todos');
    const navigate = useNavigate();
    const { signOut } = useAuth();

    useEffect(() => {
        if (activeTab === 'companies') {
            fetchCompanies();
        } else {
            // Garantir que loading seja false quando estiver na aba dashboard
            setLoading(false);
        }
    }, [activeTab, statusFilter, premiumFilter, searchQuery]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('companies')
                .select('*')
                .order('created_at', { ascending: false });

            // Aplicar filtros
            if (statusFilter !== 'Todos') {
                query = query.eq('status', statusFilter);
            }

            if (premiumFilter === 'Premium') {
                query = query.eq('is_premium', true);
            } else if (premiumFilter === 'Não Premium') {
                query = query.eq('is_premium', false);
            }

            // Aplicar busca
            if (searchQuery.trim()) {
                query = query.or(`name.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%`);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching companies:', error);
                setCompanies([]);
                return;
            }

            if (data) {
                const mappedCompanies: Company[] = data.map((item) => ({
                    id: item.slug, // Usando slug como id para consistência
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
                    status: item.status || 'Pendente',
                    cnpj: item.cnpj
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

    const handleUpdateCompany = async (companyId: string, updates: Partial<Company>) => {
        try {
            // Converter camelCase para snake_case
            const dbUpdates: any = {};
            if (updates.status) dbUpdates.status = updates.status;
            if (updates.isPremium !== undefined) dbUpdates.is_premium = updates.isPremium;
            if (updates.name) dbUpdates.name = updates.name;
            if (updates.whatsapp) dbUpdates.whatsapp = updates.whatsapp;
            if (updates.location) dbUpdates.location = updates.location;

            const { error } = await supabase
                .from('companies')
                .update(dbUpdates)
                .eq('slug', companyId); // Usar slug para identificar

            if (error) throw error;

            // Atualizar lista local
            setCompanies(prev => prev.map(c => 
                c.id === companyId ? { ...c, ...updates } : c
            ));

            setToastVisible(true);
            setTimeout(() => setToastVisible(false), 3000);
        } catch (error) {
            console.error('Error updating company:', error);
            alert('Erro ao atualizar empresa.');
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };
    
    const handleEdit = (company: Company) => {
        setSelectedCompany(company);
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompany) return;
        
        const form = e.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        
        const status = (formData.get('status') as string) || selectedCompany.status;
        const isPremiumCheckbox = form.querySelector('input[name="isPremium"]') as HTMLInputElement;
        const isPremium = isPremiumCheckbox?.checked ?? selectedCompany.isPremium;
        const name = (formData.get('name') as string) || selectedCompany.name;
        const whatsapp = (formData.get('whatsapp') as string) || selectedCompany.whatsapp;
        const location = (formData.get('location') as string) || selectedCompany.location;

        handleUpdateCompany(selectedCompany.id, {
            status: status as 'Pendente' | 'Aprovado' | 'Rejeitado',
            isPremium,
            name,
            whatsapp,
            location
        });

        setIsModalOpen(false);
    };

    return (
        <div className="flex h-screen w-full relative bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
            <aside className="hidden md:flex w-72 flex-col border-r border-surface-border bg-background-dark h-full shrink-0 z-20">
                <div className="p-6 flex items-center gap-3">
                    <div className="size-10 rounded-full bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
                        P
                    </div>
                    <div>
                        <h1 className="text-white text-lg font-bold leading-tight tracking-tight">PragHub</h1>
                        <p className="text-text-secondary text-xs font-medium">Super Admin</p>
                    </div>
                </div>
                <nav className="flex-1 px-4 flex flex-col gap-2 mt-4">
                    <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${activeTab === 'dashboard' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-text-secondary hover:bg-surface-dark hover:text-white'}`}>
                        <span className={`material-symbols-outlined ${activeTab === 'dashboard' ? 'filled' : ''}`}>dashboard</span>
                        <span className="font-medium text-sm">Dashboard</span>
                    </button>
                    <button onClick={() => setActiveTab('companies')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${activeTab === 'companies' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-text-secondary hover:bg-surface-dark hover:text-white'}`}>
                        <span className={`material-symbols-outlined ${activeTab === 'companies' ? 'filled' : ''}`}>storefront</span>
                        <span className="font-medium text-sm">Empresas</span>
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-surface-dark hover:text-white transition-colors group">
                        <span className="material-symbols-outlined text-text-secondary group-hover:text-white">settings</span>
                        <span className="font-medium text-sm">Configurações</span>
                    </button>
                </nav>
                <div className="p-4 border-t border-surface-border">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="size-8 rounded-full bg-gray-600 bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA70_kIZ9tux_sk8_acdfllHvFSyk3lKhl85gcxpTJ6G8piBqpdcLCJZyy515OlYwfUMBwkVpYnkFjaivPaYjqJPkfZLDG2mQ2zaust_33Uh2T4SDgXO2Wylnhq70YMsHy7Q6Erfc_9QirRDGyvu_5eWl0DXn7mfoqIgx4wdJS3GEv-qv1EyWe_MvNs9l38mRyqjUcpgLc9lUyO9mnrzNIT1xWYANeuw--f15BoKDyS_qEGc5Ezs_oDpn6vdqcyd7VriaJI7xB9GoaS')"}}></div>
                        <div className="flex flex-col">
                            <p className="text-sm font-medium text-white">Admin User</p>
                            <p className="text-xs text-text-secondary">admin@praghub.com</p>
                        </div>
                        <button onClick={handleLogout} className="ml-auto text-text-secondary hover:text-white">
                            <span className="material-symbols-outlined">logout</span>
                        </button>
                    </div>
                </div>
            </aside>
            <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-dark">
                
                {activeTab === 'dashboard' && (
                    <div className="p-8 overflow-y-auto animate-in fade-in slide-in-from-bottom-2">
                        <h2 className="text-3xl font-bold text-white mb-6">Visão Geral da Plataforma</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            {[
                                { title: 'Total Empresas', value: '2,405', icon: 'business', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                                { title: 'Novos Cadastros', value: '18', icon: 'new_releases', color: 'text-green-400', bg: 'bg-green-400/10' },
                                { title: 'Leads Gerados', value: '12.5k', icon: 'rocket_launch', color: 'text-purple-400', bg: 'bg-purple-400/10' },
                                { title: 'Receita Mensal', value: 'R$ 85k', icon: 'payments', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-surface-dark border border-surface-border rounded-2xl p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                            <span className="material-symbols-outlined">{stat.icon}</span>
                                        </div>
                                        <span className="text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full">+4.5%</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                                    <p className="text-text-secondary text-sm">{stat.title}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-surface-dark border border-surface-border rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-6">Crescimento de Cadastros</h3>
                                <div className="h-64 flex items-end justify-between gap-2 px-2">
                                    {[30, 45, 35, 60, 55, 70, 85, 80, 95, 100].map((h, i) => (
                                        <div key={i} className="w-full bg-primary/20 rounded-t-lg relative group transition-all hover:bg-primary/40" style={{height: `${h}%`}}>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-border text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                {h}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-4 text-xs text-text-secondary font-medium uppercase">
                                    <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Set</span><span>Out</span>
                                </div>
                            </div>

                            <div className="bg-surface-dark border border-surface-border rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Solicitações Pendentes</h3>
                                <div className="space-y-4">
                                    {[
                                        { name: 'Dedetizadora Alpha', loc: 'Osasco, SP', time: '2h atrás' },
                                        { name: 'Protege Lar', loc: 'Curitiba, PR', time: '5h atrás' },
                                        { name: 'Mata Tudo Pragas', loc: 'Belo Horizonte, MG', time: '1d atrás' }
                                    ].map((req, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-background-dark/50 rounded-xl border border-surface-border hover:border-primary/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300">
                                                    {req.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white text-sm">{req.name}</h4>
                                                    <p className="text-xs text-text-secondary">{req.loc}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-text-secondary mr-2">{req.time}</span>
                                                <button onClick={() => setActiveTab('companies')} className="text-xs font-bold text-primary hover:underline">Revisar</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'companies' && (
                    <>
                        <header className="flex flex-col gap-6 p-6 pb-0 md:p-10 md:pb-4 shrink-0 animate-in fade-in slide-in-from-top-2">
                            <div className="flex flex-wrap justify-between items-start gap-4">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-3xl font-bold tracking-tight text-white">Lista de Empresas</h2>
                                    <p className="text-text-secondary">Gerencie parceiros, aprove cadastros e defina destaques Premium.</p>
                                </div>
                                <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-primary/20">
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                    Nova Empresa
                                </button>
                            </div>
                            <div className="flex flex-col md:flex-row gap-4 items-center bg-surface-dark p-2 rounded-2xl border border-surface-border">
                                <div className="relative flex-1 w-full">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">search</span>
                                    <input 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-[#1e232b] border-none rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-text-secondary focus:ring-1 focus:ring-primary text-sm" 
                                        placeholder="Buscar por nome, cidade ou slug..." 
                                        type="text"
                                    />
                                    {searchQuery && (
                                        <button 
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white"
                                            type="button"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 px-1 no-scrollbar">
                                    <div className="relative">
                                        <select 
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value as any)}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#1e232b] hover:bg-surface-border rounded-full text-white text-sm border border-transparent hover:border-surface-border transition-all whitespace-nowrap appearance-none pr-8 cursor-pointer"
                                        >
                                            <option value="Todos">Status: Todos</option>
                                            <option value="Pendente">Status: Pendente</option>
                                            <option value="Aprovado">Status: Aprovado</option>
                                            <option value="Rejeitado">Status: Rejeitado</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-[18px]">keyboard_arrow_down</span>
                                    </div>
                                    <div className="relative">
                                        <select 
                                            value={premiumFilter}
                                            onChange={(e) => setPremiumFilter(e.target.value as any)}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#1e232b] hover:bg-surface-border rounded-full text-white text-sm border border-transparent hover:border-surface-border transition-all whitespace-nowrap appearance-none pr-8 cursor-pointer"
                                        >
                                            <option value="Todos">Premium: Todos</option>
                                            <option value="Premium">Premium: Sim</option>
                                            <option value="Não Premium">Premium: Não</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-[18px]">keyboard_arrow_down</span>
                                    </div>
                                </div>
                            </div>
                        </header>
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 pt-4">
                            <div className="rounded-2xl border border-surface-border bg-surface-dark overflow-hidden shadow-xl">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#12151b] border-b border-surface-border">
                                            <th className="p-4 pl-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">Empresa</th>
                                            <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Localização</th>
                                            <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">WhatsApp</th>
                                            <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                                            <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-center">Premium</th>
                                            <th className="p-4 pr-6 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-border">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-text-secondary">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="material-symbols-outlined animate-spin">refresh</span>
                                                        <span>Carregando empresas...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : companies.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-text-secondary">
                                                    Nenhuma empresa encontrada.
                                                </td>
                                            </tr>
                                        ) : (
                                            companies.map(company => (
                                            <tr key={company.id} className="group hover:bg-[#1c222c] transition-colors">
                                                <td className="p-4 pl-6">
                                                    <div className="flex items-center gap-3">
                                                        {company.imageUrl ? (
                                                            <div className="size-10 rounded-lg bg-gray-700 bg-cover bg-center" style={{backgroundImage: `url('${company.imageUrl}')`}}></div>
                                                        ) : (
                                                            <div className="size-10 rounded-lg bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-600">{getCompanyInitials(company.name)}</div>
                                                        )}
                                                        <div>
                                                            <p className="font-bold text-white text-sm">{company.name}</p>
                                                            <p className="text-xs text-text-secondary">CNPJ: {company.cnpj}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <p className="text-sm text-white">{company.location}</p>
                                                    <p className="text-xs text-text-secondary">{company.shortLocation}</p>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1 text-sm text-text-secondary">
                                                        <span className="material-symbols-outlined text-[16px]">chat</span>
                                                        {company.whatsapp}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                        company.status === 'Aprovado' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                        company.status === 'Pendente' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                        <span className={`size-1.5 rounded-full ${
                                                            company.status === 'Aprovado' ? 'bg-emerald-500' :
                                                            company.status === 'Pendente' ? 'bg-yellow-500' :
                                                            'bg-red-400'
                                                        }`}></span>
                                                        {company.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${company.isPremium ? 'bg-primary' : 'bg-gray-600'}`}>
                                                        <span className={`${company.isPremium ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}></span>
                                                    </button>
                                                </td>
                                                <td className="p-4 pr-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/10" title="Ver detalhes">
                                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                        </button>
                                                        <button onClick={() => handleEdit(company)} className="p-2 rounded-full text-primary hover:bg-primary/10" title="Editar">
                                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                                        </button>
                                                        <button className="p-2 rounded-full text-red-400 hover:text-red-300 hover:bg-red-400/10" title="Excluir">
                                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {toastVisible && (
                    <div className="absolute top-6 right-6 z-50 animate-bounce-in">
                        <div className="flex items-center gap-3 bg-surface-dark border border-surface-border shadow-2xl p-4 rounded-xl max-w-sm">
                            <div className="bg-primary/20 p-2 rounded-full text-primary">
                                <span className="material-symbols-outlined text-[20px]">check</span>
                            </div>
                            <div>
                                <h4 className="text-white text-sm font-bold">Status Atualizado</h4>
                                <p className="text-text-secondary text-xs">Dados salvos com sucesso.</p>
                            </div>
                            <button onClick={() => setToastVisible(false)} className="text-text-secondary hover:text-white ml-2">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>
                    </div>
                )}

                {isModalOpen && selectedCompany && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <div className="glass-panel w-full max-w-2xl rounded-2xl border border-surface-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-surface-dark">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Editar Empresa</h3>
                                    <p className="text-text-secondary text-sm">Atualize os dados e status da parceria.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleSave}>
                            <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-background-dark/50 rounded-xl border border-surface-border/50">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase text-text-secondary tracking-wider">Status do Cadastro</label>
                                        <div className="relative">
                                            <select name="status" defaultValue={selectedCompany.status} className="w-full bg-[#1e232b] border border-surface-border text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 appearance-none">
                                                <option value="Pendente">Pendente</option>
                                                <option value="Aprovado">Aprovado</option>
                                                <option value="Rejeitado">Rejeitado</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-3 top-2.5 text-text-secondary pointer-events-none">expand_more</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 justify-center">
                                        <label className="text-xs font-bold uppercase text-text-secondary tracking-wider mb-1">Destaque Premium</label>
                                        <label className="inline-flex items-center cursor-pointer group">
                                            <input name="isPremium" defaultChecked={selectedCompany.isPremium} className="sr-only peer" type="checkbox"/>
                                            <div className="relative w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                                            <span className="ms-3 text-sm font-medium text-text-secondary group-hover:text-white transition-colors">Ativado</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-1 md:col-span-2 space-y-1">
                                        <label className="text-sm font-medium text-text-secondary">Nome da Empresa</label>
                                        <input name="name" className="w-full bg-[#0b0d11] border border-surface-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-600" type="text" defaultValue={selectedCompany.name}/>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-text-secondary">WhatsApp Comercial</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-text-secondary material-symbols-outlined text-[18px]">call</span>
                                            <input name="whatsapp" className="w-full bg-[#0b0d11] border border-surface-border rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" type="text" defaultValue={selectedCompany.whatsapp}/>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-text-secondary">Cidade / Estado</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-text-secondary material-symbols-outlined text-[18px]">location_on</span>
                                            <input name="location" className="w-full bg-[#0b0d11] border border-surface-border rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" type="text" defaultValue={selectedCompany.location}/>
                                        </div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-1">
                                        <label className="text-sm font-medium text-text-secondary">Serviços Oferecidos</label>
                                        <div className="bg-[#0b0d11] border border-surface-border rounded-xl p-2 flex flex-wrap gap-2 min-h-[48px]">
                                            <span className="inline-flex items-center gap-1 bg-[#1e232b] text-text-secondary text-xs font-medium px-2.5 py-1 rounded-full border border-surface-border">
                                                Desinsetização
                                                <button className="hover:text-white"><span className="material-symbols-outlined text-[14px]">close</span></button>
                                            </span>
                                            <span className="inline-flex items-center gap-1 bg-[#1e232b] text-text-secondary text-xs font-medium px-2.5 py-1 rounded-full border border-surface-border">
                                                Desratização
                                                <button className="hover:text-white"><span className="material-symbols-outlined text-[14px]">close</span></button>
                                            </span>
                                            <input className="bg-transparent border-none text-white text-xs p-1 focus:ring-0 placeholder-gray-600 w-20" placeholder="+ Add tag" type="text"/>
                                        </div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-1">
                                        <label className="text-sm font-medium text-text-secondary">Observações Internas</label>
                                        <textarea className="w-full bg-[#0b0d11] border border-surface-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none placeholder-gray-600" placeholder="Anote detalhes sobre a verificação ou contato..." rows={3}></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-surface-border bg-surface-dark flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-full border border-surface-border text-white hover:bg-white/5 font-medium text-sm transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                    Salvar Alterações
                                </button>
                            </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};