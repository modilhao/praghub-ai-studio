import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lead } from '../types';

const MOCK_LEADS: Lead[] = [
    { id: '1', customerName: 'Roberto Silva', serviceType: 'Desratização', description: 'Problema com roedores no forro da casa.', date: 'Hoje, 10:30', status: 'Novo', contact: '(11) 99999-1111' },
    { id: '2', customerName: 'Condomínio Flores', serviceType: 'Sanitização', description: 'Orçamento mensal para áreas comuns.', date: 'Ontem', status: 'Em Andamento', contact: '(11) 98888-2222' },
    { id: '3', customerName: 'Padaria Central', serviceType: 'Baratas', description: 'Urgente: Cozinha industrial.', date: '23/10', status: 'Fechado', contact: '(11) 97777-3333' },
];

interface Message {
    id: string;
    text: string;
    sender: 'me' | 'client';
    time: string;
}

const INITIAL_MESSAGES: Record<string, Message[]> = {
    '1': [
        { id: 'm1', text: 'Olá, gostaria de um orçamento para desratização.', sender: 'client', time: '10:30' },
        { id: 'm2', text: 'O problema é no forro da casa, escuto barulhos à noite.', sender: 'client', time: '10:31' }
    ],
    '2': [
        { id: 'm1', text: 'Boa tarde. Vocês fazem contrato mensal para condomínios?', sender: 'client', time: 'Ontem' },
        { id: 'm2', text: 'Olá! Fazemos sim. Quantas torres são?', sender: 'me', time: 'Ontem' },
        { id: 'm3', text: 'São 4 torres e a área de lazer.', sender: 'client', time: 'Ontem' }
    ],
    '3': [
        { id: 'm1', text: 'Preciso de dedetização urgente na cozinha.', sender: 'client', time: '23/10' },
        { id: 'm2', text: 'A vigilância sanitária vai passar aqui amanhã.', sender: 'client', time: '23/10' },
        { id: 'm3', text: 'Já resolvemos, obrigado.', sender: 'me', time: '23/10' }
    ]
};

const AUTO_REPLIES = [
    "Obrigado pelo retorno! Vou verificar a disponibilidade.",
    "Qual seria o valor aproximado para esse serviço?",
    "Ok, fico no aguardo.",
    "Podemos agendar para amanhã de manhã?",
    "Entendi, obrigado pelas informações."
];

export const CompanyDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'profile'>('overview');
    const [leads, setLeads] = useState(MOCK_LEADS);
    
    // Chat States
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => navigate('/login');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedLead, isTyping]);

    const handleOpenChat = (lead: Lead) => {
        setSelectedLead(lead);
        setActiveTab('leads');
        setIsTyping(false);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || !selectedLead) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputMessage,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Add message
        setMessages(prev => ({
            ...prev,
            [selectedLead.id]: [...(prev[selectedLead.id] || []), newMessage]
        }));

        // Update status if needed
        if (selectedLead.status === 'Novo') {
            const updatedLead = { ...selectedLead, status: 'Em Andamento' as const };
            setSelectedLead(updatedLead);
            setLeads(prev => prev.map(l => l.id === selectedLead.id ? updatedLead : l));
        }

        setInputMessage('');

        // Simulate client reply
        if (selectedLead.status !== 'Fechado') {
            setIsTyping(true);
            setTimeout(() => {
                const randomReply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
                const replyMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: randomReply,
                    sender: 'client',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };

                setMessages(prev => ({
                    ...prev,
                    [selectedLead.id]: [...(prev[selectedLead.id] || []), replyMessage]
                }));
                setIsTyping(false);
            }, 3000);
        }
    };

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
            {/* Sidebar */}
            <aside className="hidden md:flex w-64 flex-col border-r border-card-border bg-card-dark h-full shrink-0 z-20">
                <div className="p-6 flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined">business</span>
                    </div>
                    <div>
                        <h1 className="text-white text-base font-bold leading-tight">FastClean</h1>
                        <p className="text-slate-400 text-xs font-medium">Plano Premium</p>
                    </div>
                </div>
                <nav className="flex-1 px-3 flex flex-col gap-1 mt-2">
                    <button onClick={() => { setActiveTab('overview'); setSelectedLead(null); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        <span className={`material-symbols-outlined ${activeTab === 'overview' ? 'filled' : ''}`}>dashboard</span>
                        <span className="font-bold text-sm">Visão Geral</span>
                    </button>
                    <button onClick={() => { setActiveTab('leads'); setSelectedLead(null); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'leads' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        <span className={`material-symbols-outlined ${activeTab === 'leads' ? 'filled' : ''}`}>person_search</span>
                        <div className="flex flex-1 items-center justify-between">
                            <span className="font-bold text-sm">Meus Leads</span>
                            <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{leads.filter(l => l.status === 'Novo').length}</span>
                        </div>
                    </button>
                    <button onClick={() => { setActiveTab('profile'); setSelectedLead(null); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        <span className={`material-symbols-outlined ${activeTab === 'profile' ? 'filled' : ''}`}>edit_document</span>
                        <span className="font-bold text-sm">Meu Perfil</span>
                    </button>
                </nav>
                <div className="p-4 border-t border-card-border">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-2 text-slate-400 hover:text-red-400 transition-colors w-full">
                        <span className="material-symbols-outlined">logout</span>
                        <span className="text-sm font-medium">Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark relative">
                <header className="flex md:hidden items-center justify-between p-4 border-b border-card-border bg-card-dark">
                    <div className="flex items-center gap-2">
                         <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-sm">business</span>
                        </div>
                        <span className="font-bold text-white">FastClean</span>
                    </div>
                    <button onClick={handleLogout} className="text-slate-400"><span className="material-symbols-outlined">logout</span></button>
                </header>

                <div className={`flex-1 overflow-hidden flex flex-col ${activeTab === 'leads' && selectedLead ? 'p-0 md:p-4' : 'p-4 md:p-8'}`}>
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 overflow-y-auto h-full pr-2">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Bom dia, FastClean! 👋</h2>
                                <p className="text-slate-400">Aqui está o resumo da sua performance nos últimos 30 dias.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-card-dark border border-card-border p-5 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-all">
                                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <span className="material-symbols-outlined text-6xl text-primary">visibility</span>
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium mb-1">Visualizações do Perfil</p>
                                    <h3 className="text-3xl font-bold text-white">1,248</h3>
                                    <span className="text-green-400 text-xs font-bold flex items-center gap-1 mt-2">
                                        <span className="material-symbols-outlined text-sm">trending_up</span> +12% esse mês
                                    </span>
                                </div>
                                <div className="bg-card-dark border border-card-border p-5 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-all">
                                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <span className="material-symbols-outlined text-6xl text-primary">chat</span>
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium mb-1">Cliques no WhatsApp</p>
                                    <h3 className="text-3xl font-bold text-white">86</h3>
                                    <span className="text-green-400 text-xs font-bold flex items-center gap-1 mt-2">
                                        <span className="material-symbols-outlined text-sm">trending_up</span> +5% esse mês
                                    </span>
                                </div>
                                <div className="bg-card-dark border border-card-border p-5 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-all">
                                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <span className="material-symbols-outlined text-6xl text-primary">star</span>
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium mb-1">Avaliação Média</p>
                                    <h3 className="text-3xl font-bold text-white">4.9</h3>
                                    <span className="text-slate-500 text-xs font-medium flex items-center gap-1 mt-2">
                                        Baseado em 120 reviews
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-card-dark border border-card-border rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Leads Recentes</h3>
                                    <div className="space-y-4">
                                        {leads.slice(0, 3).map(lead => (
                                            <div key={lead.id} className="flex items-center gap-4 p-3 rounded-xl bg-background-dark/50 hover:bg-background-dark transition-colors border border-transparent hover:border-card-border">
                                                <div className="size-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                                                    {lead.customerName.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-white truncate">{lead.customerName}</h4>
                                                    <p className="text-xs text-slate-400 truncate">{lead.serviceType} • {lead.date}</p>
                                                </div>
                                                <button onClick={() => handleOpenChat(lead)} className="text-xs font-bold text-primary hover:underline">Ver</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-primary to-blue-900 rounded-2xl p-6 text-white relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-bold mb-4">
                                            <span className="material-symbols-outlined text-sm filled">star</span> Dica Premium
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">Melhore seu perfil</h3>
                                        <p className="text-blue-100 text-sm mb-6 max-w-xs">Empresas com fotos de equipe e descrição detalhada recebem 2x mais contatos.</p>
                                        <button onClick={() => setActiveTab('profile')} className="bg-white text-primary font-bold px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors">
                                            Editar Perfil
                                        </button>
                                    </div>
                                    <div className="absolute right-[-20px] bottom-[-20px] opacity-20">
                                        <span className="material-symbols-outlined text-9xl">rocket_launch</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'leads' && (
                        <>
                            {!selectedLead ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 overflow-y-auto h-full pr-2">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">Meus Leads</h2>
                                            <p className="text-slate-400">Gerencie os pedidos de orçamento recebidos.</p>
                                        </div>
                                    </div>
                                    <div className="bg-card-dark border border-card-border rounded-2xl overflow-hidden">
                                        {leads.map((lead, idx) => (
                                            <div key={lead.id} onClick={() => handleOpenChat(lead)} className={`cursor-pointer p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-center ${idx !== leads.length - 1 ? 'border-b border-card-border' : ''} hover:bg-surface-dark transition-colors`}>
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="size-12 rounded-full bg-slate-800 border border-card-border flex items-center justify-center text-lg font-bold text-slate-300">
                                                        {lead.customerName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-bold text-white">{lead.customerName}</h3>
                                                            {lead.status === 'Novo' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">NOVO</span>}
                                                            {lead.status === 'Em Andamento' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">EM ANDAMENTO</span>}
                                                            {lead.status === 'Fechado' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">FECHADO</span>}
                                                        </div>
                                                        <p className="text-sm text-slate-400"><span className="text-primary font-medium">{lead.serviceType}</span> • {lead.date}</p>
                                                    </div>
                                                </div>
                                                <div className="flex-1 md:border-l md:border-card-border md:pl-6">
                                                    <p className="text-sm text-slate-300 italic truncate">"{lead.description}"</p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2 md:mt-0">
                                                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                                        <span className="material-symbols-outlined text-[18px]">chat</span>
                                                        Abrir Chat
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full bg-card-dark rounded-2xl border border-card-border overflow-hidden animate-in fade-in zoom-in-95">
                                    {/* Chat Header */}
                                    <div className="flex items-center justify-between p-4 border-b border-card-border bg-surface-dark">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setSelectedLead(null)} className="mr-1 text-slate-400 hover:text-white md:hidden">
                                                <span className="material-symbols-outlined">arrow_back</span>
                                            </button>
                                            <div className="size-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                                                {selectedLead.customerName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">{selectedLead.customerName}</h3>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                                        {selectedLead.serviceType}
                                                    </p>
                                                    {selectedLead.status === 'Novo' && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400">NOVO</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a href={`https://wa.me/?text=Olá ${selectedLead.customerName}`} target="_blank" rel="noreferrer" className="p-2 text-green-500 hover:bg-green-500/10 rounded-full transition-colors" title="Abrir no WhatsApp">
                                                <span className="material-symbols-outlined filled">chat</span>
                                            </a>
                                            <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full">
                                                <span className="material-symbols-outlined">more_vert</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Chat Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background-dark/50">
                                        <div className="flex justify-center my-4">
                                            <span className="text-xs text-slate-500 bg-surface-dark px-3 py-1 rounded-full border border-card-border">
                                                Solicitação recebida em {selectedLead.date}
                                            </span>
                                        </div>
                                        
                                        <div className="bg-surface-dark border border-card-border p-3 rounded-lg mb-6 max-w-2xl mx-auto text-center">
                                            <p className="text-sm text-slate-300 italic">
                                                <span className="material-symbols-outlined text-[16px] align-text-bottom mr-1">format_quote</span>
                                                {selectedLead.description}
                                            </p>
                                        </div>

                                        {(messages[selectedLead.id] || []).map((msg) => (
                                            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                                                <div className={`max-w-[80%] md:max-w-[60%] rounded-2xl px-4 py-2.5 shadow-sm ${
                                                    msg.sender === 'me' 
                                                    ? 'bg-primary text-white rounded-tr-none' 
                                                    : 'bg-surface-dark border border-card-border text-slate-200 rounded-tl-none'
                                                }`}>
                                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                                    <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-blue-200' : 'text-slate-500'}`}>
                                                        {msg.time}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {isTyping && (
                                            <div className="flex justify-start animate-in fade-in">
                                                <div className="bg-surface-dark border border-card-border text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                                                    <span className="size-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                    <span className="size-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                    <span className="size-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Chat Input */}
                                    <form onSubmit={handleSendMessage} className="p-3 md:p-4 bg-surface-dark border-t border-card-border">
                                        <div className="flex items-center gap-2">
                                            <button type="button" className="p-2 text-slate-400 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined">attach_file</span>
                                            </button>
                                            <input 
                                                type="text" 
                                                value={inputMessage}
                                                onChange={(e) => setInputMessage(e.target.value)}
                                                placeholder="Digite sua mensagem..." 
                                                className="flex-1 bg-background-dark border border-card-border text-white rounded-full px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-slate-500"
                                            />
                                            <button 
                                                type="submit" 
                                                disabled={!inputMessage.trim()}
                                                className="p-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-all shadow-lg shadow-primary/20"
                                            >
                                                <span className="material-symbols-outlined text-[20px] ml-0.5">send</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 max-w-4xl overflow-y-auto h-full pr-2">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Editar Perfil</h2>
                                <p className="text-slate-400">Mantenha suas informações atualizadas.</p>
                            </div>
                            <div className="bg-card-dark border border-card-border rounded-2xl p-6 space-y-6">
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    <div className="shrink-0">
                                        <div className="size-24 rounded-full bg-slate-800 border-2 border-dashed border-card-border flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:border-primary hover:text-primary transition-all">
                                            <span className="material-symbols-outlined">add_a_photo</span>
                                            <span className="text-[10px] font-bold mt-1">Logo</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-slate-400">Nome da Empresa</label>
                                            <input type="text" defaultValue="Dedetizadora FastClean" className="w-full bg-background-dark border border-card-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-slate-400">WhatsApp</label>
                                            <input type="text" defaultValue="(11) 99999-9999" className="w-full bg-background-dark border border-card-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" />
                                        </div>
                                        <div className="col-span-1 md:col-span-2 space-y-1">
                                            <label className="text-sm font-bold text-slate-400">Descrição</label>
                                            <textarea rows={4} defaultValue="Especialista em controle de pragas urbanas..." className="w-full bg-background-dark border border-card-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary resize-none" />
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="text-sm font-bold text-slate-400 mb-2 block">Áreas de Atuação</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Residencial', 'Comercial', 'Condomínios'].map(tag => (
                                                    <span key={tag} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-bold flex items-center gap-1 border border-primary/30">
                                                        {tag} <button className="hover:text-white"><span className="material-symbols-outlined text-[14px]">close</span></button>
                                                    </span>
                                                ))}
                                                <button className="px-3 py-1 bg-card-border text-slate-400 rounded-full text-sm font-bold hover:text-white">+ Adicionar</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-card-border flex justify-end">
                                    <button className="bg-primary hover:bg-primary-hover text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20">
                                        Salvar Alterações
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};