# Como Migrar Empresas Locais para o Supabase

Este script migra todas as empresas armazenadas localmente em `src/data/companies.ts` para o banco de dados Supabase.

## 📋 Pré-requisitos

1. **Service Role Key do Supabase**
   - Acesse: Supabase Dashboard > Settings > API
   - Copie a chave `service_role` (secret)
   - ⚠️ **ATENÇÃO**: Esta chave tem acesso total ao banco. NUNCA compartilhe ou commite no Git!

2. **Variáveis de Ambiente**
   - Configure no arquivo `.env.local` na raiz do projeto:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
   ```

## 🚀 Como Usar

### Opção 1: Executar diretamente (recomendado)

```bash
npm run migrate-companies
```

### Opção 2: Com tsx (se o import direto falhar)

Se o script não conseguir importar o arquivo TypeScript diretamente:

```bash
# Instalar tsx (se ainda não tiver)
npm install -D tsx

# Executar com tsx
npx tsx scripts/migrate-companies.js
```

## 📊 O que o Script Faz

1. **Carrega empresas** do arquivo `src/data/companies.ts`
2. **Verifica existência** de cada empresa no Supabase (por `slug`)
3. **Insere novas empresas** que ainda não existem
4. **Atualiza empresas existentes** com os dados mais recentes
5. **Exibe resumo** com estatísticas da migração

## 🔄 Comportamento

- **Empresas novas**: Serão inseridas no banco
- **Empresas existentes**: Serão atualizadas com os dados do arquivo local
- **Identificação**: Usa o campo `slug` para identificar empresas duplicadas

## ⚠️ Observações Importantes

- O script usa a **Service Role Key**, então tem permissões totais
- Empresas são identificadas pelo `slug` (deve ser único)
- Campos opcionais vazios serão definidos como `null` no banco
- Arrays vazios (`tags`, `specialties`) serão salvos como arrays vazios `[]`

## 📝 Exemplo de Saída

```
🚀 Iniciando migração de empresas para o Supabase...

📊 Total de empresas a migrar: 20

➕ [1/20] Inserindo: Dedetizadora FastClean
   ✅ Inserida com sucesso!

🔄 [2/20] Atualizando: Jardim Pragas Control
   ✅ Atualizada com sucesso!

...

============================================================
📊 RESUMO DA MIGRAÇÃO
============================================================
✅ Empresas inseridas: 15
🔄 Empresas atualizadas: 5
❌ Erros: 0
📦 Total processado: 20

🎉 Migração concluída com sucesso!
```

## 🐛 Solução de Problemas

### Erro: "VITE_SUPABASE_URL não encontrado"
- Verifique se o arquivo `.env.local` existe na raiz do projeto
- Confirme que a variável está configurada corretamente

### Erro: "SUPABASE_SERVICE_ROLE_KEY não encontrado"
- Obtenha a Service Role Key no Supabase Dashboard
- Adicione ao arquivo `.env.local`

### Erro: "Não foi possível encontrar o array COMPANIES"
- Verifique se o arquivo `src/data/companies.ts` existe
- Confirme que o arquivo exporta `COMPANIES` corretamente

### Erro ao importar TypeScript
- Tente instalar e usar `tsx`: `npm install -D tsx && npx tsx scripts/migrate-companies.js`
- Ou verifique se o Node.js está na versão mais recente

