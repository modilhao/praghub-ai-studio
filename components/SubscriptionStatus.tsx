import React, { useState } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { syncSubscription } from '../lib/stripe-client';

export function SubscriptionStatus() {
  const { subscription, entitlements, isLoading, refresh } = useSubscription();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);

  if (isLoading) {
    return (
      <div className="p-4 bg-card-dark rounded-lg border border-card-border">
        <div className="animate-pulse">Carregando status da assinatura...</div>
      </div>
    );
  }

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncSubscription();
      await refresh();
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      // Erro será tratado pelo componente pai via Toast
      console.error('Erro ao sincronizar:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!subscription) {
    return (
      <div className="p-4 bg-card-dark rounded-lg border border-card-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Nenhuma assinatura ativa</h3>
            <p className="text-sm text-text-secondary mb-2">
              Assine um plano para acessar recursos premium
            </p>
            <p className="text-xs text-text-secondary">
              Se você acabou de fazer um pagamento, clique em "Sincronizar" para atualizar.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-card-border text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
            <button
              onClick={() => navigate('/planos')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Ver Planos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isActive = subscription.status === 'active' || subscription.status === 'trialing';
  const isPastDue = subscription.status === 'past_due';
  const isCanceled = subscription.status === 'canceled';

  const statusColors = {
    active: 'text-green-400',
    trialing: 'text-blue-400',
    past_due: 'text-yellow-400',
    canceled: 'text-red-400',
  };

  const statusLabels = {
    active: 'Ativa',
    trialing: 'Período de Teste',
    past_due: 'Pagamento Pendente',
    canceled: 'Cancelada',
  };

  return (
    <div className="p-4 bg-card-dark rounded-lg border border-card-border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold mb-1">Assinatura {statusLabels[subscription.status as keyof typeof statusLabels]}</h3>
          <p className={`text-sm ${statusColors[subscription.status as keyof typeof statusColors] || 'text-text-secondary'}`}>
            Plano: {subscription.planKey === 'directory' ? 'Diretório' : 
                    subscription.planKey === 'directory_academy' ? 'Diretório + Academia' : 
                    'Premium'}
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="px-3 py-1 text-sm bg-card-dark border border-card-border rounded hover:bg-card-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
        </button>
      </div>

      {isActive && (
        <div className="text-sm text-text-secondary">
          <p>
            Próxima renovação: {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
          </p>
        </div>
      )}

      {isPastDue && (
        <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded text-sm text-yellow-300">
          ⚠️ Seu pagamento está pendente. Atualize seu método de pagamento para continuar acessando.
        </div>
      )}

      {isCanceled && subscription.cancelAtPeriodEnd && (
        <div className="mt-3 p-3 bg-blue-900/20 border border-blue-700 rounded text-sm text-blue-300">
          Sua assinatura será cancelada em {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
        </div>
      )}

      {entitlements && (
        <div className="mt-4 pt-4 border-t border-card-border">
          <p className="text-xs text-text-secondary mb-2">Acessos ativos:</p>
          <div className="flex flex-wrap gap-2">
            {entitlements.directoryAccess && (
              <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded">
                Diretório
              </span>
            )}
            {entitlements.academyAccess && (
              <span className="px-2 py-1 text-xs bg-blue-900/30 text-blue-300 rounded">
                Academia
              </span>
            )}
            {entitlements.premiumDiscounts && (
              <span className="px-2 py-1 text-xs bg-purple-900/30 text-purple-300 rounded">
                Descontos Premium
              </span>
            )}
            {entitlements.basicSiteIncluded && (
              <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded">
                Site Básico
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
