import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SimpleTest() {
  const [status, setStatus] = useState('Testando conexão...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Testar conexão básica
        const { data, error } = await supabase
          .from('categories')
          .select('count')
          .limit(1);

        if (error) {
          throw error;
        }

        setStatus('✅ Conexão com Supabase funcionando!');
        console.log('Supabase conectado:', data);
      } catch (err: any) {
        setError(err.message);
        setStatus('❌ Erro na conexão');
        console.error('Erro Supabase:', err);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Teste de Conexão Supabase
        </h1>
        
        <div className="mb-4">
          <p className="text-lg">{status}</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Erro:</strong> {error}
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Não definida'}</p>
          <p><strong>Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Definida' : 'Não definida'}</p>
        </div>

        <div className="mt-4 text-center">
          <a 
            href="/login" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Ir para Login
          </a>
        </div>
      </div>
    </div>
  );
}
