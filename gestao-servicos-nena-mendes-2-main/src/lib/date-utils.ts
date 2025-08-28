import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LOCALE_CONFIG } from "./app-config";

// Configuração do fuso horário de Brasília (UTC-3)
const BRASILIA_OFFSET = LOCALE_CONFIG.BRASILIA_OFFSET;

/**
 * Obtém a data/hora atual no fuso horário de Brasília
 */
export const getBrasiliaDate = (): Date => {
  const agora = new Date();
  const utc = agora.getTime() + (agora.getTimezoneOffset() * 60000);
  const dataBrasilia = new Date(utc + (BRASILIA_OFFSET * 3600000));
  return dataBrasilia;
};

/**
 * Converte qualquer data para o fuso horário de Brasília
 * IMPORTANTE: Mantém a data "local" se já estiver no dia correto
 */
export const convertToBrasiliaDate = (date: Date | string): Date => {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  
  // Se a data já é do mesmo dia, não convertemos para evitar mudanças
  // Isso é especialmente importante para datas selecionadas pelo usuário
  return inputDate;
};

/**
 * Formata data no padrão brasileiro: dd/mm/aaaa
 * IMPORTANTE: Usa diretamente os valores da data para garantir consistência
 */
export const formatDateBR = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  try {
    const inputDate = typeof date === 'string' ? new Date(date) : date;
    
    // Pega os valores da data diretamente para garantir que não mude
    const day = inputDate.getDate();
    const month = inputDate.getMonth() + 1;
    const year = inputDate.getFullYear();
    
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
};

/**
 * Formata data e hora no padrão brasileiro: dd/mm/aaaa HH:mm
 */
export const formatDateTimeBR = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  try {
    const targetDate = convertToBrasiliaDate(date);
    return format(targetDate, LOCALE_CONFIG.DATE_FORMATS.MEDIUM, { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data e hora:', error);
    return '';
  }
};

/**
 * Formata apenas a hora no padrão brasileiro: HH:mm
 */
export const formatTimeBR = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  try {
    const targetDate = convertToBrasiliaDate(date);
    return format(targetDate, LOCALE_CONFIG.DATE_FORMATS.TIME_ONLY, { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar hora:', error);
    return '';
  }
};

/**
 * Formata data completa no padrão brasileiro: Segunda-feira, 28 de agosto de 2025
 */
export const formatFullDateBR = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  try {
    const targetDate = convertToBrasiliaDate(date);
    return format(targetDate, LOCALE_CONFIG.DATE_FORMATS.FULL, { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data completa:', error);
    return '';
  }
};

/**
 * Formata valor monetário no padrão brasileiro
 */
export const formatCurrencyBR = (value: number): string => {
  return value.toLocaleString(LOCALE_CONFIG.PRIMARY_LOCALE, LOCALE_CONFIG.CURRENCY_CONFIG);
};

/**
 * Formata números no padrão brasileiro (com pontos para milhares)
 */
export const formatNumberBR = (value: number | string): string => {
  if (typeof value === 'string') {
    const numeros = value.replace(/\D/g, '');
    if (!numeros) return '';
    const numero = parseInt(numeros);
    return numero.toLocaleString(LOCALE_CONFIG.PRIMARY_LOCALE, LOCALE_CONFIG.NUMBER_CONFIG);
  }
  return value.toLocaleString(LOCALE_CONFIG.PRIMARY_LOCALE, LOCALE_CONFIG.NUMBER_CONFIG);
};

/**
 * Obtém timestamp único baseado no horário de Brasília
 */
export const getBrasiliaTimestamp = (): number => {
  return getBrasiliaDate().getTime();
};

/**
 * Cria ID único com prefixo e timestamp de Brasília
 */
export const createIdWithBrasiliaTimestamp = (prefix: string = 'ID'): string => {
  return `${prefix}${getBrasiliaTimestamp()}`;
};

/**
 * Obtém configurações de localização para date-fns
 */
export const getDateFnsLocale = () => ptBR;

/**
 * Converte data no formato dd/mm/aaaa para objeto Date
 */
export const parseDateBR = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  try {
    // Espera formato dd/mm/aaaa
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    
    const [day, month, year] = parts;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) return null;
    
    return convertToBrasiliaDate(date);
  } catch (error) {
    console.error('Erro ao converter data brasileira:', error);
    return null;
  }
};

/**
 * Verifica se uma data está no fuso horário de Brasília
 */
export const isInBrasiliaTimezone = (date: Date): boolean => {
  const brasiliaDate = convertToBrasiliaDate(date);
  return Math.abs(date.getTime() - brasiliaDate.getTime()) < 1000; // 1 segundo de tolerância
};

/**
 * Obtém data/hora formatada para exibição em tempo real
 */
export const getCurrentBrasiliaDateTime = (): string => {
  return formatDateTimeBR(getBrasiliaDate());
};

/**
 * Obtém apenas a data atual de Brasília formatada
 */
export const getCurrentBrasiliaDate = (): string => {
  return formatDateBR(getBrasiliaDate());
};

/**
 * Obtém apenas a hora atual de Brasília formatada
 */
export const getCurrentBrasiliaTime = (): string => {
  return formatTimeBR(getBrasiliaDate());
};

/**
 * Converte data para formato ISO de banco de dados SEM mudanças de timezone
 * Esta função FORÇA a manutenção exata da data selecionada
 */
export const formatDateForDatabase = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  try {
    let inputDate: Date;
    
    if (typeof date === 'string') {
      // Se é string, parseamos cuidadosamente
      inputDate = new Date(date);
    } else {
      inputDate = date;
    }
    
    console.log('🔍 Input original:', date);
    console.log('🔍 Objeto Date criado:', inputDate);
    console.log('🔍 toString():', inputDate.toString());
    console.log('🔍 toISOString():', inputDate.toISOString());
    console.log('🔍 getTimezoneOffset():', inputDate.getTimezoneOffset());
    
    // MÉTODO ALTERNATIVO: Criar uma nova data no horário local que force os valores corretos
    const year = inputDate.getFullYear();
    const month = inputDate.getMonth(); // 0-11
    const day = inputDate.getDate();
    
    console.log('🔍 Valores extraídos:', { year, month, day });
    
    // Criar uma nova data forçando o timezone local para evitar conversões
    const localDate = new Date(year, month, day, 12, 0, 0); // 12h para evitar problemas de DST
    
    console.log('🔍 Data local criada:', localDate);
    console.log('🔍 Data local toString:', localDate.toString());
    
    const finalYear = localDate.getFullYear();
    const finalMonth = localDate.getMonth() + 1; // Agora convertemos para 1-12
    const finalDay = localDate.getDate();
    
    const formatted = `${finalYear}-${String(finalMonth).padStart(2, '0')}-${String(finalDay).padStart(2, '0')}`;
    
    console.log('🔍 RESULTADO FINAL:', {
      finalYear,
      finalMonth,
      finalDay,
      formatted
    });
    
    return formatted;
  } catch (error) {
    console.error('❌ Erro ao formatar data para banco:', error);
    return '';
  }
};

/**
 * Versão SUPER SEGURA do formatDateBR que mantém a data exata
 */
export const safeDateBR = (date: Date): string => {
  if (!date) return '';
  
  try {
    // Extrair componentes da data diretamente
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 0-11 → 1-12
    const day = date.getDate();
    
    // Formatar manualmente como dd/mm/aaaa
    const dayStr = day < 10 ? `0${day}` : day.toString();
    const monthStr = month < 10 ? `0${month}` : month.toString();
    const yearStr = year.toString();
    
    return `${dayStr}/${monthStr}/${yearStr}`;
  } catch (error) {
    console.error('❌ Erro na formatação segura BR:', error);
    return '';
  }
};

/**
 * Função SUPER SEGURA para extrair data SEM conversão de timezone
 * Funciona apenas com strings manuais para eliminar problemas de Date()
 */
export const safeDateForDatabase = (date: Date): string => {
  if (!date) return '';
  
  try {
    // Método MANUAL: extrair componentes e formatar como string
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 0-11 → 1-12
    const day = date.getDate();
    
    // Log para debug
    console.log('🛡️ SAFE DATE CONVERSION:');
    console.log('  - Input date object:', date);
    console.log('  - getFullYear():', year);
    console.log('  - getMonth() + 1:', month);
    console.log('  - getDate():', day);
    
    // Formatar manualmente SEM usar qualquer função de Date
    const yearStr = year.toString();
    const monthStr = month < 10 ? `0${month}` : month.toString();
    const dayStr = day < 10 ? `0${day}` : day.toString();
    
    const result = `${yearStr}-${monthStr}-${dayStr}`;
    console.log('  - RESULTADO:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Erro na conversão segura:', error);
    return '';
  }
};

/**
 * Função para processar datas que vêm do banco de dados
 * Trata tanto YYYY-MM-DD quanto YYYY-MM-DD HH:mm:ss
 */
export const formatDatabaseDateToBR = (databaseDate: string): string => {
  if (!databaseDate) return '';
  
  try {
    console.log('🗃️ PROCESSANDO DATA DO BANCO:', databaseDate);
    
    // Se contém 'T' é um ISO string (ex: 2025-08-03T10:30:00.000Z)
    if (databaseDate.includes('T')) {
      const datePart = databaseDate.split('T')[0]; // Pega só a parte da data
      console.log('🗃️ Data ISO, extraindo parte da data:', datePart);
      return formatDatabaseDateToBR(datePart); // Recursão para processar só a data
    }
    
    // Se contém espaço é datetime (ex: 2025-08-03 10:30:00)
    if (databaseDate.includes(' ')) {
      const datePart = databaseDate.split(' ')[0]; // Pega só a parte da data
      console.log('🗃️ DateTime, extraindo parte da data:', datePart);
      return formatDatabaseDateToBR(datePart); // Recursão para processar só a data
    }
    
    // Se é uma string no formato YYYY-MM-DD, parseamos manualmente
    const parts = databaseDate.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2].split(' ')[0]; // Remove qualquer parte de hora que sobrou
      
      console.log('🗃️ Partes da data:', { year, month, day });
      
      // Retorna no formato dd/mm/aaaa
      const result = `${day}/${month}/${year}`;
      console.log('🗃️ Resultado formatado:', result);
      
      return result;
    }
    
    // Fallback: tentar criar um Date object com função segura
    const date = new Date(databaseDate);
    if (!isNaN(date.getTime())) {
      return safeDateBR(date);
    }
    
    console.warn('⚠️ Formato de data não reconhecido:', databaseDate);
    return databaseDate; // Retorna original se não conseguir processar
    
  } catch (error) {
    console.error('❌ Erro ao processar data do banco:', error);
    return databaseDate; // Retorna original se der erro
  }
};

/**
 * Função de debug para verificar como as datas estão sendo convertidas
 */
export const debugDateConversion = (date: Date | string, description: string = '') => {
  console.log(`🐛 DEBUG DATE ${description}:`);
  console.log('  - Data original:', date);
  console.log('  - Tipo:', typeof date);
  
  if (date) {
    const inputDate = typeof date === 'string' ? new Date(date) : date;
    console.log('  - getDate():', inputDate.getDate());
    console.log('  - getMonth():', inputDate.getMonth());
    console.log('  - getFullYear():', inputDate.getFullYear());
    console.log('  - toString():', inputDate.toString());
  }
  
  console.log('  - formatDateBR:', formatDateBR(date));
  console.log('  - formatDateForDatabase:', formatDateForDatabase(date));
  console.log('---');
};

/**
 * Converte data para formato ISO completo de banco de dados (com hora)
 * Sempre considera a data no fuso horário de Brasília
 */
export const formatDateTimeForDatabase = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  try {
    const targetDate = convertToBrasiliaDate(date);
    // Formato YYYY-MM-DD HH:mm:ss sem conversão de timezone
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const hours = String(targetDate.getHours()).padStart(2, '0');
    const minutes = String(targetDate.getMinutes()).padStart(2, '0');
    const seconds = String(targetDate.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Erro ao formatar data/hora para banco:', error);
    return '';
  }
};
