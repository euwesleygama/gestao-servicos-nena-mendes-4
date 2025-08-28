#!/usr/bin/env node

/**
 * Script para verificar se o projeto está pronto para deploy
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function checkFile(filepath, description) {
  if (existsSync(filepath)) {
    log(`✅ ${description}`, GREEN);
    return true;
  } else {
    log(`❌ ${description} - Arquivo não encontrado: ${filepath}`, RED);
    return false;
  }
}

function runCheck() {
  log('\n🔍 VERIFICAÇÃO DE DEPLOY - Gestão de Serviços Nena Mendes\n', BLUE);

  let allChecks = true;

  // Verificar arquivos essenciais
  log('📁 Verificando arquivos essenciais:', YELLOW);
  allChecks &= checkFile('package.json', 'package.json');
  allChecks &= checkFile('vite.config.ts', 'Configuração Vite');
  allChecks &= checkFile('vercel.json', 'Configuração Vercel');
  allChecks &= checkFile('src/main.tsx', 'Arquivo principal');
  allChecks &= checkFile('src/lib/supabase.ts', 'Cliente Supabase');

  // Verificar estrutura de pastas
  log('\n📂 Verificando estrutura:', YELLOW);
  allChecks &= checkFile('src/components', 'Pasta de componentes');
  allChecks &= checkFile('src/pages', 'Pasta de páginas');
  allChecks &= checkFile('src/lib', 'Pasta de utilitários');

  // Verificar dependências críticas
  log('\n📦 Verificando dependências:', YELLOW);
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const criticalDeps = [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'date-fns',
      'tailwindcss'
    ];

    criticalDeps.forEach(dep => {
      if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
        log(`✅ ${dep}`, GREEN);
      } else {
        log(`❌ Dependência faltando: ${dep}`, RED);
        allChecks = false;
      }
    });
  } catch (error) {
    log(`❌ Erro ao ler package.json: ${error.message}`, RED);
    allChecks = false;
  }

  // Verificar build
  log('\n🏗️ Testando build:', YELLOW);
  try {
    execSync('npm run build', { stdio: 'pipe' });
    log('✅ Build executado com sucesso', GREEN);
  } catch (error) {
    log('❌ Erro no build', RED);
    log(error.stdout?.toString() || error.message, RED);
    allChecks = false;
  }

  // Verificar se dist foi criado
  if (existsSync('dist')) {
    log('✅ Pasta dist criada', GREEN);
    if (existsSync('dist/index.html')) {
      log('✅ index.html gerado', GREEN);
    } else {
      log('❌ index.html não encontrado em dist', RED);
      allChecks = false;
    }
  } else {
    log('❌ Pasta dist não criada', RED);
    allChecks = false;
  }

  // Resultado final
  log('\n' + '='.repeat(50), BLUE);
  if (allChecks) {
    log('🎉 PROJETO PRONTO PARA DEPLOY!', GREEN);
    log('\nPróximos passos:', BLUE);
    log('1. Configure as variáveis de ambiente na Vercel', RESET);
    log('2. Conecte seu repositório na Vercel', RESET);
    log('3. Faça o deploy!', RESET);
  } else {
    log('❌ PROJETO NÃO ESTÁ PRONTO', RED);
    log('Corrija os problemas acima antes do deploy', YELLOW);
  }
  log('='.repeat(50), BLUE);

  process.exit(allChecks ? 0 : 1);
}

runCheck();
