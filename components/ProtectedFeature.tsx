import React, { ReactNode } from 'react';
import { useEntitlements } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

interface ProtectedFeatureProps {
  children: ReactNode;
  requiredEntitlement: 'directoryAccess' | 'academyAccess' | 'premiumDiscounts' | 'basicSiteIncluded';
  fallback?: ReactNode;
  redirectTo?: string;
  showUpgradePrompt?: boolean;
}

/**
 * Componente que protege features baseado em entitlements
 * Nunca confia apenas em role - sempre verifica entitlements
 */
export function ProtectedFeature({
  children,
  requiredEntitlement,
  fallback,
  redirectTo,
  showUpgradePrompt = true,
}: ProtectedFeatureProps) {
  const entitlements = useEntitlements();
  const navigate = useNavigate();

  const hasAccess = entitlements[requiredEntitlement];

  if (hasAccess) {
    return <>{children}</>;
  }

  if (redirectTo) {
    // Redireciona silenciosamente (pode ser usado em rotas)
    React.useEffect(() => {
      navigate(redirectTo);
    }, [navigate]);
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return (
      <div className="p-6 bg-card-dark rounded-xl border border-card-border">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Upgrade Necessário</h3>
          <p className="text-text-secondary mb-4">
            Esta funcionalidade requer um plano premium.
          </p>
          <button
            onClick={() => navigate('/planos?upgrade=true')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Ver Planos
          </button>
        </div>
      </div>
    );
  }

  return null;
}
