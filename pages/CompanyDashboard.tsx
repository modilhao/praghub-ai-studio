import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lead, ChatMessage, Company } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { mapCompanyFromDB } from '../lib/mappers';
import { SubscriptionStatus } from '../components/SubscriptionStatus';
import logoFooter from '../logo-footer.png';

export const CompanyDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'analytics' | 'edit-profile'>('overview');
    const [isLoading, setIsLoading] = useState(true);

    const [companyData, setCompanyData] = useState<Company | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch company
                const { data: comp, error: compErr } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('owner_id', user.id)
                    .maybeSingle();

                if (compErr) throw compErr;

                if (comp) {
                    setCompanyData(mapCompanyFromDB(comp));

                    // Fetch leads
                    const { data: leadsData, error: leadsErr } = await supabase
                        .from('leads')
                        .select('*')
                        .eq('company_id', comp.id)
                        .order('created_at', { ascending: false });

                    if (leadsErr) throw leadsErr;
                    if (leadsData) {
                        setLeads(leadsData.map(l => ({
                            id: l.id,
                            companyId: l.company_id,
                            profileId: l.profile_id,
                            customerName: l.customer_name,
                            customerPhone: l.customer_phone,
                            serviceId: l.service_id,
                            description: l.description,
                            status: l.status,
                            createdAt: l.created_at,
                            updatedAt: l.updated_at
                        })));
                    }
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyData || !user) return;

        try {
            const { error } = await supabase
                .from('companies')
                .update({
                    name: companyData.name,
                    whatsapp: companyData.whatsapp,
                    location: companyData.location,
                    description: companyData.description,
                    certifications: companyData.certifications,
                    service_areas: companyData.serviceAreas,
                    specialties: companyData.specialties,
                    methods: companyData.methods
                })
                .eq('id', companyData.id);

            if (error) throw error;

            setToast({ message: 'Perfil atualizado com sucesso!', type: 'success' });
        } catch (err) {
            console.error('Error updating profile:', err);
            setToast({ message: 'Erro ao atualizar perfil.', type: 'error' });
        } finally {
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="flex h-screen w-full bg-[#0a0f1d] text-slate-200 font-display">
            <aside className="hidden md:flex w-72 flex-col bg-[#0f172a] border-r border-slate-800 shrink-0">
                <div className="p-8 flex items-center gap-3">
                    <img src={logoFooter} alt="PragHub" className="h-8 w-auto mb-2" />
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/5'}`}>
                        <span className="material-symbols-outlined text-[22px]">dashboard</span>
                        <span className="font-bold text-sm">Resumo</span>
                    </button>
                    <button onClick={() => setActiveTab('leads')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'leads' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/5'}`}>
                        <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
                        <div className="flex-1 flex justify-between items-center">
                            <span className="font-bold text-sm">Leads</span>
                            <span className="bg-white/10 text-[10px] px-2 py-0.5 rounded-full">{leads.filter(l => l.status === 'NEW').length}</span>
                        </div>
                    </button>
                    <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/5'}`}>
                        <span className="material-symbols-outlined text-[22px]">leaderboard</span>
                        <span className="font-bold text-sm">Desempenho</span>
                    </button>
                    <button onClick={() => setActiveTab('edit-profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'edit-profile' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/5'}`}>
                        <span className="material-symbols-outlined text-[22px]">manage_accounts</span>
                        <span className="font-bold text-sm">Meu Perfil</span>
                    </button>
                </nav>

                <div className="p-6 border-t border-slate-800">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 mb-4">
                        <img src={companyData?.imageUrl || 'https://via.placeholder.com/40'} className="size-10 rounded-full object-cover border border-white/10" alt="Avatar" />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">{companyData?.name || 'Carregando...'}</p>
                            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-red-400 transition-colors text-sm font-bold">
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        Sair do Painel
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0a0f1d]/50 backdrop-blur-md">
                    <h2 className="font-bold text-white uppercase tracking-widest text-xs">
                        {activeTab === 'overview' && 'Dashboard'}
                        {activeTab === 'leads' && 'Gestão de Leads'}
                        {activeTab === 'analytics' && 'Relatórios'}
                        {activeTab === 'edit-profile' && 'Configurações de Perfil'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full border border-emerald-500/20">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            SISTEMA ONLINE
                        </span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : !companyData ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <h3 className="text-xl font-bold text-white mb-2">Nenhum perfil de empresa encontrado</h3>
                            <p className="text-slate-400 mb-6">Você ainda não completou seu cadastro de empresa.</p>
                            <button onClick={() => navigate('/register')} className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-2xl font-bold">Criar Perfil Agora</button>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <h3 className="text-3xl font-black text-white leading-tight">Olá, {companyData?.name.split(' ')[0]}! 👋</h3>
                                            <p className="text-slate-400 mt-1">Veja como está a saúde do seu negócio hoje.</p>
                                        </div>
                                        <button onClick={() => setActiveTab('leads')} className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95">
                                            <span className="material-symbols-outlined">rocket_launch</span>
                                            Ver Novos Leads
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            { label: 'Visitas ao Perfil', value: companyData.analytics?.profileViews, icon: 'visibility', color: 'text-blue-400' },
                                            { label: 'Cliques no Whats', value: companyData.analytics?.whatsappClicks, icon: 'chat', color: 'text-emerald-400' },
                                            { label: 'Total de Leads', value: companyData.analytics?.leadsGenerated, icon: 'bolt', color: 'text-purple-400' },
                                            { label: 'Taxa de Conversão', value: `${companyData.analytics?.conversionRate}%`, icon: 'donut_large', color: 'text-orange-400' }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all group">
                                                <div className={`p-3 rounded-2xl bg-white/5 w-fit mb-4 group-hover:bg-white/10 transition-colors ${stat.color}`}>
                                                    <span className="material-symbols-outlined">{stat.icon}</span>
                                                </div>
                                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                                                <h4 className="text-3xl font-black text-white mt-1">{stat.value}</h4>
                                            </div>
                                        ))}
                                    </div>

                                    <SubscriptionStatus />

                                    <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8">
                                        <div className="flex-1 text-center md:text-left">
                                            <h4 className="text-xl font-bold text-white mb-2">Seu Perfil está 85% Completo</h4>
                                            <p className="text-slate-400 text-sm mb-6">Empresas com perfil 100% completo recebem até 2x mais contatos. Adicione fotos dos seus serviços realizados!</p>
                                            <button onClick={() => setActiveTab('edit-profile')} className="px-6 py-2.5 bg-white text-slate-900 font-bold rounded-full text-xs hover:bg-slate-100 transition-colors">Completar Agora</button>
                                        </div>
                                        <div className="size-32 rounded-full border-8 border-white/5 flex items-center justify-center relative">
                                            <svg className="absolute inset-0 size-full -rotate-90">
                                                <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-primary/20" />
                                                <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="351.8" strokeDashoffset="52.7" className="text-primary" />
                                            </svg>
                                            <span className="text-2xl font-black text-white">85%</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'edit-profile' && (
                                <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4 pb-20">
                                    <form onSubmit={handleSaveProfile} className="space-y-8">
                                        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                                            <div className="p-8 border-b border-slate-800 bg-white/5">
                                                <h3 className="text-xl font-bold text-white">Informações Básicas</h3>
                                                <p className="text-slate-500 text-sm mt-1">Dados essenciais para contato e localização.</p>
                                            </div>
                                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2 col-span-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Nome Comercial</label>
                                                    <input
                                                        className="w-full bg-[#0b0d11] border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                                        value={companyData.name}
                                                        onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">WhatsApp</label>
                                                    <input
                                                        className="w-full bg-[#0b0d11] border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                                        value={companyData.whatsapp || ''}
                                                        onChange={(e) => setCompanyData({ ...companyData, whatsapp: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Cidade Sede</label>
                                                    <input
                                                        className="w-full bg-[#0b0d11] border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                                        value={companyData.location || ''}
                                                        onChange={(e) => setCompanyData({ ...companyData, location: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2 col-span-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Sobre a Empresa (Descrição)</label>
                                                    <textarea
                                                        className="w-full bg-[#0b0d11] border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary outline-none transition-all resize-none min-h-[120px]"
                                                        value={companyData.description || ''}
                                                        onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                                                        placeholder="Conte sobre sua experiência, história e diferencial..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                                            <div className="p-8 border-b border-slate-800 bg-white/5">
                                                <h3 className="text-xl font-bold text-white">Diferenciais e Especialidades</h3>
                                                <p className="text-slate-500 text-sm mt-1">Campos que ajudam o cliente a te escolher.</p>
                                            </div>
                                            <div className="p-8 space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Certificações (ANVISA, CRQ, etc.)</label>
                                                    <input
                                                        className="w-full bg-[#0b0d11] border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                                        value={companyData.certifications?.join(', ') || ''}
                                                        onChange={(e) => setCompanyData({ ...companyData, certifications: e.target.value.split(',').map(s => s.trim()) })}
                                                        placeholder="Separe por vírgula"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Bairros/Regiões de Atendimento</label>
                                                    <input
                                                        className="w-full bg-[#0b0d11] border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                                        value={companyData.serviceAreas?.join(', ') || ''}
                                                        onChange={(e) => setCompanyData({ ...companyData, serviceAreas: e.target.value.split(',').map(s => s.trim()) })}
                                                        placeholder="Ex: Moema, Centro, Zona Sul"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Pragas Especializadas</label>
                                                    <input
                                                        className="w-full bg-[#0b0d11] border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                                        value={companyData.specialties?.join(', ') || ''}
                                                        onChange={(e) => setCompanyData({ ...companyData, specialties: e.target.value.split(',').map(s => s.trim()) })}
                                                        placeholder="Ex: Cupins, Escorpiões, Morcegos"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Métodos de Controle</label>
                                                    <input
                                                        className="w-full bg-[#0b0d11] border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                                        value={companyData.methods?.join(', ') || ''}
                                                        onChange={(e) => setCompanyData({ ...companyData, methods: e.target.value.split(',').map(s => s.trim()) })}
                                                        placeholder="Ex: Gel, Atomização, Barreira Química"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-4">
                                            <button type="button" onClick={() => setActiveTab('overview')} className="px-8 py-3.5 rounded-2xl border border-slate-800 text-slate-400 font-bold hover:bg-white/5 transition-all">Cancelar</button>
                                            <button type="submit" className="px-12 py-3.5 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all transform active:scale-95">Salvar Alterações</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'analytics' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
                                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                                        <h3 className="text-xl font-bold text-white mb-8">Cliques no WhatsApp (Últimos 30 dias)</h3>
                                        <div className="h-64 flex items-end justify-between gap-3 px-4">
                                            {[12, 18, 15, 25, 32, 28, 45, 38, 52, 48, 65, 85].map((val, i) => (
                                                <div key={i} className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t-xl relative group transition-all" style={{ height: `${(val / 85) * 100}%` }}>
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                        {val} cliques
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2">
                                            <span>Início do Mês</span>
                                            <span>Hoje</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'leads' && (
                                <div className="space-y-6 animate-in zoom-in-95">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-2xl font-bold text-white">Gestão de Leads</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {leads.length === 0 ? (
                                            <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-3xl">
                                                <p className="text-slate-500 font-bold">Você ainda não recebeu leads.</p>
                                            </div>
                                        ) : leads.map(lead => (
                                            <div key={lead.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-primary/30 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                                                        {lead.customerName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white group-hover:text-primary transition-colors">{lead.customerName}</h4>
                                                        <p className="text-xs text-slate-500">{lead.customerPhone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex-1 md:max-w-md">
                                                    <p className="text-sm text-slate-400 italic line-clamp-2">"{lead.description}"</p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <a
                                                        href={`https://wa.me/${lead.customerPhone?.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="size-11 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">chat</span>
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {toast && (
                    <div className="fixed bottom-8 right-8 z-[100] animate-bounce-in">
                        <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${toast.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-red-500 text-white border-red-400'
                            }`}>
                            <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
                            <span className="text-sm font-bold">{toast.message}</span>
                        </div>
                    </div>
                )}
            </main>
        </div >
    );
};
