
# 🎯 PragHub - Marketplace de Controle de Pragas

O **PragHub** é uma plataforma SaaS de alta performance projetada para conectar prestadores de serviços de controle de pragas (dedetizadoras) a clientes residenciais e comerciais. O foco do protótipo atual é validar o **Product-Market Fit (PMF)** através de uma experiência fluida para o usuário e ferramentas de gestão para o prestador.

---

## 🚀 Funcionalidades Principais

### Para Clientes (Usuário Final)
- **Diretório Inteligente**: Busca de empresas por localização, tipo de praga ou serviço.
- **Perfis Detalhados**: Visualização de histórico, especialidades, certificações (ANVISA/CRQ) e horários.
- **Conversão Rápida**: Botão direto para WhatsApp e formulário de solicitação de orçamento.
- **Filtros Avançados**: Opção de visualizar apenas empresas "Premium" ou verificadas.

### Para Prestadores (Empresas)
- **Dashboard PRO**: Monitoramento de métricas (Visualizações de perfil vs. Cliques no WhatsApp).
- **Gestão de Perfil**: Edição em tempo real de informações comerciais e diferenciais.
- **Gestão de Leads**: Mini-CRM para visualizar e acompanhar novos pedidos de orçamento.
- **Onboarding Progressivo**: Fluxo de cadastro em etapas para garantir a qualidade dos dados.

### Para Administradores
- **Console Central**: Visão global de todas as empresas e leads do sistema.
- **Controle de Status**: Aprovação ou rejeição de novos parceiros.
- **Gestão de Monetização**: Ativação/Desativação manual do selo "Premium".

---

## 🔑 Acesso e Autenticação

O sistema utiliza **Google Identity Services** para login. Como este é um protótipo, o controle de permissões no `AuthContext.tsx` é baseado em strings no email:

| Papel (Role) | Regra de Simulação (Email contém...) | Destino após Login |
| :--- | :--- | :--- |
| **ADMIN** | `admin` (ex: admin@praghub.com) | `/admin` |
| **COMPANY** | `fastclean` ou `empresa` | `/dashboard` |
| **CUSTOMER** | Qualquer outro email | `/` |

---

## 🏗️ Arquitetura de Dados (`types.ts`)

Embora o estado seja volátil (localStorage/Memory), a estrutura foi desenhada para ser escalável:

- **Company**: Contém metadados de busca (tags, specialties), geolocalização, dados de confiança (certifications, yearFounded) e métricas.
- **Lead**: Registra a intenção de compra, vinculando cliente, empresa e descrição do problema.
- **User**: Gerencia a identidade e o papel do usuário no ecossistema.

> **O que é REAL:** Lógica de rotas, interface de usuário, filtros de busca, validação de campos, simulador de login, dashboard funcional.
> **O que é FAKE (Mock):** Persistência em banco de dados real (atualmente usa `localStorage`), integração real de envio de email (simulado por toasts).

---

## 🗺️ Mapa de Rotas

| Rota | Descrição | Status |
| :--- | :--- | :--- |
| `/` | Landing Page e busca de diretório | ✅ Pronta |
| `/company/:id` | Perfil público da empresa | ✅ Pronta |
| `/register` | Fluxo de cadastro de prestador | ✅ Pronta |
| `/login` | Página de acesso (Google/Email) | ✅ Pronta |
| `/dashboard` | Painel do Prestador de Serviço | ✅ Pronta |
| `/admin` | Painel de Controle da Plataforma | ✅ Pronta |
| `/privacy` / `/terms` | Documentação legal | ✅ Pronta |
| `/checkout` | Assinatura do Plano Premium | ⏳ Pendente |
| `/reviews` | Sistema de avaliação detalhada | ⏳ Pendente |

---

## 🎨 Sistema de Design

### Cores (Tailwind Config)
- **Primary**: `#0078D7` (Azul Profissional) - Confiança e tecnologia.
- **Background Dark**: `#0f172a` (Slate 900) - Elegância e foco.
- **Card Dark**: `#1e293b` (Slate 800) - Profundidade visual.
- **Success**: `#10b981` (Emerald 500) - Status online e aprovação.

### Tipografia
- **Manrope**: Fonte principal para títulos e corpo, oferecendo legibilidade moderna e geométrica.
- **Material Symbols Outlined**: Ícones de sistema consistentes e leves.

---

## 🛠️ Próximos Passos para PMF
1. **Notificações**: Implementar alertas via browser quando um novo lead chegar.
2. **Galeria de Fotos**: Permitir que empresas subam fotos de serviços (antes/depois) para aumentar conversão.
3. **Busca por Georeferenciamento**: Ordenar resultados pela distância real do técnico até o cliente.
4. **Sistema de Depoimentos**: Validar prova social como fator de decisão de compra.

---
*Este projeto foi desenvolvido com foco em UI/UX de alta conversão, garantindo que o prestador sinta o valor do produto desde o primeiro login.*
