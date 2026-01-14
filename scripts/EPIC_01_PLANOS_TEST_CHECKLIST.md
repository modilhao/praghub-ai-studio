# EPIC 01 - Checklist de Testes: Página de Planos

## 📋 Arquivos Criados/Modificados

### Criados
- ✅ `pages/Planos.tsx` - Página de seleção de planos
- ✅ `lib/stripe-client.ts` - Cliente para chamadas de API do Stripe
- ✅ `components/SubscriptionStatus.tsx` - Componente de status (já existia)
- ✅ `components/ProtectedFeature.tsx` - Componente de gating (já existia)

### Modificados
- ✅ `App.tsx` - Adicionada rota `/planos` e `SubscriptionProvider`
- ✅ `contexts/SubscriptionContext.tsx` - Context para gerenciar subscriptions (já existia)
- ✅ `types.ts` - Tipos TypeScript para subscriptions (já existia)

---

## ✅ Teste 1: Acesso à Página de Planos

### Objetivo
Verificar que a rota `/planos` está acessível e renderiza corretamente.

### Passos
1. [ ] Acessar `/planos` sem estar logado
2. [ ] Verificar que a página carrega sem erros
3. [ ] Verificar que 3 planos são exibidos:
   - [ ] Diretório (R$ 49,90)
   - [ ] Diretório + Academia (R$ 99,90)
   - [ ] Premium (R$ 149,90)
4. [ ] Verificar design consistente com o resto da aplicação
5. [ ] Verificar responsividade (mobile/tablet/desktop)

### Validações
- [ ] Título "Escolha seu Plano" está visível
- [ ] Cards dos planos estão bem formatados
- [ ] Badge "Mais Popular" aparece no plano Premium
- [ ] Ícones Material Symbols aparecem corretamente
- [ ] Cores seguem o tema (primary, card-dark, etc.)

### Resultado Esperado
✅ Página carrega corretamente, design consistente, 3 planos visíveis

---

## ✅ Teste 2: Usuário Não Autenticado

### Objetivo
Verificar redirecionamento para login quando usuário não autenticado tenta assinar.

### Passos
1. [ ] Acessar `/planos` sem estar logado
2. [ ] Clicar em "Assinar Agora" em qualquer plano
3. [ ] Verificar redirecionamento

### Validações
- [ ] Redireciona para `/login?redirect=/planos`
- [ ] Após login, retorna para `/planos`

### Resultado Esperado
✅ Redirecionamento para login funciona corretamente

---

## ✅ Teste 3: Criação de Checkout Session (Usuário Autenticado)

### Objetivo
Verificar que o botão "Assinar" chama a Edge Function e redireciona para Stripe.

### Pré-requisitos
- [ ] Usuário autenticado (role COMPANY ou ADMIN)
- [ ] Edge Function `create-checkout` deployada
- [ ] Variáveis de ambiente configuradas

### Passos
1. [ ] Fazer login como usuário COMPANY
2. [ ] Acessar `/planos`
3. [ ] Clicar em "Assinar Agora" no plano "Diretório"
4. [ ] Verificar que botão mostra "Processando..." durante loading
5. [ ] Verificar redirecionamento para Stripe Hosted Checkout

### Validações no Console
- [ ] Request para `${SUPABASE_URL}/functions/v1/create-checkout` é feito
- [ ] Headers incluem `Authorization: Bearer [token]`
- [ ] Body inclui `{ planKey: 'directory' }`
- [ ] Response retorna `{ sessionId: '...', url: '...' }`

### Validações Visuais
- [ ] Botão fica desabilitado durante loading
- [ ] Redirecionamento acontece automaticamente
- [ ] URL do Stripe Checkout é válida

### Resultado Esperado
✅ Checkout session criada, redirecionamento para Stripe funciona

---

## ✅ Teste 4: Retorno do Checkout (Sucesso)

### Objetivo
Verificar tratamento quando usuário retorna do checkout com sucesso.

### Passos
1. [ ] Completar checkout no Stripe (usar cartão de teste: `4242 4242 4242 4242`)
2. [ ] Verificar redirecionamento para `/dashboard?session_id=xxx&success=true`
3. [ ] Verificar que Toast de sucesso aparece
4. [ ] Aguardar 2 segundos
5. [ ] Verificar redirecionamento automático para `/dashboard`

### Validações
- [ ] Toast mostra: "Pagamento processado com sucesso! Sincronizando sua assinatura..."
- [ ] Toast tem tipo `success` (verde)
- [ ] Toast desaparece após alguns segundos
- [ ] Redirecionamento para `/dashboard` acontece
- [ ] Parâmetros `session_id` e `success` são limpos da URL

### Resultado Esperado
✅ Feedback visual correto, redirecionamento funciona, URL limpa

---

## ✅ Teste 5: Retorno do Checkout (Cancelado)

### Objetivo
Verificar tratamento quando usuário cancela o checkout.

### Passos
1. [ ] Iniciar checkout
2. [ ] Clicar em "Voltar" ou fechar janela do Stripe
3. [ ] Verificar redirecionamento para `/planos?canceled=true`
4. [ ] Verificar que Toast de informação aparece

### Validações
- [ ] Toast mostra: "Checkout cancelado. Você pode tentar novamente quando quiser."
- [ ] Toast tem tipo `info` (azul)
- [ ] Parâmetro `canceled` é limpo da URL após exibir toast
- [ ] Usuário pode tentar assinar novamente

### Resultado Esperado
✅ Cancelamento tratado graciosamente, feedback adequado

---

## ✅ Teste 6: Plano Ativo (Botão Desabilitado)

### Objetivo
Verificar que botão mostra "Plano Atual" quando usuário já tem subscription ativa.

### Pré-requisitos
- [ ] Usuário com subscription ativa do plano "Diretório"

### Passos
1. [ ] Fazer login como usuário com subscription ativa
2. [ ] Acessar `/planos`
3. [ ] Verificar card do plano atual

### Validações
- [ ] Badge "Ativo" aparece no canto superior direito do card
- [ ] Botão mostra "Plano Atual" (não "Assinar Agora")
- [ ] Botão está desabilitado (não clicável)
- [ ] Estilo visual indica estado desabilitado

### Resultado Esperado
✅ Botão desabilitado corretamente, badge "Ativo" visível

---

## ✅ Teste 7: Entitlement Ativo (Já Incluído)

### Objetivo
Verificar que planos superiores mostram "Já Incluído" quando entitlement já está ativo.

### Cenário
- Usuário tem plano "Premium" ativo
- Acessa `/planos`
- Deve ver "Já Incluído" nos planos "Diretório" e "Diretório + Academia"

### Passos
1. [ ] Ter subscription Premium ativa
2. [ ] Acessar `/planos`
3. [ ] Verificar cards dos planos inferiores

### Validações
- [ ] Card "Diretório" mostra botão "Já Incluído" (desabilitado)
- [ ] Card "Diretório + Academia" mostra botão "Já Incluído" (desabilitado)
- [ ] Card "Premium" mostra "Plano Atual" (desabilitado)
- [ ] Lógica `hasActiveEntitlement()` funciona corretamente

### Resultado Esperado
✅ Planos inferiores mostram "Já Incluído", lógica de entitlement correta

---

## ✅ Teste 8: Upgrade de Plano

### Objetivo
Verificar que botão mostra "Fazer Upgrade" quando aplicável.

### Cenário
- Usuário tem plano "Diretório" ativo
- Deve ver "Fazer Upgrade" nos planos superiores

### Passos
1. [ ] Ter subscription "Diretório" ativa
2. [ ] Acessar `/planos`
3. [ ] Verificar botões dos planos superiores

### Validações
- [ ] Card "Diretório + Academia" mostra "Fazer Upgrade"
- [ ] Card "Premium" mostra "Fazer Upgrade"
- [ ] Botões são clicáveis e funcionam

### Resultado Esperado
✅ Botões de upgrade aparecem corretamente

---

## ✅ Teste 9: Erro na Criação de Checkout

### Objetivo
Verificar tratamento de erros quando Edge Function falha.

### Passos
1. [ ] Simular erro na Edge Function (desabilitar temporariamente)
2. [ ] Tentar criar checkout session
3. [ ] Verificar que Toast de erro aparece

### Validações
- [ ] Toast mostra mensagem de erro
- [ ] Toast tem tipo `error` (vermelho)
- [ ] Toast permanece visível por 6 segundos
- [ ] Botão volta ao estado normal (não fica travado)
- [ ] Usuário pode tentar novamente

### Resultado Esperado
✅ Erro tratado graciosamente, feedback visual adequado

---

## ✅ Teste 10: Loading State

### Objetivo
Verificar estados de loading durante criação de checkout.

### Passos
1. [ ] Clicar em "Assinar Agora"
2. [ ] Verificar mudança imediata do botão
3. [ ] Verificar que apenas o botão clicado mostra "Processando..."
4. [ ] Outros botões permanecem habilitados (ou não, dependendo da implementação)

### Validações
- [ ] Botão clicado mostra "Processando..."
- [ ] Botão clicado fica desabilitado
- [ ] Outros botões não são afetados (ou também ficam desabilitados)
- [ ] Loading state é limpo em caso de erro

### Resultado Esperado
✅ Loading state funciona corretamente, UX clara

---

## ✅ Teste 11: Parâmetro ?upgrade=true

### Objetivo
Verificar banner quando usuário é redirecionado de feature protegida.

### Passos
1. [ ] Acessar `/planos?upgrade=true`
2. [ ] Verificar que banner azul aparece no topo
3. [ ] Verificar mensagem: "Upgrade seu plano para acessar esta funcionalidade."

### Validações
- [ ] Banner é visível
- [ ] Estilo correto (azul, com ícone)
- [ ] Mensagem clara e objetiva

### Resultado Esperado
✅ Banner de upgrade aparece corretamente

---

## ✅ Teste 12: Seção "Sua Assinatura Atual"

### Objetivo
Verificar exibição de informações da subscription ativa.

### Passos
1. [ ] Ter subscription ativa
2. [ ] Acessar `/planos`
3. [ ] Verificar seção no final da página

### Validações
- [ ] Seção aparece apenas se há subscription
- [ ] Nome do plano está correto
- [ ] Status está correto (Ativa, Período de Teste, etc.)
- [ ] Data de renovação está formatada corretamente (pt-BR)
- [ ] Cores do status estão corretas (verde para ativa, etc.)

### Resultado Esperado
✅ Informações da subscription exibidas corretamente

---

## ✅ Teste 13: Responsividade

### Objetivo
Verificar que página funciona bem em diferentes tamanhos de tela.

### Passos
1. [ ] Testar em desktop (1920x1080)
2. [ ] Testar em tablet (768x1024)
3. [ ] Testar em mobile (375x667)

### Validações Desktop
- [ ] Grid de 3 colunas
- [ ] Cards bem espaçados
- [ ] Texto legível

### Validações Tablet
- [ ] Grid adapta para 2 colunas (ou 1)
- [ ] Cards não ficam muito pequenos
- [ ] Botões são clicáveis

### Validações Mobile
- [ ] Grid de 1 coluna
- [ ] Cards empilhados verticalmente
- [ ] Texto não quebra de forma estranha
- [ ] Botões têm tamanho adequado para toque

### Resultado Esperado
✅ Layout responsivo funciona em todos os tamanhos

---

## ✅ Teste 14: Integração com Edge Function

### Objetivo
Verificar que chamada à Edge Function está correta.

### Validações Técnicas
- [ ] URL correta: `${SUPABASE_URL}/functions/v1/create-checkout`
- [ ] Método: POST
- [ ] Headers corretos:
  - [ ] `Content-Type: application/json`
  - [ ] `Authorization: Bearer [token]`
  - [ ] `apikey: [anon_key]`
- [ ] Body correto: `{ planKey: 'directory' | 'directory_academy' | 'premium' }`
- [ ] Response esperado: `{ sessionId: string, url: string }`

### Validações de Segurança
- [ ] Token de autenticação é enviado
- [ ] Nenhum secret exposto no frontend
- [ ] RLS não é relaxado
- [ ] Validação de autenticação no backend

### Resultado Esperado
✅ Integração segura e correta com Edge Function

---

## 🔍 Testes de Edge Cases

### Teste 15: Múltiplos Cliques Rápidos
- [ ] Clicar rapidamente várias vezes no botão
- [ ] Verificar que apenas uma requisição é feita
- [ ] Verificar que loading state previne múltiplos cliques

### Teste 16: Network Error
- [ ] Desconectar internet
- [ ] Tentar criar checkout
- [ ] Verificar que erro é tratado graciosamente

### Teste 17: Subscription com Status "past_due"
- [ ] Ter subscription com status "past_due"
- [ ] Verificar que botões ainda funcionam (pode fazer upgrade)
- [ ] Verificar que seção "Sua Assinatura Atual" mostra status correto

### Teste 18: Subscription Cancelada
- [ ] Ter subscription cancelada
- [ ] Verificar que pode assinar novo plano
- [ ] Verificar que não mostra "Plano Atual" para plano cancelado

---

## 📊 Checklist Final

Antes de considerar completo:

- [ ] Todos os testes acima passaram
- [ ] Design consistente com o resto da aplicação
- [ ] Sem erros no console
- [ ] Sem warnings do React
- [ ] Performance adequada (sem lag ao clicar)
- [ ] Acessibilidade básica (botões têm labels, contraste adequado)
- [ ] Código revisado e sem problemas de lint

---

## 🐛 Troubleshooting

### Checkout não redireciona
- Verificar que Edge Function está deployada
- Verificar variáveis de ambiente
- Verificar logs da Edge Function: `supabase functions logs create-checkout`

### Toast não aparece
- Verificar que componente Toast está importado
- Verificar que estado `toast` está sendo atualizado
- Verificar console para erros

### Botão não desabilita
- Verificar lógica `hasActiveEntitlement()`
- Verificar que `subscription` está sendo carregado
- Verificar que `entitlements` estão corretos

### Design inconsistente
- Verificar classes Tailwind
- Verificar variáveis CSS em `index.css`
- Comparar com outras páginas (ex: `LandingPartner.tsx`)

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0.0
