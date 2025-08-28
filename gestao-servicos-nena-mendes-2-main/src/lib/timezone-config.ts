/**
 * Configuração global de fuso horário para forçar sempre o horário de Brasília
 * 
 * Este arquivo garante que independente do fuso horário do usuário,
 * toda a aplicação sempre funcionará no horário de Brasília (UTC-3)
 */

import { getBrasiliaDate } from './date-utils';

// Configuração global do timezone
declare global {
  interface DateConstructor {
    /**
     * Sobrescrevemos o Date() original para sempre retornar horário de Brasília
     */
    _originalDate: typeof Date;
  }
}

/**
 * Inicializa a configuração global de timezone
 * Deve ser chamado no início da aplicação
 */
export const initializeTimezoneConfig = () => {
  // Salva o construtor original do Date
  (Date as any)._originalDate = Date;
  
  // Configuração global para forçar fuso horário brasileiro
  const originalToLocaleString = Date.prototype.toLocaleString;
  const originalToLocaleDateString = Date.prototype.toLocaleDateString;
  const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
  
  // Sobrescreve toLocaleString para sempre usar pt-BR e timezone de Brasília
  Date.prototype.toLocaleString = function(locales?: string | string[], options?: Intl.DateTimeFormatOptions) {
    return originalToLocaleString.call(this, 'pt-BR', {
      ...options,
      timeZone: 'America/Sao_Paulo'
    });
  };
  
  // Sobrescreve toLocaleDateString para sempre usar pt-BR e timezone de Brasília
  Date.prototype.toLocaleDateString = function(locales?: string | string[], options?: Intl.DateTimeFormatOptions) {
    return originalToLocaleDateString.call(this, 'pt-BR', {
      ...options,
      timeZone: 'America/Sao_Paulo'
    });
  };
  
  // Sobrescreve toLocaleTimeString para sempre usar pt-BR e timezone de Brasília
  Date.prototype.toLocaleTimeString = function(locales?: string | string[], options?: Intl.DateTimeFormatOptions) {
    return originalToLocaleTimeString.call(this, 'pt-BR', {
      ...options,
      timeZone: 'America/Sao_Paulo'
    });
  };

  console.log('🇧🇷 Configuração de timezone brasileiro inicializada');
};

/**
 * Função auxiliar para criar uma nova data sempre no fuso horário de Brasília
 */
export const createBrazilianDate = (...args: ConstructorParameters<typeof Date>): Date => {
  if (args.length === 0) {
    return getBrasiliaDate();
  }
  
  // Para outros casos, cria a data normalmente e converte para Brasília
  const originalDate = new (Date as any)._originalDate(...args);
  return getBrasiliaDate();
};

/**
 * Override global do console.log para mostrar sempre a data brasileira nos logs
 */
export const enhanceConsoleWithBrazilianTime = () => {
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  const getBrazilianTimePrefix = () => {
    const now = getBrasiliaDate();
    return `[${now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}]`;
  };
  
  console.log = (...args: any[]) => {
    originalLog(getBrazilianTimePrefix(), ...args);
  };
  
  console.info = (...args: any[]) => {
    originalInfo(getBrazilianTimePrefix(), ...args);
  };
  
  console.warn = (...args: any[]) => {
    originalWarn(getBrazilianTimePrefix(), ...args);
  };
  
  console.error = (...args: any[]) => {
    originalError(getBrazilianTimePrefix(), ...args);
  };
};

/**
 * Configuração completa de timezone brasileiro
 * Chama todas as configurações necessárias
 */
export const setupBrazilianTimezone = () => {
  initializeTimezoneConfig();
  enhanceConsoleWithBrazilianTime();
  
  // Configuração adicional do Intl para sempre usar português brasileiro
  if (typeof window !== 'undefined') {
    // Força o locale do navegador para pt-BR
    Object.defineProperty(navigator, 'language', {
      get: () => 'pt-BR',
      configurable: true
    });
    
    Object.defineProperty(navigator, 'languages', {
      get: () => ['pt-BR', 'pt'],
      configurable: true
    });
  }
  
  console.log('✅ Configuração completa de timezone brasileiro aplicada');
};
