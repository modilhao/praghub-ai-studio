# Solução: Problema de Cache do Navegador

## 🔴 Problema

Após fazer alterações no código, o navegador pode continuar usando uma versão antiga em cache, especialmente na porta 3000. Isso causa:

- Código antigo sendo executado
- Mudanças não aparecem
- Bugs que já foram corrigidos ainda aparecem

## ✅ Soluções

### Solução 1: Limpar Cache do Navegador (Recomendado)

#### Chrome/Edge:
1. Abra DevTools (F12)
2. Clique com botão direito no botão de recarregar
3. Selecione **"Limpar cache e recarregar forçado"** (ou "Empty Cache and Hard Reload")

#### Firefox:
1. Abra DevTools (F12)
2. Clique com botão direito no botão de recarregar
3. Selecione **"Limpar cache e recarregar"**

#### Safari:
1. Cmd + Option + E (limpar cache)
2. Cmd + R (recarregar)

### Solução 2: Modo Anônimo/Incógnito

Abra uma janela anônima/incógnita para testar sem cache:
- **Chrome/Edge**: Ctrl+Shift+N (Windows) ou Cmd+Shift+N (Mac)
- **Firefox**: Ctrl+Shift+P (Windows) ou Cmd+Shift+P (Mac)
- **Safari**: Cmd+Shift+N

### Solução 3: Desabilitar Cache no DevTools

1. Abra DevTools (F12)
2. Vá em **Network** (Rede)
3. Marque **"Disable cache"**
4. Mantenha DevTools aberto durante o desenvolvimento

### Solução 4: Usar Outra Porta

Se o problema persistir na porta 3000:

```bash
# Pare o servidor atual
# Edite vite.config.ts e mude a porta para 3001
# Ou use:
npm run dev -- --port 3001
```

### Solução 5: Limpar Storage do Site

1. Abra DevTools (F12)
2. Vá em **Application** (Chrome) ou **Storage** (Firefox)
3. Clique em **Clear site data** ou **Limpar dados do site**
4. Recarregue a página

## 🔧 Prevenção

### Configuração do Vite

O `vite.config.ts` já está configurado para enviar headers que desabilitam cache em desenvolvimento:

```typescript
server: {
  headers: {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
}
```

### Durante Desenvolvimento

1. **Sempre use DevTools aberto** com "Disable cache" marcado
2. **Use modo anônimo** para testes importantes
3. **Limpe cache regularmente** após mudanças significativas

## 🚨 Quando Suspeitar de Cache

- Código antigo ainda executa após mudanças
- Erros que já foram corrigidos ainda aparecem
- Funciona em uma porta mas não em outra
- Funciona em modo anônimo mas não em modo normal
- Console mostra código antigo nos source maps

## 📝 Checklist de Debug

Se algo não está funcionando:

- [ ] Limpei o cache do navegador?
- [ ] Testei em modo anônimo?
- [ ] Desabilitei cache no DevTools?
- [ ] Recarreguei com Ctrl+Shift+R (ou Cmd+Shift+R)?
- [ ] Verifiquei se o código foi realmente salvo?
- [ ] O servidor foi reiniciado após mudanças no vite.config.ts?

## 🔍 Verificar se é Cache

1. Abra DevTools → Network
2. Recarregue a página
3. Verifique se os arquivos `.js` têm status **200** ou **304**
4. Se aparecer **304 (Not Modified)**, o navegador está usando cache
5. Clique com botão direito em um arquivo → **"Open in new tab"**
6. Verifique se o conteúdo está atualizado

---

**Última atualização**: Janeiro 2026  
**Motivo**: Problema de cache na porta 3000 após correções de autenticação
