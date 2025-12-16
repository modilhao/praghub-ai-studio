export interface Company {
  id: string;
  slug: string;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  shortLocation: string;
  description?: string;
  // Address Details
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  // Services
  tags: string[];
  specialties?: string[];
  imageUrl?: string;
  whatsapp?: string;
  isPremium: boolean;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
  cnpj?: string;
}

export interface Lead {
  id: string;
  customerName: string;
  serviceType: string;
  description: string;
  date: string;
  status: 'Novo' | 'Em Andamento' | 'Fechado';
  contact: string;
}

export enum UserRole {
  GUEST = 'GUEST',
  ADMIN = 'ADMIN',
  COMPANY = 'COMPANY'
}

export interface FilterState {
  premiumOnly: boolean;
  serviceType: string;
  location: string;
  sortBy: string;
}