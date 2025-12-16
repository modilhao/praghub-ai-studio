import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-4 text-center">
            <div className="w-24 h-24 bg-card-dark rounded-full flex items-center justify-center mb-6 border border-card-border shadow-2xl">
                <span className="material-symbols-outlined text-5xl text-slate-500">where_to_vote</span>
            </div>
            <h1 className="text-6xl font-extrabold text-white mb-2">404</h1>
            <h2 className="text-2xl font-bold text-slate-300 mb-4">Página não encontrada</h2>
            <p className="text-slate-500 max-w-md mb-8">
                A página que você está procurando pode ter sido removida, teve seu nome alterado ou está temporariamente indisponível.
            </p>
            <Link to="/" className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-full transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">home</span>
                Voltar para o Início
            </Link>
        </div>
    );
};