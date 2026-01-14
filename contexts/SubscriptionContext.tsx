import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getEntitlements, getActiveSubscription } from '../lib/subscriptions';
import type { Entitlements, Subscription } from '../types';

interface SubscriptionContextType {
  entitlements: Entitlements | null;
  subscription: Subscription | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    if (!user) {
      setEntitlements(null);
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [entitlementsData, subscriptionData] = await Promise.all([
        getEntitlements(user.id),
        getActiveSubscription(user.id),
      ]);

      setEntitlements(entitlementsData);
      setSubscription(subscriptionData);
    } catch (err) {
      console.error('Error loading subscription data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  return (
    <SubscriptionContext.Provider
      value={{
        entitlements,
        subscription,
        isLoading,
        error,
        refresh: loadData,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

/**
 * Hook para verificar entitlements específicos
 */
export function useEntitlements() {
  const { entitlements, isLoading } = useSubscription();

  return {
    directoryAccess: entitlements?.directoryAccess ?? false,
    academyAccess: entitlements?.academyAccess ?? false,
    premiumDiscounts: entitlements?.premiumDiscounts ?? false,
    basicSiteIncluded: entitlements?.basicSiteIncluded ?? false,
    isLoading,
    hasAnyAccess: (entitlements?.directoryAccess || 
                   entitlements?.academyAccess || 
                   entitlements?.premiumDiscounts || 
                   entitlements?.basicSiteIncluded) ?? false,
  };
}
