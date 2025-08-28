# 🔐 Variáveis de Ambiente - Template

## 📋 Variáveis Necessárias para Deploy

Copie este template e configure na Vercel:

### 🚀 Configuração na Vercel

1. Acesse: `vercel.com` → Seu Projeto → Settings → Environment Variables
2. Adicione cada variável abaixo:

```env
# ========================================
# 🗄️ SUPABASE - BANCO DE DADOS
# ========================================

# URL do projeto Supabase
VITE_SUPABASE_URL=https://[SEU-PROJECT-ID].supabase.co

# Chave pública (anon key)
VITE_SUPABASE_ANON_KEY=[SUA-ANON-KEY-AQUI]

# ========================================
# 🌐 API (OPCIONAL)
# ========================================

# URL da API personalizada (se houver)
VITE_API_URL=https://sua-api.com
```

## 🔍 Como Obter os Valores

### Supabase URL e Anon Key:

1. Acesse [supabase.com](https://supabase.com)
2. Entre no seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

### Exemplo Real:
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ⚠️ Importante

- **NUNCA** commite essas variáveis no código
- Use **EXATAMENTE** os nomes listados acima
- **DEVE** começar com `VITE_` para funcionar com Vite
- Configure no ambiente de **Production** da Vercel

## 🧪 Teste Local

Para testar localmente, crie um arquivo `.env`:

```bash
# No diretório raiz do projeto
echo "VITE_SUPABASE_URL=sua-url" > .env
echo "VITE_SUPABASE_ANON_KEY=sua-key" >> .env
```

**⚠️ ATENÇÃO**: O arquivo `.env` está no `.gitignore` - não será commitado.

## ✅ Verificação

Após configurar, acesse:
```
https://seu-projeto.vercel.app
```

Se aparecer erro "Missing Supabase environment variables", as variáveis não estão configuradas corretamente.

---

**Status**: ✅ Template pronto para uso
**Última atualização**: Deploy Guide v2.0
