# 🚀 Guia de Deploy - Gestão de Serviços Nena Mendes

## 📋 Pré-requisitos

### 1. Conta na Vercel
- Crie uma conta em [vercel.com](https://vercel.com)
- Conecte sua conta GitHub/GitLab

### 2. Projeto Supabase
- Crie um projeto em [supabase.com](https://supabase.com)
- Execute o schema do banco de dados (veja `database/schema.sql`)

## 🔧 Configuração das Variáveis de Ambiente

### Na Vercel:
1. Acesse o painel do seu projeto na Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione as seguintes variáveis:

```env
VITE_SUPABASE_URL=https://seu-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### Onde encontrar os valores:
1. **VITE_SUPABASE_URL**: No painel do Supabase → Settings → API → Project URL
2. **VITE_SUPABASE_ANON_KEY**: No painel do Supabase → Settings → API → Project API keys → anon public

## 📦 Deploy Automático

### Via GitHub/GitLab:
1. Faça push do código para seu repositório
2. Na Vercel, conecte o repositório
3. O deploy será automático a cada push

### Via CLI da Vercel:
```bash
# Instalar CLI da Vercel
npm install -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

## 🏗️ Build Local (Teste)

```bash
# Instalar dependências
npm install

# Build de produção
npm run build

# Preview local
npm run preview
```

## ✅ Verificações Pós-Deploy

### 1. Funcionalidades Principais:
- [ ] Login de usuários (admin/profissional)
- [ ] Criação de serviços
- [ ] Gestão de produtos
- [ ] Dashboard de recebidos
- [ ] Formatação de datas em português brasileiro

### 2. Performance:
- [ ] Carregamento rápido
- [ ] Chunks otimizados
- [ ] Cache de assets

### 3. Responsividade:
- [ ] Desktop
- [ ] Tablet
- [ ] Mobile

## 🔧 Configurações de Produção

### Otimizações Aplicadas:
- ✅ **Code Splitting**: Chunks separados para vendor, UI, utils
- ✅ **Cache**: Assets com cache de 1 ano
- ✅ **SPA Routing**: Redirecionamento para index.html
- ✅ **Build Otimizado**: Vite com configurações de produção

### Estrutura de Chunks:
- `vendor.js`: React, React-DOM
- `ui.js`: Componentes Radix UI
- `utils.js`: date-fns, clsx, tailwind-merge
- `supabase.js`: Cliente Supabase
- `index.js`: Código da aplicação

## 🌐 URLs de Produção

Após o deploy, você terá:
- **URL Principal**: `https://seu-projeto.vercel.app`
- **Admin**: `https://seu-projeto.vercel.app/admin`
- **Profissional**: `https://seu-projeto.vercel.app/profissional`

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão configuradas
- Certifique-se que começam com `VITE_` (obrigatório para Vite)

### Build falha com erros TypeScript:
- Execute `npm run lint` localmente
- Corrija erros críticos (warnings são tolerados)

### Problemas de roteamento:
- Verificar se o `vercel.json` está configurado corretamente
- SPA precisa redirecionar todas as rotas para `index.html`

## 📚 Recursos Adicionais

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [Guia Vite Deploy](https://vitejs.dev/guide/static-deploy.html)

## 🎉 Sucesso!

Seu projeto está pronto para produção com:
- ⚡ Performance otimizada
- 🇧🇷 Formatação brasileira definitiva
- 📱 Interface responsiva
- 🔒 Autenticação segura
- 🗄️ Banco de dados robusto

---

**Data**: Preparado para deploy em produção
**Versão**: 2.0.0 - Gestão de Serviços Nena Mendes
