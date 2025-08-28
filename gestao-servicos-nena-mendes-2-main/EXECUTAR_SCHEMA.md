# 🚀 Como Executar o Schema SQL no Supabase

## ⚡ Passos Rápidos

### 1. **Acesse seu Projeto Supabase**
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta
- Selecione seu projeto: `https://lciwywfjojyxkmzunmvp.supabase.co`

### 2. **Abra o SQL Editor**
- No painel lateral esquerdo, clique em **"SQL Editor"**
- Clique em **"New query"** para criar uma nova consulta

### 3. **Execute o Schema**
- Abra o arquivo `database/schema.sql` deste projeto
- **Copie TODO o conteúdo** do arquivo (Ctrl+A, Ctrl+C)
- **Cole no SQL Editor** do Supabase (Ctrl+V)
- Clique no botão **"Run"** (▶️) para executar

### 4. **Verificar se Funcionou**
Após executar, você deve ver:
- ✅ Mensagem de sucesso
- ✅ Tabelas criadas no painel "Table Editor"
- ✅ Dados iniciais (categorias e marcas) inseridos

## 📋 O que o Schema Cria

### **Tabelas:**
- `profiles` - Perfis de usuários (admin/professional)
- `categories` - Categorias de produtos  
- `brands` - Marcas dos produtos
- `products` - Produtos cadastrados
- `services` - Serviços criados pelos profissionais
- `service_products` - Produtos utilizados em cada serviço

### **Recursos:**
- 🔐 **Row Level Security (RLS)** configurado
- ⚡ **Triggers** para timestamps automáticos
- 🛡️ **Políticas de acesso** por tipo de usuário
- 📊 **Dados iniciais** (7 categorias + 7 marcas)

## 🔍 Verificar se Tudo Funcionou

### 1. **Verificar Tabelas**
- Vá em **"Table Editor"** no Supabase
- Você deve ver todas as 6 tabelas listadas

### 2. **Verificar Dados Iniciais**
- Clique na tabela `categories`
- Deve ter 7 categorias: Shampoo, Condicionador, etc.
- Clique na tabela `brands` 
- Deve ter 7 marcas: L'Oréal, Wella, etc.

### 3. **Testar no Projeto**
- Execute `npm run dev` no seu projeto
- Acesse a página de registro
- Crie uma conta de administrador
- Tente adicionar um produto

## ❌ Problemas Comuns

### **Erro: "relation already exists"**
- **Causa**: Schema já foi executado antes
- **Solução**: Está tudo certo! Ignore o erro

### **Erro: "permission denied"**
- **Causa**: Problema de permissões
- **Solução**: Verifique se você é o dono do projeto

### **Erro: "syntax error"**
- **Causa**: Schema não foi copiado completamente
- **Solução**: Copie novamente TODO o arquivo schema.sql

## 🎯 Próximo Passo

Após executar o schema com sucesso:

1. ✅ Volte para seu projeto
2. ✅ Execute `npm run dev`
3. ✅ Acesse `http://localhost:5173`
4. ✅ Teste a funcionalidade de registro/login
5. ✅ Teste a adição de produtos

**Tudo pronto!** 🎉 Seu projeto agora está integrado com Supabase!
