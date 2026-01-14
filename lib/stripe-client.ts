/**
 * Cliente Stripe para chamadas de API do frontend
 * Nota: Operações sensíveis devem ser feitas via Edge Functions
 */

import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Cria uma sessão de checkout no Stripe
 */
export async function createCheckoutSession(planKey: 'directory' | 'directory_academy' | 'premium'): Promise<{ sessionId: string; url: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Usuário não autenticado');
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY || '',
    },
    body: JSON.stringify({ planKey }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    const errorMessage = errorData.error || 'Erro ao criar sessão de checkout';
    
    // Mensagem mais clara para erro de Price ID
    if (errorMessage.includes('No such price') || errorMessage.includes('live mode') || errorMessage.includes('test mode')) {
      throw new Error(
        `Erro de Price ID: ${errorMessage}\n\n` +
        `Isso geralmente acontece quando os Price IDs são de produção mas a chave é de teste (ou vice-versa).\n` +
        `Consulte: scripts/EPIC_01_FIX_PRICE_IDS_TESTE.md`
      );
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Sincroniza subscription manualmente
 */
export async function syncSubscription(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Usuário não autenticado');
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/sync-subscription`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY || '',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    const errorMessage = errorData.error || 'Erro ao sincronizar assinatura';
    
    // Mensagem mais clara para diferentes tipos de erro
    if (response.status === 404) {
      if (errorMessage.includes('No customer found')) {
        throw new Error('Nenhum cliente encontrado no Stripe. Complete um checkout primeiro.');
      } else if (errorMessage.includes('No active subscription')) {
        throw new Error('Nenhuma assinatura ativa encontrada no Stripe.');
      } else {
        throw new Error('Assinatura não encontrada. O webhook pode ainda não ter processado. Aguarde alguns segundos e tente novamente.');
      }
    }
    
    throw new Error(errorMessage);
  }
}
