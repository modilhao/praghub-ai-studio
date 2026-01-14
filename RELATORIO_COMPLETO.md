# 📊 RELATÓRIO COMPLETO DO PROJETO PRAGHUB

**Data de Geração:** Janeiro 2025  
**Versão do Projeto:** 0.0.0  
**Status:** MVP em desenvolvimento

---

## 📋 Sumário Executivo

**PragHub** é uma plataforma SaaS (Marketplace) que conecta empresas de controle de pragas (dedetizadoras) a clientes residenciais e comerciais. O foco é validar o **Product-Market Fit (PMF)** através de uma experiência fluida para o usuário final e ferramentas de gestão para o prestador.

---

## 🛠️ Stack Tecnológica

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React** | 19.2.3 | Framework Frontend |
| **TypeScript** | 5.8.2 | Tipagem estática |
| **Vite** | 6.2.0 | Build tool |
| **Tailwind CSS** | 4.1.18 | Estilização |
| **Supabase** | 2.88.0 | Backend-as-a-Service (Auth + DB + Storage) |
| **React Router DOM** | 7.10.1 | Roteamento SPA |
| **Google Identity Services** | - | Login com Google (opcional) |

---

## 🗃️ BANCO DE DADOS (Supabase/PostgreSQL)

### 📊 Diagrama de Relacionamento (ERD)

```
┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
│     auth.users      │       │      profiles       │       │      companies      │
│  (Supabase Auth)    │       │                     │       │                     │
├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
│ id (UUID) PK        │◄──────│ id (UUID) PK/FK     │       │ id (UUID) PK        │
│ email               │       │ email               │       │ owner_id (UUID) FK  │──────┐
│ user_metadata       │       │ name                │       │ name                │      │
│ created_at          │       │ picture             │       │ cnpj                │      │
│ ...                 │       │ role                │       │ description         │      │
└─────────────────────┘       │ created_at          │       │ rating              │      │
                                      ▲             │       │ reviews_count       │      │
                                      │             │       │ whatsapp            │      │
                                      │             │       │ location, city...   │      │
                                      │             │       │ is_premium          │      │
                                      │             │       │ status              │      │
┌─────────────────────┐               │             │       │ tags[], services[]  │      │
│       leads         │               │             │       │ certifications[]    │      │
├─────────────────────┤               │             │       │ profile_views       │      │
│ id (UUID) PK        │               │             │       │ whatsapp_clicks     │      │
│ company_id (FK)     │───────────────┼─────────────│       │ ...                 │      │
│ profile_id (FK)     │───────────────┘             │       │                     │      │
│ customer_name       │                             │       └─────────────────────┘      │
│ customer_phone      │                             │             ▲                    │
│ description         │                             │             │                    │
│ status              │                             │             └────────────────────┘
│ created_at          │                             │
└─────────────────────┘                             │
                                                     │
┌─────────────────────┐                             │
│      services       │                             │
├─────────────────────┤                             │
│ id (UUID) PK        │                             │
│ name                │                             │
│ slug                │                             │
│ icon                │                             │
│ created_at          │                             │
└─────────────────────┘                             │
```

### 📋 Tabela `profiles` (Perfis de Usuários)

Armazena informações de perfil dos usuários do sistema.

| Campo | Tipo | Descrição | Nullable | Default |
|-------|------|-----------|----------|---------|
| `id` | UUID | FK para auth.users.id (PK) | ❌ | - |
| `email` | TEXT | Email único | ❌ | - |
| `name` | TEXT | Nome do usuário | ✅ | NULL |
| `picture` | TEXT | URL da foto de perfil | ✅ | NULL |
| `role` | TEXT | ADMIN \| COMPANY \| CUSTOMER | ❌ | 'CUSTOMER' |
| `created_at` | TIMESTAMPTZ | Data de criação | ❌ | NOW() |

**Relações:**
- `id` → `auth.users.id` (1:1)
- Usuários com `role = 'COMPANY'` podem ter uma empresa em `companies`

**Políticas RLS:**
- `Public profiles are viewable by everyone` - SELECT público
- `Users can update their own profile` - UPDATE onde `auth.uid() = id`

**Trigger:**
- Criação automática de perfil quando usuário se cadastra via `handle_new_user()`

---

### 📋 Tabela `companies` (Empresas Parceiras)

Armazena informações das empresas parceiras do PragHub.

| Campo | Tipo | Descrição | Nullable | Default |
|-------|------|-----------|----------|---------|
| `id` | UUID | Identificador único | ❌ | gen_random_uuid() |
| `owner_id` | UUID | FK para profiles.id | ✅ | NULL |
| `name` | TEXT | Nome comercial | ❌ | - |
| `cnpj` | TEXT | CNPJ da empresa | ✅ | NULL |
| `description` | TEXT | Descrição longa | ✅ | NULL |
| `rating` | DECIMAL(3,2) | Nota (0-5) | ❌ | 0 |
| `reviews_count` | INTEGER | Número de avaliações | ❌ | 0 |
| `whatsapp` | TEXT | Número WhatsApp | ✅ | NULL |
| `location` | TEXT | Endereço/Região principal | ✅ | NULL |
| `city` | TEXT | Cidade | ✅ | NULL |
| `state` | TEXT | Estado | ✅ | NULL |
| `short_location` | TEXT | Localização resumida | ✅ | NULL |
| `image_url` | TEXT | Logo da empresa | ✅ | NULL |
| `is_premium` | BOOLEAN | Destaque premium | ❌ | FALSE |
| `status` | TEXT | PENDING \| APPROVED \| REJECTED | ❌ | 'PENDING' |
| `tags` | TEXT[] | Tags rápidas (24h, Aceita Cartão) | ✅ | NULL |
| `services` | TEXT[] | IDs dos serviços | ✅ | NULL |
| `website` | TEXT | Site da empresa | ✅ | NULL |
| `instagram` | TEXT | @ do Instagram | ✅ | NULL |
| `business_hours` | TEXT | Horário de funcionamento | ✅ | NULL |
| `year_founded` | INTEGER | Ano de fundação | ✅ | NULL |
| `owner_name` | TEXT | Nome do proprietário | ✅ | NULL |
| `methods` | TEXT[] | Métodos (Gel, Atomização) | ✅ | NULL |
| `gallery` | TEXT[] | URLs de fotos | ✅ | NULL |
| `certifications` | TEXT[] | Certificações (ANVISA, CRQ) | ✅ | NULL |
| `service_areas` | TEXT[] | Bairros/Regiões atendidas | ✅ | NULL |
| `specialties` | TEXT[] | Pragas especializadas | ✅ | NULL |
| `price_range` | TEXT | ECONOMIC \| STANDARD \| PREMIUM | ✅ | NULL |
| `profile_views` | INTEGER | Visualizações do perfil | ❌ | 0 |
| `whatsapp_clicks` | INTEGER | Cliques no WhatsApp | ❌ | 0 |
| `leads_generated` | INTEGER | Leads gerados | ❌ | 0 |
| `conversion_rate` | DECIMAL(5,2) | Taxa de conversão | ❌ | 0 |
| `created_at` | TIMESTAMPTZ | Data de criação | ❌ | NOW() |

**Relações:**
- `owner_id` → `profiles.id` (N:1, nullable)
  - Empresas migradas têm `owner_id = NULL`
  - Empresas cadastradas por usuários têm `owner_id` preenchido

**Políticas RLS:**
- `Companies are viewable by everyone` - SELECT onde `status = 'APPROVED' OR auth.uid() = owner_id`
- `Owners can update their own company` - UPDATE onde `auth.uid() = owner_id`
- `Enable insert for authenticated users` - INSERT para usuários autenticados

**Índices Recomendados:**
- `slug` (único) - Não implementado, mas recomendado
- `owner_id` (para buscas rápidas)
- `status` (para filtros)

---

### 📋 Tabela `leads` (Solicitações de Orçamento)

Armazena solicitações de orçamento de clientes para empresas.

| Campo | Tipo | Descrição | Nullable | Default |
|-------|------|-----------|----------|---------|
| `id` | UUID | Identificador único | ❌ | gen_random_uuid() |
| `company_id` | UUID | FK para companies.id | ✅ | NULL |
| `profile_id` | UUID | FK para profiles.id | ✅ | NULL |
| `customer_name` | TEXT | Nome do cliente | ❌ | - |
| `customer_phone` | TEXT | Telefone/WhatsApp | ❌ | - |
| `service_id` | TEXT | ID do serviço | ✅ | NULL |
| `description` | TEXT | Descrição do problema | ✅ | NULL |
| `status` | TEXT | NEW \| IN_PROGRESS \| CLOSED \| ARCHIVED | ❌ | 'NEW' |
| `created_at` | TIMESTAMPTZ | Data de criação | ❌ | NOW() |
| `updated_at` | TIMESTAMPTZ | Data de atualização | ❌ | NOW() |

**Relações:**
- `company_id` → `companies.id` (N:1)
- `profile_id` → `profiles.id` (N:1, nullable)

**Políticas RLS:**
- `Users can see leads they created` - SELECT onde `auth.uid() = profile_id`
- `Companies can see leads assigned to them` - SELECT verificando ownership
- `Customers can create leads` - INSERT público

---

### 📋 Tabela `services` (Tipos de Serviços)

Armazena os tipos de serviços oferecidos pelas empresas.

| Campo | Tipo | Descrição | Nullable | Default |
|-------|------|-----------|----------|---------|
| `id` | UUID | Identificador único | ❌ | gen_random_uuid() |
| `name` | TEXT | Nome do serviço | ❌ | - |
| `slug` | TEXT | URL-friendly (único) | ❌ | - |
| `icon` | TEXT | Ícone Material Symbols | ✅ | NULL |
| `created_at` | TIMESTAMPTZ | Data de criação | ❌ | NOW() |

**Políticas RLS:**
- `Services are viewable by everyone` - SELECT público

---

### 🔧 Trigger de Criação de Perfil

```sql
-- Função que cria perfil automaticamente quando usuário se cadastra
CREATE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, picture, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data ->> 'name', 
    new.raw_user_meta_data ->> 'picture',
    'CUSTOMER'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## 🗺️ MAPA DE ROTAS E TELAS

### Rotas Públicas

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | `LandingPartner` | Landing page para empresas parceiras |
| `/consumidores` | `LandingConsumer` | Landing page para consumidores |
| `/demonstracao` | `Home` | Diretório/Busca de empresas |
| `/company/:id` | `CompanyProfile` | Perfil público de uma empresa |
| `/register` | `Register` | Cadastro de empresas |
| `/login` | `Login` | Autenticação |
| `/forgot-password` | `ForgotPassword` | Recuperação de senha |
| `/terms` | `Legal` | Termos de uso |
| `/privacy` | `Legal` | Política de privacidade |
| `*` | `NotFound` | Página 404 |

### Rotas Protegidas

| Rota | Componente | Permissão | Descrição |
|------|------------|-----------|-----------|
| `/admin` | `Admin` | ADMIN | Painel administrativo |
| `/dashboard` | `CompanyDashboard` | COMPANY, ADMIN | Painel da empresa |

---

## 📱 DETALHAMENTO DAS TELAS

### 1️⃣ Landing Page Parceiros (`/`)

**Propósito:** Converter empresas de controle de pragas em parceiros cadastrados.

**Seções:**
- **Hero:** Título de valor + CTA para cadastro
- **Reconhecimento do Problema:** Lista de dores do mercado
- **Proposta de Valor:** 3 benefícios principais
- **Destaque Premium:** Explicação do plano pago
- **Redução de Risco:** Sem contrato, sem taxa oculta
- **PragHub 2.0:** Antecipação de features futuras
- **Qualificação:** Para quem é / não é
- **Empresas Licenciadas:** Cases de sucesso reais (Dedemax, Detecta, Ártica, DEDEMAX Facilities)
- **CTA Final:** Botão de cadastro

**UX Highlights:**
- Tema escuro profissional (dark mode)
- Gradientes azul (#0078D7) como cor primária
- Cards com bordas sutis e sombras
- Animações em hover
- Design mobile-first responsivo

---

### 2️⃣ Landing Page Consumidores (`/consumidores`)

**Propósito:** Educar consumidores B2B sobre os riscos de contratar mal.

**Seções:**
- **Hero:** Buscar empresas confiáveis
- **Problema:** Riscos de contratação errada (interdição, sanitária, retrabalho)
- **Solução:** Como o PragHub ajuda na decisão
- **Público-Alvo:** Síndicos, facilities, indústrias
- **Futuro:** Preview do PragHub 2.0
- **CTA:** Botão de busca

---

### 3️⃣ Home / Diretório (`/demonstracao`)

**Propósito:** Buscar e comparar empresas de controle de pragas.

**Funcionalidades:**
- 🔍 **Busca por localização** (cidade/bairro)
- 🔍 **Filtro por tipo de serviço** (dropdown)
- ⭐ **Filtro "Apenas Premium"**
- 📱 **Cards de empresas** com:
  - Logo ou iniciais
  - Nome e avaliação
  - Localização
  - Tags de serviço
  - Botão "Chamar no WhatsApp"
  - Botão "Ver perfil completo"
- 📊 **Contador de resultados**
- 🎨 **Estado de loading** com skeleton

**UX Highlights:**
- Formulário de busca em destaque no hero
- Sidebar de filtros (desktop)
- Grid responsivo (1/2/3 colunas)
- Animações de hover nos cards
- Empresas Premium destacadas com badge e borda azul

---

### 4️⃣ Perfil da Empresa (`/company/:id`)

**Propósito:** Página pública detalhada de uma empresa.

**Seções:**
- **Hero Card:** Logo, nome, rating, localização, badges
- **Sobre:** Descrição e história
- **Horários:** Funcionamento
- **Redes Sociais:** Links website e Instagram
- **Sidebar CTA:** Botões fixos (sticky)
  - "FALAR NO WHATSAPP" (principal)
  - "PEDIR ORÇAMENTO" (abre modal)

**Modal de Orçamento:**
- Nome completo
- Celular/WhatsApp
- Descrição do problema
- Envia para tabela `leads`
- Feedback visual de sucesso

---

### 5️⃣ Registro de Empresa (`/register`)

**Propósito:** Onboarding de novas empresas parceiras.

**Fluxo (3 etapas visuais):**
1. **Dados da Conta:** Email + Senha
2. **Dados da Empresa:** Nome, cidade, WhatsApp
3. **Serviços e Cobertura:** Tags de serviço, segmentos, bairros
4. **Premium (opcional):** Checkbox do plano

**Funcionalidades:**
- Validação de formulário
- Criação de conta no Supabase Auth
- Criação de perfil (trigger automático)
- Criação da empresa com `status: 'PENDING'`
- Atualização do role para 'COMPANY'
- Redirecionamento para `/dashboard`

---

### 6️⃣ Login (`/login`)

**Propósito:** Autenticação de usuários.

**Métodos:**
- Login com Google (via GIS) - **Placeholder**
- Login com Email/Senha

**Funcionalidades:**
- Redirecionamento baseado em role:
  - ADMIN → `/admin`
  - COMPANY → `/dashboard`
  - CUSTOMER → `/`
- Link para recuperação de senha
- Link para cadastro de empresas

---

### 7️⃣ Dashboard da Empresa (`/dashboard`)

**Propósito:** Painel de gestão para empresas parceiras.

**Abas:**
1. **Resumo (Overview):**
   - Estatísticas: Visitas, Cliques WhatsApp, Leads, Conversão
   - Indicador de completude do perfil (85%)
   - CTA para completar perfil

2. **Leads:**
   - Lista de leads recebidos
   - Nome, telefone, descrição
   - Botão WhatsApp para contato

3. **Desempenho (Analytics):**
   - Gráfico de barras (cliques últimos 30 dias)

4. **Meu Perfil:**
   - Edição de: Nome, WhatsApp, Cidade, Descrição
   - Certificações, Áreas de Atendimento
   - Especialidades, Métodos

**Sidebar:**
- Logo
- Navegação por abas
- Info do usuário logado
- Botão de logout

---

### 8️⃣ Painel Admin (`/admin`)

**Propósito:** Gestão central da plataforma.

**Abas:**
1. **Visão Geral:**
   - Total de empresas
   - Pendentes de aprovação
   - Total de leads
   - % de empresas Premium
   - Últimos cadastros
   - Gráfico de atividade de leads

2. **Empresas:**
   - Tabela com busca
   - Colunas: Empresa, CNPJ, Premium, Status, Ações
   - Toggle Premium
   - Botões: Aprovar, Editar, Excluir
   - Modal de edição com:
     - Status de aprovação
     - Toggle Premium
     - Notas administrativas

3. **Leads Globais:**
   - Lista de todos os leads do sistema
   - Nome do cliente, telefone
   - Empresa destino
   - Status

4. **Configurações:** (placeholder)

---

### 9️⃣ Página de Recuperação de Senha (`/forgot-password`)

**Funcionalidades:**
- Input de email
- Envio de link de reset via Supabase
- Feedback de sucesso/erro

---

### 🔟 Páginas Legais (`/terms`, `/privacy`)

**Conteúdo:**
- Termos de uso
- Política de privacidade
- Data da última atualização
- Textos placeholder para MVP

---

## 🎨 SISTEMA DE DESIGN (UX/UI)

### Paleta de Cores

| Variável | Valor | Uso |
|----------|-------|-----|
| `--color-primary` | `#0078D7` | CTAs, links, destaques |
| `--color-primary-hover` | `#0062b0` | Hover de botões |
| `--color-background-dark` | `#0f172a` | Fundo principal (dark) |
| `--color-card-dark` | `#1e293b` | Cards e containers |
| `--color-card-border` | `#334155` | Bordas de cards |
| `--color-text-secondary` | `#94a3b8` | Textos secundários |
| `--color-accent-blue` | `#0ea5e9` | Acentos |

### Tipografia

- **Fonte principal:** Manrope (Google Fonts)
- **Pesos usados:** 400 (regular), 500 (medium), 700 (bold), 800 (extrabold), 900 (black)
- **Ícones:** Material Symbols Outlined (Google Fonts)

### Componentes Visuais

- **Bordas arredondadas:** `rounded-xl` (1rem), `rounded-2xl` (1.5rem), `rounded-3xl` (2rem), `rounded-full`
- **Sombras:** `shadow-lg`, `shadow-2xl`, `shadow-primary/20`
- **Transições:** `transition-all`, `transition-colors`
- **Animações:** `animate-in`, `fade-in`, `zoom-in-95`, `slide-in-from-bottom-4`, `bounceIn`

### Estados Interativos

- **Hover:** Escala (`scale-[1.02]`), borda colorida, sombra aumentada
- **Loading:** Spinner circular, skeleton shimmer
- **Focus:** Ring azul (`ring-primary/50`)
- **Disabled:** Opacidade reduzida, cursor proibido

---

## 🔐 SISTEMA DE AUTENTICAÇÃO

### Contexto (`AuthContext.tsx`)

**Estado:**
- `user: User | null` - Dados do usuário logado
- `isLoading: boolean` - Estado de carregamento

**Métodos:**
- `login(googleCredential?)` - Login com Google
- `signInWithEmail(email, password)` - Login com email
- `signUpWithEmail(email, password)` - Cadastro com email
- `logout()` - Deslogar

**Roles (Papéis):**
- `ADMIN` - Acesso total ao sistema
- `COMPANY` - Empresa parceira com dashboard
- `CUSTOMER` - Usuário consumidor

**Self-Healing:**
O sistema automaticamente corrige o role do usuário para `COMPANY` se ele possuir uma empresa cadastrada mas ainda estiver como `CUSTOMER`.

---

## 🔒 PROTEÇÃO DE ROTAS

O componente `ProtectedRoute` implementa:
- Verificação de autenticação
- Verificação de roles permitidos
- Redirecionamento baseado em role
- Estado de loading com spinner

---

## 📊 MÉTRICAS RASTREADAS

| Métrica | Campo | Descrição |
|---------|-------|-----------|
| `profile_views` | companies | Visualizações do perfil |
| `whatsapp_clicks` | companies | Cliques no botão WhatsApp |
| `leads_generated` | companies | Leads recebidos |
| `conversion_rate` | companies | Taxa de conversão |

---

## ⚠️ PROBLEMAS CONHECIDOS

### 🔴 Críticos

1. **RLS bloqueando queries**
   - **Status:** 🔴 Em investigação
   - **Problema:** Empresas com `owner_id = NULL` podem não aparecer
   - **Solução:** Executar `scripts/FIX_RLS_POLICIES.sql`

2. **CNPJ referenciado mas não existe**
   - **Status:** ✅ Resolvido (removido do código)
   - **Problema:** Campo pode causar erros
   - **Solução:** Removidas todas as referências ao campo

### 🟡 Médios

1. **Empresas migradas sem owner_id**
   - **Status:** ⚠️ Funcional, mas pode causar problemas
   - **Problema:** Empresas migradas têm `owner_id = NULL`
   - **Impacto:** Empresas não aparecem no dashboard de usuários
   - **Solução futura:** Criar usuários "sistema" ou ajustar políticas RLS

2. **Inconsistência id vs slug**
   - **Status:** 🟡 Documentado
   - **Problema:** Roteamento usa UUID, não slug
   - **Impacto:** Pode causar problemas de roteamento
   - **Recomendação:** Padronizar uso de `slug` para URLs

3. **Campo initials não definido**
   - **Status:** 🟡 Documentado
   - **Problema:** Código usa `company.initials` mas não existe no tipo
   - **Impacto:** Calculado em runtime
   - **Solução:** Usar função helper `getCompanyInitials()`

### 🟢 Baixos

1. **Falta paginação**
   - **Status:** 🟡 Melhoria futura
   - **Problema:** Listagens carregam todas as empresas de uma vez
   - **Impacto:** Performance com muitas empresas
   - **Solução:** Implementar paginação no Supabase

2. **Google Client ID placeholder**
   - **Status:** 🟡 Não crítico
   - **Problema:** Login Google não funcional
   - **Solução:** Configurar Google Client ID real

3. **Checkout pendente**
   - **Status:** 🟡 Pendente
   - **Problema:** Plano Premium não implementado
   - **Solução:** Implementar fluxo de checkout

---

## 📈 PRÓXIMOS PASSOS RECOMENDADOS

### Alta Prioridade

1. ✅ Executar `FIX_RLS_POLICIES.sql` no Supabase
2. ⏳ Implementar checkout para plano Premium
3. ⏳ Configurar Google Client ID real
4. ⏳ Adicionar paginação nas listagens

### Média Prioridade

1. ⏳ Sistema de avaliações/reviews
2. ⏳ Galeria de fotos para empresas
3. ⏳ Notificações de novos leads
4. ⏳ Busca por geolocalização

### Baixa Prioridade

1. ⏳ Testes automatizados
2. ⏳ PWA/App mobile
3. ⏳ Dashboard de analytics avançado
4. ⏳ Chat interno entre empresa e cliente

---

## 📁 ESTRUTURA DE ARQUIVOS

```
praghub/
├── 📄 index.html              # HTML principal
├── 📄 index.tsx                # Ponto de entrada React
├── 📄 App.tsx                  # Componente raiz com rotas
├── 📄 types.ts                 # Definições TypeScript
├── 📄 vite.config.ts           # Configuração Vite
├── 📄 package.json             # Dependências e scripts
│
├── 📂 pages/                   # Páginas da aplicação
│   ├── Home.tsx                # Página inicial (lista empresas)
│   ├── Admin.tsx               # Dashboard administrativo
│   ├── CompanyDashboard.tsx     # Dashboard da empresa
│   ├── CompanyProfile.tsx       # Perfil público da empresa
│   ├── Login.tsx                # Login
│   ├── Register.tsx             # Registro (company/consumer)
│   ├── ForgotPassword.tsx       # Recuperação de senha
│   ├── LandingConsumer.tsx      # Landing page consumidor
│   ├── LandingPartner.tsx       # Landing page parceiro
│   ├── Legal.tsx                # Páginas legais
│   └── NotFound.tsx             # 404
│
├── 📂 components/              # Componentes reutilizáveis
│   ├── ProtectedRoute.tsx      # Rota protegida (autenticação)
│   ├── ScrollToTop.tsx         # Scroll automático
│   ├── SessionNotification.tsx # Notificação de sessão
│   ├── Shared.tsx              # Header e Footer
│   └── Toast.tsx               # Notificações toast
│
├── 📂 contexts/
│   └── AuthContext.tsx         # Contexto de autenticação
│
├── 📂 lib/
│   └── supabase.ts             # Cliente Supabase
│
├── 📂 scripts/                 # Scripts de manutenção
│   ├── migrate-companies.js    # Migração de empresas
│   ├── create-admin.js         # Criação de usuário admin
│   ├── FIX_RLS_POLICIES.sql    # Script SQL para corrigir RLS
│   └── ...
│
├── 📂 public/                  # Arquivos estáticos
│   ├── logo-header.png
│   ├── logo-footer.png
│   └── manifest.json
│
└── 📂 dist/                    # Build de produção
```

---

## 🔗 FLUXOS PRINCIPAIS

### Fluxo de Autenticação

```
1. Usuário faz login (Login.tsx)
   ↓
2. Supabase Auth valida credenciais
   ↓
3. AuthContext busca perfil em profiles
   ↓
4. Redireciona baseado no role:
   - admin → /admin
   - company → /dashboard
   - consumer → /
```

### Fluxo de Registro de Empresa

```
1. Usuário preenche formulário (Register.tsx)
   ↓
2. Cria usuário em auth.users
   ↓
3. Trigger cria perfil em profiles (role = 'CUSTOMER')
   ↓
4. Cria empresa em companies (owner_id = user.id, status = 'PENDING')
   ↓
5. Atualiza role do perfil para 'COMPANY'
   ↓
6. Redireciona para /dashboard
```

### Fluxo de Visualização de Empresas

```
Página Home (público):
1. Home.tsx busca empresas do Supabase
   ↓
2. Query: SELECT * FROM companies WHERE status = 'APPROVED'
   ↓
3. RLS verifica permissão (anon pode ver aprovadas)
   ↓
4. Mapeia dados (snake_case → camelCase)
   ↓
5. Exibe na interface
```

### Fluxo de Criação de Lead

```
1. Cliente acessa perfil da empresa (/company/:id)
   ↓
2. Clica em "PEDIR ORÇAMENTO"
   ↓
3. Preenche modal (nome, telefone, descrição)
   ↓
4. Envia para tabela leads
   ↓
5. Empresa recebe notificação (futuro)
   ↓
6. Empresa visualiza no dashboard
```

---

## 📝 CHECKLIST DE CONFIGURAÇÃO

### Supabase

- [ ] Tabela `companies` criada com todos os campos
- [ ] Tabela `profiles` criada
- [ ] Tabela `leads` criada
- [ ] Tabela `services` criada
- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas RLS configuradas (ver `FIX_RLS_POLICIES.sql`)
- [ ] Trigger para criar `profiles` automaticamente
- [ ] Índices criados (`slug`, `owner_id`, `status`)

### Variáveis de Ambiente

- [ ] `VITE_SUPABASE_URL` configurado
- [ ] `VITE_SUPABASE_ANON_KEY` configurado
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado (apenas para scripts)

### Aplicação

- [ ] Dados migrados (`npm run migrate-companies`)
- [ ] Usuário admin criado (`npm run create-admin`)
- [ ] Políticas RLS aplicadas
- [ ] Testado em produção

---

## 📞 DOCUMENTAÇÃO ADICIONAL

Para problemas relacionados a:
- **Migração de dados:** Ver `scripts/MIGRAR_EMPRESAS.md`
- **RLS e permissões:** Ver `scripts/VERIFICAR_RLS.md`
- **Criação de admin:** Ver `scripts/COMO_OBTER_SERVICE_ROLE_KEY.md`
- **Inconsistências gerais:** Ver `RELATORIO_INCONSISTENCIAS.md`
- **Estrutura e problemas:** Ver `ESTRUTURA_E_PROBLEMAS.md`

---

**Documento mantido por:** Equipe PragHub  
**Última revisão:** Janeiro 2025
