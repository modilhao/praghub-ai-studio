
export type UserRole = 'ADMIN' | 'COMPANY' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  role: UserRole;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string; // ex: 'desratizacao'
  icon: string;
}

export interface CompanyAnalytics {
  profileViews: number;
  whatsappClicks: number;
  leadsGenerated: number;
  conversionRate: number;
}

export interface Company {
  id: string;
  userId?: string;
  name: string;
  cnpj?: string;
  description?: string; // Campo opcional de descrição
  rating: number;
  reviewsCount: number;
  whatsapp: string;
  location: string; // Endereço principal ou Região
  city?: string;
  state?: string;
  imageUrl?: string;
  isPremium: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  services?: string[]; // IDs de serviços (ex: serv_1, serv_2)
  createdAt?: string;
  shortLocation?: string;
  tags?: string[]; // Tags rápidas (ex: '24h', 'Aceita Cartão')
  initials?: string;

  // Campos para melhoria de Product-Market Fit e Busca
  website?: string;
  instagram?: string;
  businessHours?: string;
  analytics?: CompanyAnalytics;

  // Novos campos para busca e credibilidade
  gallery?: string[]; // URLs de fotos de trabalhos realizados
  certifications?: string[]; // ex: ['ANVISA', 'CRQ', 'NR-35']
  serviceAreas?: string[]; // Bairros ou cidades vizinhas atendidas
  specialties?: string[]; // Pragas específicas (ex: 'Escorpiões', 'Pombos')
  priceRange?: 'ECONOMIC' | 'STANDARD' | 'PREMIUM';
  yearFounded?: number;
  ownerName?: string;
  methods?: string[]; // ex: ['Gel', 'Atomização', 'Iscas Pet-Safe']
}

export interface Lead {
  id: string;
  companyId: string;
  profileId?: string;
  customerName: string;
  customerPhone: string;
  serviceId?: string;
  companyName?: string; // For Admin view
  description: string;
  status: 'NEW' | 'IN_PROGRESS' | 'CLOSED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  leadId: string;
  senderId: string;
  senderType: 'COMPANY' | 'CUSTOMER';
  text: string;
  isRead: boolean;
  createdAt: string;
}
