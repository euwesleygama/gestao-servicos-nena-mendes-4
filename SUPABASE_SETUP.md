# Configuração do Supabase

Este guia mostra como configurar o Supabase para o projeto de Gestão de Serviços.

## 1. Criar Conta no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Clique em "New Project"
4. Escolha um nome para o projeto (ex: `gestao-servicos-nena`)
5. Defina uma senha para o banco de dados
6. Escolha a região mais próxima (ex: South America - São Paulo)
7. Clique em "Create new project"

## 2. Configurar Variáveis de Ambiente

1. No dashboard do Supabase, vá em "Settings" → "API"
2. Copie a "Project URL" e "anon public" key
3. Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_project_url_aqui
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

## 3. Executar o Schema do Banco de Dados

1. No dashboard do Supabase, vá em "SQL Editor"
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `database/schema.sql`
4. Cole no editor e clique em "Run"

Isso criará todas as tabelas, triggers, políticas de segurança e dados iniciais.

## 4. Configurar Storage (Opcional)

Para upload de imagens de produtos:

1. Vá em "Storage" no dashboard
2. Clique em "Create a new bucket"
3. Nome: `product-images`
4. Marque como "Public bucket"
5. Clique em "Create bucket"

## 5. Estrutura do Banco de Dados

### Tabelas Criadas:

- **profiles**: Dados dos usuários (estende auth.users)
- **categories**: Categorias de produtos
- **brands**: Marcas dos produtos
- **products**: Produtos cadastrados
- **services**: Serviços criados pelos profissionais
- **service_products**: Produtos utilizados em cada serviço

### Políticas de Segurança (RLS):

- **Admins**: Podem gerenciar produtos, categorias, marcas e atualizar status dos serviços
- **Profissionais**: Podem visualizar produtos e criar serviços
- **Ambos**: Podem visualizar seus próprios perfis

## 6. Dados Iniciais

O schema inclui algumas categorias e marcas padrão para facilitar o teste:

**Categorias:**
- Shampoo
- Condicionador
- Máscara Capilar
- Leave-in
- Óleo Capilar
- Styling
- Tratamento

**Marcas:**
- L'Oréal
- Wella
- Schwarzkopf
- Matrix
- Redken
- Kerastase
- Tresemmé

## 7. Testar a Configuração

1. Inicie o projeto: `npm run dev`
2. Acesse a página de registro
3. Crie uma conta de administrador
4. Teste as funcionalidades de CRUD

## 8. Migração dos Dados Existentes (Opcional)

Se você já tem dados no localStorage, pode usar o componente de migração que será criado para transferir os dados para o Supabase.

## Troubleshooting

### Erro de CORS
Se encontrar erros de CORS, verifique se:
- A URL do Supabase está correta no `.env`
- O projeto está sendo executado na porta correta

### Erro de Autenticação
- Verifique se as chaves estão corretas
- Confirme se o RLS está configurado corretamente

### Erro de Permissão
- Verifique se as políticas RLS estão ativas
- Confirme se o usuário tem o tipo correto (admin/professional)

## Recursos Úteis

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [React Hooks do Supabase](https://supabase.com/docs/reference/javascript/hooks)
