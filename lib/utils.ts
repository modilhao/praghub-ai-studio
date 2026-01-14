import type { Company } from '../types';

/**
 * Gera as iniciais de uma empresa a partir do nome
 */
export function getCompanyInitials(company: Company | { name: string }): string {
  if (!company.name) return '??';
  
  const words = company.name.trim().split(/\s+/);
  
  if (words.length === 1) {
    // Se tem apenas uma palavra, pega as duas primeiras letras
    return words[0].substring(0, 2).toUpperCase();
  }
  
  // Se tem múltiplas palavras, pega a primeira letra de cada uma (máximo 2)
  return words
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() || '')
    .join('')
    .substring(0, 2);
}
