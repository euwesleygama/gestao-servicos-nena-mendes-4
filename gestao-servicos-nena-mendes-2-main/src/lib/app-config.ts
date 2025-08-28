/**
 * Configurações globais da aplicação
 * 
 * Este arquivo centraliza todas as configurações importantes da aplicação,
 * especialmente relacionadas à localização brasileira
 */

// Configurações de localização
export const LOCALE_CONFIG = {
  // Locale principal da aplicação
  PRIMARY_LOCALE: 'pt-BR',
  
  // Timezone da aplicação (sempre Brasília)
  TIMEZONE: 'America/Sao_Paulo',
  
  // Offset do fuso horário de Brasília em relação ao UTC
  BRASILIA_OFFSET: -3,
  
  // Configurações de formatação de moeda
  CURRENCY_CONFIG: {
    style: 'currency' as const,
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  
  // Configurações de formatação de números
  NUMBER_CONFIG: {
    useGrouping: true,
  },
  
  // Formatos de data padrão
  DATE_FORMATS: {
    SHORT: 'dd/MM/yyyy',           // 28/08/2025
    MEDIUM: 'dd/MM/yyyy HH:mm',    // 28/08/2025 15:30
    LONG: 'dd/MM/yyyy HH:mm:ss',   // 28/08/2025 15:30:45
    TIME_ONLY: 'HH:mm',            // 15:30
    FULL: "EEEE, dd 'de' MMMM 'de' yyyy", // Segunda-feira, 28 de agosto de 2025
  }
} as const;

// Configurações da aplicação
export const APP_CONFIG = {
  // Nome da aplicação
  NAME: 'Gestão de Serviços Nena Mendes',
  
  // Versão da aplicação
  VERSION: '2.0.0',
  
  // Configurações de IDs
  ID_PREFIXES: {
    SERVICE: 'SRV',
    PRODUCT: 'PRD',
    USER: 'USR',
    CATEGORY: 'CAT',
    BRAND: 'BRD',
  },
  
  // Configurações de validação
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    MAX_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
  },
  
  // Configurações de armazenamento local
  STORAGE_KEYS: {
    USER_PREFERENCES: 'user_preferences',
    FORM_DATA_TEMP: 'form_data_temp',
    SELECTED_PRODUCTS: 'selected_products_temp',
    SERVICES_CACHE: 'services_cache',
  }
} as const;

// Mensagens padrão da aplicação
export const MESSAGES = {
  SUCCESS: {
    SERVICE_CREATED: 'Serviço criado com sucesso!',
    SERVICE_UPDATED: 'Serviço atualizado com sucesso!',
    SERVICE_DELETED: 'Serviço excluído com sucesso!',
    PRODUCT_CREATED: 'Produto cadastrado com sucesso!',
    PRODUCT_UPDATED: 'Produto atualizado com sucesso!',
    PRODUCT_DELETED: 'Produto excluído com sucesso!',
  },
  
  ERROR: {
    GENERIC: 'Ocorreu um erro inesperado',
    NETWORK: 'Erro de conexão. Verifique sua internet',
    VALIDATION: 'Preencha todos os campos obrigatórios',
    NOT_FOUND: 'Item não encontrado',
    UNAUTHORIZED: 'Acesso não autorizado',
  },
  
  CONFIRMATION: {
    DELETE_SERVICE: 'Tem certeza que deseja excluir este serviço?',
    DELETE_PRODUCT: 'Tem certeza que deseja excluir este produto?',
    LOGOUT: 'Tem certeza que deseja sair?',
  }
} as const;

// Configurações de tema e interface
export const UI_CONFIG = {
  // Cores do tema brasileiro
  COLORS: {
    PRIMARY: '#262626',      // Preto principal
    SECONDARY: '#f5f5f5',    // Branco secundário
    ACCENT: '#737373',       // Cinza de destaque
    SUCCESS: '#22c55e',      // Verde sucesso
    WARNING: '#f59e0b',      // Amarelo atenção
    ERROR: '#ef4444',        // Vermelho erro
    INFO: '#3b82f6',         // Azul informação
  },
  
  // Configurações de animação
  ANIMATION: {
    DURATION_FAST: '200ms',
    DURATION_NORMAL: '300ms',
    DURATION_SLOW: '500ms',
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Breakpoints responsivos
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  }
} as const;

// Função para verificar se a aplicação está em modo de desenvolvimento
export const isDevelopment = () => {
  return import.meta.env.DEV;
};

// Função para verificar se a aplicação está em produção
export const isProduction = () => {
  return import.meta.env.PROD;
};

// Função para obter configurações baseadas no ambiente
export const getEnvironmentConfig = () => {
  return {
    isDev: isDevelopment(),
    isProd: isProduction(),
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
};

// Export default com todas as configurações
export default {
  LOCALE: LOCALE_CONFIG,
  APP: APP_CONFIG,
  MESSAGES,
  UI: UI_CONFIG,
  isDevelopment,
  isProduction,
  getEnvironmentConfig,
} as const;
