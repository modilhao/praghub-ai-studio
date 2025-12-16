export interface Company {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  shortLocation: string;
  tags: string[];
  imageUrl?: string;
  initials?: string;
  isPremium?: boolean;
  status?: 'Aprovado' | 'Pendente' | 'Rejeitado';
  whatsapp: string;
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