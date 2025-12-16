# 📚 Estrutura do Banco de Dados, Arquivos e Problemas - PragHub

**Última atualização:** Janeiro 2025  
**Versão:** 0.0.0

---

## 📊 Estrutura do Banco de Dados (Supabase)

### 🔐 Tabela `auth.users` (Supabase Auth)
Tabela gerenciada automaticamente pelo Supabase para autenticação.

**Campos principais:**
- `id` (UUID) - Identificador único do usuário
- `email` (text) - Email do usuário
- `user_metadata` (jsonb) - Metadados customizados (role, full_name, etc.)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Relações:**
- Um usuário pode ter um perfil em `profiles` (1:1)
- Um usuário pode ser dono de uma empresa em `companies` (1:N)

---

### 👤 Tabela `profiles`

Armazena informações de perfil dos usuários do sistema.

**Campos:**
| Campo | Tipo | Descrição | Nullable |
|-------|------|-----------|----------|
| `id` | UUID | FK para `auth.users.id` | ❌ |
| `role` | text | `'company'` \| `'consumer'` \| `'admin'` | ❌ |
| `full_name` | text | Nome completo do usuário | ✅ |
| `created_at` | timestamp | Data de criação | ❌ |
| `updated_at` | timestamp | Data de atualização | ❌ |

**Relações:**
- `id` → `auth.users.id` (1:1)
- Usuários com `role = 'company'` podem ter uma empresa em `companies`

**Políticas RLS:**
- Usuários podem ler/atualizar apenas seu próprio perfil
- Admins podem ler todos os perfis

---

### 🏢 Tabela `companies`

Armazena informações das empresas parceiras do PragHub.

**Campos:**
| Campo | Tipo | Descrição | Nullable | Default |
|-------|------|-----------|----------|---------|
| `id` | UUID | Identificador único | ❌ | `gen_random_uuid()` |
| `owner_id` | UUID | FK para `auth.users.id` | ✅ | `NULL` |
| `slug` | text | URL amigável (único) | ❌ | - |
| `name` | text | Nome da empresa | ❌ | - |
| `rating` | numeric | Avaliação (0-5) | ❌ | `0` |
| `reviews` | integer | Número de avaliações | ❌ | `0` |
| `location` | text | Localização completa | ❌ | - |
| `short_location` | text | Localização resumida | ❌ | - |
| `description` | text | Descrição da empresa | ✅ | `NULL` |
| `cep` | text | CEP | ✅ | `NULL` |
| `street` | text | Rua | ✅ | `NULL` |
| `number` | text | Número | ✅ | `NULL` |
| `neighborhood` | text | Bairro | ✅ | `NULL` |
| `city` | text | Cidade | ✅ | `NULL` |
| `state` | text | Estado | ✅ | `NULL` |
| `tags` | text[] | Tags de serviços | ❌ | `[]` |
| `specialties` | text[] | Especialidades | ✅ | `NULL` |
| `image_url` | text | URL da imagem | ✅ | `NULL` |
| `whatsapp` | text | WhatsApp comercial | ✅ | `NULL` |
| `is_premium` | boolean | Destaque premium | ❌ | `false` |
| `status` | text | `'Pendente'` \| `'Aprovado'` \| `'Rejeitado'` | ❌ | `'Pendente'` |
| `created_at` | timestamp | Data de criação | ❌ | `now()` |
| `updated_at` | timestamp | Data de atualização | ❌ | `now()` |

**⚠️ Campo removido:**
- `cnpj` - Campo não existe na tabela (foi removido do código)

**Relações:**
- `owner_id` → `auth.users.id` (N:1, nullable)
  - Empresas migradas têm `owner_id = NULL`
  - Empresas cadastradas por usuários têm `owner_id` preenchido

**Índices:**
- `slug` (único)
- `owner_id` (para buscas rápidas)
- `status` (para filtros)

**Políticas RLS:**
- **Público (anon):** Pode ler apenas empresas com `status = 'Aprovado'`
- **Usuários autenticados:** Podem ler suas próprias empresas OU empresas aprovadas
- **Admins:** Podem ler/atualizar todas as empresas

---

## 📁 Estrutura de Arquivos do Projeto

```
praghub/
├── 📄 index.html              # HTML principal (remove referência a index.css)
├── 📄 index.tsx                # Ponto de entrada React
├── 📄 App.tsx                  # Componente raiz com rotas
├── 📄 types.ts                 # Definições TypeScript (Company, Lead, etc.)
├── 📄 vite.config.ts           # Configuração Vite
├── 📄 package.json             # Dependências e scripts
│
├── 📂 pages/                   # Páginas da aplicação
│   ├── Home.tsx                # Página inicial (lista empresas aprovadas)
│   ├── Admin.tsx                # Dashboard administrativo
│   ├── CompanyDashboard.tsx     # Dashboard da empresa (logada)
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
│   ├── ProtectedRoute.tsx       # Rota protegida (autenticação)
│   ├── ScrollToTop.tsx         # Scroll automático
│   ├── SessionNotification.tsx # Notificação de sessão
│   ├── Shared.tsx              # Componentes compartilhados
│   └── Toast.tsx               # Notificações toast
│
├── 📂 src/
│   ├── 📂 contexts/
│   │   └── AuthContext.tsx     # Contexto de autenticação
│   │
│   ├── 📂 lib/
│   │   ├── supabase.ts         # Cliente Supabase
│   │   └── utils.ts            # Funções utilitárias
│   │
│   └── 📂 data/
│       └── companies.ts        # Dados locais (20 empresas) - MIGRADO
│
├── 📂 scripts/                 # Scripts de manutenção
│   ├── migrate-companies.js    # Migração de empresas para Supabase
│   ├── create-admin.js         # Criação de usuário admin
│   ├── FIX_RLS_POLICIES.sql    # Script SQL para corrigir RLS
│   ├── MIGRAR_EMPRESAS.md      # Documentação migração
│   ├── VERIFICAR_RLS.md        # Guia de verificação RLS
│   └── COMO_OBTER_SERVICE_ROLE_KEY.md
│
├── 📂 public/                  # Arquivos estáticos
│   ├── logo-header.png
│   ├── logo-footer.png
│   └── manifest.json
│
└── 📂 dist/                    # Build de produção
```

---

## 🔗 Relações e Fluxo de Dados

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
3. Cria perfil em profiles (role = 'company')
   ↓
4. Cria empresa em companies (owner_id = user.id, status = 'Pendente')
```

### Fluxo de Visualização de Empresas

```
Página Home (público):
1. Home.tsx busca empresas do Supabase
   ↓
2. Query: SELECT * FROM companies WHERE status = 'Aprovado'
   ↓
3. RLS verifica permissão (anon pode ver aprovadas)
   ↓
4. Mapeia dados (snake_case → camelCase)
   ↓
5. Exibe na interface
```

### Fluxo de Migração de Dados

```
1. Dados locais em src/data/companies.ts (20 empresas)
   ↓
2. Script migrate-companies.js lê arquivo
   ↓
3. Converte camelCase → snake_case
   ↓
4. Verifica se empresa existe (por slug)
   ↓
5. Insere ou atualiza no Supabase
   ↓
6. Empresas ficam com owner_id = NULL (não têm dono)
```

---

## ⚠️ Problemas Enfrentados e Status

### ✅ Problemas Resolvidos

#### 1. **Campo `cnpj` não existe na tabela**
- **Status:** ✅ Resolvido
- **Problema:** Código tentava acessar `item.cnpj` mas coluna não existe
- **Solução:** Removidas todas as referências ao campo
- **Arquivos corrigidos:**
  - `pages/Home.tsx`
  - `pages/Admin.tsx`
  - `pages/CompanyProfile.tsx`
  - `pages/CompanyDashboard.tsx`

#### 2. **Erro 404 do index.css**
- **Status:** ✅ Resolvido
- **Problema:** `index.html` referenciava `/index.css` que não existe
- **Solução:** Removida referência do HTML

#### 3. **Dados locais não migrados para Supabase**
- **Status:** ✅ Resolvido
- **Problema:** 20 empresas estavam apenas em `src/data/companies.ts`
- **Solução:** Criado script `migrate-companies.js` que migra todos os dados

#### 4. **Mapeamento incompleto de dados**
- **Status:** ✅ Resolvido
- **Problema:** Alguns campos não eram mapeados do banco para o tipo TypeScript
- **Solução:** Mapeamento completo implementado em todas as páginas

---

### 🔴 Problemas Ativos

#### 1. **RLS (Row Level Security) bloqueando queries**
- **Status:** 🔴 Em investigação
- **Problema:** Dados não carregam no servidor, provavelmente por políticas RLS
- **Sintomas:**
  - Empresas não aparecem na Home
  - Admin não carrega lista de empresas
  - Console mostra erros de permissão
- **Causa provável:**
  - Políticas RLS não permitem empresas com `owner_id = NULL`
  - Políticas não configuradas corretamente
- **Solução proposta:**
  - Executar script `scripts/FIX_RLS_POLICIES.sql` no Supabase
  - Criar políticas que permitam empresas aprovadas mesmo com `owner_id NULL`
- **Documentação:** `scripts/VERIFICAR_RLS.md`

#### 2. **Empresas migradas sem owner_id**
- **Status:** ⚠️ Funcional, mas pode causar problemas
- **Problema:** Empresas migradas têm `owner_id = NULL`
- **Impacto:**
  - Empresas não aparecem no dashboard de usuários
  - Políticas RLS podem bloquear acesso
- **Solução futura:**
  - Criar usuários "sistema" para empresas migradas
  - Ou ajustar políticas para permitir `owner_id NULL`

#### 3. **Admin sem autenticação**
- **Status:** ⚠️ Não crítico, mas inseguro
- **Problema:** Qualquer usuário pode acessar `/admin`
- **Impacto:** Risco de segurança
- **Solução proposta:**
  - Adicionar verificação de role no `Admin.tsx`
  - Redirecionar usuários não-admin

---

### 🟡 Problemas Conhecidos (Baixa Prioridade)

#### 1. **Inconsistência id vs slug**
- **Status:** 🟡 Documentado
- **Problema:** Alguns lugares usam `id` (UUID), outros usam `slug` (text)
- **Impacto:** Pode causar problemas de roteamento
- **Recomendação:** Padronizar uso de `slug` para URLs

#### 2. **Campo `initials` não definido**
- **Status:** 🟡 Documentado
- **Problema:** Código usa `company.initials` mas não existe no tipo
- **Impacto:** Pode causar erros quando não há `imageUrl`
- **Solução:** Usar função helper `getCompanyInitials()`

#### 3. **Falta paginação**
- **Status:** 🟡 Melhoria futura
- **Problema:** Listagens carregam todas as empresas de uma vez
- **Impacto:** Performance com muitas empresas
- **Solução:** Implementar paginação no Supabase

---

## 🔧 Scripts Disponíveis

### `npm run migrate-companies`
Migra empresas de `src/data/companies.ts` para o Supabase.

**Requisitos:**
- `VITE_SUPABASE_URL` configurado
- `SUPABASE_SERVICE_ROLE_KEY` configurado

**O que faz:**
1. Lê empresas do arquivo TypeScript
2. Converte para formato do banco (snake_case)
3. Verifica se empresa já existe (por slug)
4. Insere novas ou atualiza existentes

### `npm run create-admin`
Cria usuário admin no Supabase.

**Requisitos:**
- `VITE_SUPABASE_URL` configurado
- `SUPABASE_SERVICE_ROLE_KEY` configurado

**O que faz:**
1. Cria usuário `admin@praghub.com`
2. Cria perfil com `role = 'admin'`
3. Senha padrão: `password`

---

## 📋 Checklist de Configuração

### Supabase

- [ ] Tabela `companies` criada com todos os campos
- [ ] Tabela `profiles` criada
- [ ] RLS habilitado na tabela `companies`
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

## 🚀 Próximos Passos

### Alta Prioridade
1. ✅ Executar `FIX_RLS_POLICIES.sql` no Supabase
2. ✅ Testar se dados carregam após corrigir RLS
3. ⏳ Adicionar autenticação no Admin
4. ⏳ Verificar variáveis de ambiente no servidor

### Média Prioridade
1. ⏳ Padronizar uso de `id` vs `slug`
2. ⏳ Adicionar tratamento de erros mais robusto
3. ⏳ Implementar paginação

### Baixa Prioridade
1. ⏳ Adicionar cache de dados
2. ⏳ Melhorar loading states
3. ⏳ Adicionar testes automatizados

---

## 📞 Suporte

Para problemas relacionados a:
- **Migração de dados:** Ver `scripts/MIGRAR_EMPRESAS.md`
- **RLS e permissões:** Ver `scripts/VERIFICAR_RLS.md`
- **Criação de admin:** Ver `scripts/COMO_OBTER_SERVICE_ROLE_KEY.md`
- **Inconsistências gerais:** Ver `RELATORIO_INCONSISTENCIAS.md`

---

**Documento mantido por:** Equipe PragHub  
**Última revisão:** Janeiro 2025

