import type { Company } from '../types';
import { getCompanyInitials } from './utils';

/**
 * Mapeia dados do banco de dados (snake_case) para o tipo Company (camelCase)
 * Centraliza a lógica de mapeamento para evitar repetição de código
 */
export function mapCompanyFromDB(data: any): Company {
  // Validar campos obrigatórios
  if (!data.id || !data.name) {
    console.error('Dados inválidos ao mapear Company:', data);
    throw new Error('Dados da empresa inválidos: id ou name faltando');
  }

  const companyData = {
    id: data.id,
    userId: data.owner_id,
    name: data.name,
    description: data.description || null,
    rating: Number(data.rating || 0),
    reviewsCount: data.reviews_count || 0,
    whatsapp: data.whatsapp || '',
    location: data.location || data.short_location || data.city || 'Localização não informada',
    city: data.city,
    state: data.state,
    imageUrl: data.image_url,
    isPremium: data.is_premium || false,
    status: (data.status || 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED',
    services: data.services || [],
    createdAt: data.created_at,
    shortLocation: data.short_location,
    tags: data.tags || [],
    website: data.website,
    instagram: data.instagram,
    businessHours: data.business_hours,
    yearFounded: data.year_founded,
    ownerName: data.owner_name,
    methods: data.methods,
    gallery: data.gallery,
    certifications: data.certifications,
    serviceAreas: data.service_areas,
    specialties: data.specialties,
    priceRange: data.price_range,
    analytics: data.profile_views || data.whatsapp_clicks || data.leads_generated || data.conversion_rate
      ? {
          profileViews: data.profile_views || 0,
          whatsappClicks: data.whatsapp_clicks || 0,
          leadsGenerated: data.leads_generated || 0,
          conversionRate: data.conversion_rate || 0,
        }
      : undefined,
  };
  
  // Gerar initials usando a função helper
  return {
    ...companyData,
    initials: getCompanyInitials(companyData),
  };
}
