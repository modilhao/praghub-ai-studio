
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Company, Lead } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { mapCompanyFromDB } from '../lib/mappers';
import logoFooter from '../logo-footer.png';

export const Admin: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'leads' | 'settings'>('overview');
    const [companies, setCompanies] = useState<Company[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    // Proteção de rota
    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const { data: compData, error: compErr } = await supabase
                .from('companies')
                .select('*')
                .order('created_at', { ascending: false });

            if (compErr) throw compErr;

            if (compData) {
                setCompanies(compData.map(mapCompanyFromDB));
            }

            const { data: leadsData, error: leadsErr } = await supabase
                .from('leads')
                .select('*, companies(name)')
                .order('created_at', { ascending: false });

            if (leadsErr) throw leadsErr;
            if (leadsData) {
                setLeads(leadsData.map(l => ({
                    id: l.id,
                    companyId: l.company_id,
                    companyName: (l.companies as any)?.name,
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
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleTogglePremium = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('companies')
                .update({ is_premium: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            setCompanies(prev => prev.map(c =>
                c.id === id ? { ...c, isPremium: !c.isPremium } : c
            ));
            showToast(`Plano Premium ${!currentStatus ? 'ativado' : 'desativado'}.`);
        } catch (err) {
            console.error('Error toggling premium:', err);
            showToast("Erro ao atualizar plano.");
        }
    };

    const handleUpdateStatus = async (id: string, status: Company['status']) => {
        try {
            const { error } = await supabase
                .from('companies')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            setCompanies(prev => prev.map(c =>
                c.id === id ? { ...c, status } : c
            ));
            showToast(`Empresa ${status === 'APPROVED' ? 'Aprovada' : 'Rejeitada'}.`);
        } catch (err) {
            console.error('Error updating status:', err);
            showToast("Erro ao atualizar status.");
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        totalCompanies: companies.length,
        pendingApprovals: companies.filter(c => c.status === 'PENDING').length,
        activeLeads: leads.length,
        premiumRatio: companies.length > 0 ? Math.round((companies.filter(c => c.isPremium).length / companies.length) * 100) : 0
    };

    return (
        <div className="flex h-screen w-full bg-[#0a0f18] text-slate-300 font-display">
            {/* Sidebar Admin */}
            <aside className="w-64 border-r border-slate-800 bg-[#0f172a] flex flex-col shrink-0">
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                    <img src={logoFooter} alt="PragHub" className="h-8 w-auto" />
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}>
                        <span className="material-symbols-outlined text-[20px]">analytics</span>
                        <span className="text-sm font-bold">Visão Geral</span>
                    </button>
                    <button onClick={() => setActiveTab('companies')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'companies' ? 'bg-primary text-white shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}>
                        <span className="material-symbols-outlined text-[20px]">storefront</span>
                        <span className="text-sm font-bold">Empresas</span>
                    </button>
                    <button onClick={() => setActiveTab('leads')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'leads' ? 'bg-primary text-white shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}>
                        <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                        <span className="text-sm font-bold">Leads Globais</span>
                    </button>
                    <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}>
                        <span className="material-symbols-outlined text-[20px]">settings</span>
                        <span className="text-sm font-bold">Configurações</span>
                    </button>
                </nav>

                <div className="p-4 mt-auto border-t border-slate-800">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl mb-4">
                        <img src={user?.picture} className="size-8 rounded-full" alt="Admin" />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">Admin Principal</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-400 text-sm font-bold transition-colors">
                        <span className="material-symbols-outlined text-[18px]">logout</span> Sair do Sistema
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0a0f18]/80 backdrop-blur-md z-10">
                    <h2 className="text-white font-bold text-sm uppercase tracking-widest">
                        {activeTab === 'overview' && 'Painel de Controle'}
                        {activeTab === 'companies' && 'Gestão de Parceiros'}
                        {activeTab === 'leads' && 'Fluxo de Leads'}
                        {activeTab === 'settings' && 'Ajustes do Sistema'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-px bg-slate-800 mx-2"></div>
                        <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20">DB ONLINE</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Empresas', value: stats.totalCompanies, icon: 'business', color: 'text-blue-400' },
                                    { label: 'Pendentes', value: stats.pendingApprovals, icon: 'pending_actions', color: 'text-yellow-400' },
                                    { label: 'Leads (Total)', value: stats.activeLeads, icon: 'bolt', color: 'text-purple-400' },
                                    { label: 'Empresas Premium', value: `${stats.premiumRatio}%`, icon: 'verified', color: 'text-emerald-400' }
                                ].map((s, i) => (
                                    <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                                        <div className={`size-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 ${s.color}`}>
                                            <span className="material-symbols-outlined">{s.icon}</span>
                                        </div>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider">{s.label}</p>
                                        <h4 className="text-3xl font-black text-white mt-1">{s.value}</h4>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                                    <h3 className="text-lg font-bold text-white mb-6">Últimos Cadastros</h3>
                                    <div className="space-y-4">
                                        {companies.slice(0, 3).map(c => (
                                            <div key={c.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold">{c.name.charAt(0)}</div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{c.name}</p>
                                                        <p className="text-[10px] text-slate-500">{c.location}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${c.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                    {c.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                                    <h3 className="text-lg font-bold text-white mb-6">Atividade de Leads</h3>
                                    <div className="h-48 flex items-end justify-between gap-2">
                                        {[40, 70, 50, 90, 60, 80, 100].map((h, i) => (
                                            <div key={i} className="flex-1 bg-primary/20 rounded-t-lg relative group" style={{ height: `${h}%` }}>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {h} leads
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-4 text-[10px] text-slate-500 font-bold">
                                        <span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SAB</span><span>DOM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'companies' && (
                        <div className="space-y-6 animate-in zoom-in-95 duration-300">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="relative w-full md:w-96">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                                    <input
                                        type="text"
                                        placeholder="Buscar por nome..."
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">filter_list</span> Filtrar
                                    </button>
                                    <button className="px-6 py-2 bg-primary hover:bg-primary-hover rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-primary/20">
                                        Exportar CSV
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-slate-800">
                                            <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Empresa</th>
                                            <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Cadastro</th>
                                            <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Premium</th>
                                            <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                            <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {filteredCompanies.map(c => (
                                            <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-400 group-hover:text-primary transition-colors border border-slate-700">
                                                            {c.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{c.name}</p>
                                                            <p className="text-[10px] text-slate-500">{c.location}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <p className="text-xs text-slate-300">{new Date(c.createdAt || '').toLocaleDateString('pt-BR')}</p>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <button
                                                        onClick={() => handleTogglePremium(c.id, c.isPremium)}
                                                        className={`size-10 rounded-full border transition-all flex items-center justify-center mx-auto ${c.isPremium ? 'bg-primary/20 border-primary text-primary' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                                                    >
                                                        <span className={`material-symbols-outlined text-[20px] ${c.isPremium ? 'filled' : ''}`}>verified</span>
                                                    </button>
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`size-2 rounded-full ${c.status === 'APPROVED' ? 'bg-emerald-500' : c.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                                                        <span className="text-[10px] font-black uppercase text-slate-400">{c.status}</span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {c.status === 'PENDING' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(c.id, 'APPROVED')}
                                                                className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center" title="Aprovar"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">check</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => { setSelectedCompany(c); setIsEditModalOpen(true); }}
                                                            className="size-8 rounded-lg bg-white/5 text-slate-400 hover:bg-primary hover:text-white transition-all flex items-center justify-center"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                                        </button>
                                                        <button className="size-8 rounded-lg bg-white/5 text-slate-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'leads' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-xl font-bold text-white mb-6">Monitoramento Global de Leads</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {leads.map(l => (
                                    <div key={l.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex items-center justify-between hover:border-primary/30 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined">person</span>
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-white">{l.customerName}</h5>
                                                <p className="text-xs text-slate-500">{l.customerPhone}</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 max-w-sm px-8">
                                            <p className="text-xs text-slate-400 line-clamp-2">"{l.description}"</p>
                                        </div>
                                        <div className="text-center px-8 border-x border-slate-800">
                                            <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Empresa Destino</p>
                                            <p className="text-xs font-bold text-primary">{l.companyName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-white">{new Date(l.createdAt).toLocaleDateString('pt-BR')}</p>
                                            <span className="text-[9px] font-black uppercase bg-white/5 text-slate-400 px-2 py-0.5 rounded-full mt-1 inline-block">{l.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Toast Notification */}
                {toast && (
                    <div className="fixed bottom-8 right-8 z-50 animate-bounce-in">
                        <div className="bg-primary text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                            <span className="material-symbols-outlined">check_circle</span>
                            <span className="text-sm font-bold">{toast}</span>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal de Edição de Empresa (Simplificado para o Protetipo) */}
            {isEditModalOpen && selectedCompany && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-white/5">
                            <h3 className="text-xl font-bold text-white">Editar Parceiro: {selectedCompany.name}</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Status de Aprovação</label>
                                    <select
                                        defaultValue={selectedCompany.status}
                                        onChange={(e) => handleUpdateStatus(selectedCompany.id, e.target.value as any)}
                                        className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-5 py-3 text-white outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="PENDING">Pendente</option>
                                        <option value="APPROVED">Aprovado</option>
                                        <option value="REJECTED">Rejeitado</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Visibilidade Premium</label>
                                    <div className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-sm font-bold text-slate-300 flex-1">Destacar nos resultados?</span>
                                        <button
                                            onClick={() => handleTogglePremium(selectedCompany.id, selectedCompany.isPremium)}
                                            className={`w-12 h-6 rounded-full relative transition-all ${selectedCompany.isPremium ? 'bg-primary' : 'bg-slate-700'}`}
                                        >
                                            <div className={`absolute top-1 size-4 rounded-full bg-white transition-all ${selectedCompany.isPremium ? 'right-1' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Notas Administrativas</label>
                                <textarea className="w-full bg-[#0b0f1a] border border-slate-800 rounded-2xl px-5 py-4 text-sm text-slate-300 resize-none h-32 outline-none" placeholder="Adicione notas internas sobre este parceiro..." />
                            </div>
                        </div>
                        <div className="p-8 border-t border-slate-800 flex justify-end gap-4">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-8 py-3 rounded-2xl text-slate-400 font-bold hover:bg-white/5 transition-all">Fechar</button>
                            <button onClick={() => { setIsEditModalOpen(false); showToast("Alterações salvas."); }} className="px-10 py-3 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all">Salvar Tudo</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
