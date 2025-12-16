import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export const Legal: React.FC = () => {
    const location = useLocation();
    const isPrivacy = location.pathname === '/privacy';
    
    const title = isPrivacy ? 'Política de Privacidade' : 'Termos de Uso';
    const lastUpdate = '25 de Outubro, 2024';

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Link to="/register" className="inline-flex items-center text-primary hover:text-primary-hover mb-6 font-medium">
                    <span className="material-symbols-outlined text-lg mr-1">arrow_back</span>
                    Voltar para Cadastro
                </Link>
                
                <div className="bg-white dark:bg-card-dark rounded-2xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-card-border">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">{title}</h1>
                    <p className="text-slate-500 text-sm mb-8">Última atualização: {lastUpdate}</p>
                    
                    <div className="space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed">
                        <p>
                            Bem-vindo ao PragHub. Este documento rege o uso de nossa plataforma e serviços. 
                            Ao acessar ou usar nosso site, você concorda em cumprir e ficar vinculado a estes termos.
                        </p>
                        
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8">1. Uso da Plataforma</h3>
                        <p>
                            O PragHub é um diretório e marketplace que conecta clientes a empresas de controle de pragas. 
                            Nós não realizamos os serviços diretamente e não nos responsabilizamos pela execução dos mesmos.
                        </p>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8">2. Cadastro de Empresas</h3>
                        <p>
                            As empresas cadastradas devem fornecer informações verídicas e manter suas licenças (ANVISA, CRQ, etc.) atualizadas. 
                            O PragHub reserva-se o direito de remover perfis que violem nossas diretrizes de qualidade.
                        </p>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8">3. Privacidade de Dados</h3>
                        <p>
                            Nós levamos sua privacidade a sério. Seus dados são coletados apenas para melhorar sua experiência 
                            e conectar você aos serviços solicitados. Não vendemos seus dados para terceiros não relacionados.
                        </p>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 mt-8">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>Nota:</strong> Este é um texto de exemplo para fins demonstrativos da aplicação.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};