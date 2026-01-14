# PragHub — Architecture Decisions (Launch Phase)

## Decisões Congeladas

### 1. Portal de Vídeos
- Caminho A
- Player externo (Vimeo / Bunny / Cloudflare Stream)
- Acesso controlado por login + entitlement

### 2. Billing
- Stripe Hosted Checkout
- Planos tratados como "entitlements", não flags soltas

### 3. Loja
- Plataforma separada
- Integração inicial via cupom Premium
- Sem SSO no lançamento

### 4. Auth
- Supabase Auth (email/senha)
- Google Login é opcional pós-launch

### 5. URLs
- UUID mantido
- Slug introduzido progressivamente (SEO)

Essas decisões NÃO devem ser revistas durante a fase de execução,
apenas refinadas.