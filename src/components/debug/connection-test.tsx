import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ConnectionTest() {
  const [status, setStatus] = useState('Testando...');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('🔄 Testando conexão...');
      
      // Teste 1: Verificar variáveis de ambiente
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        setStatus('❌ Variáveis de ambiente não encontradas');
        setDetails({ url: !!url, key: !!key });
        return;
      }

      // Teste 2: Verificar conexão com Supabase
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setStatus('❌ Erro na conexão com Supabase');
        setDetails({ error: error.message });
        return;
      }

      // Teste 3: Verificar se consegue acessar tabelas
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (testError) {
        setStatus('❌ Erro ao acessar banco de dados');
        setDetails({ error: testError.message });
        return;
      }

      setStatus('✅ Conexão funcionando perfeitamente!');
      setDetails({
        url: url.substring(0, 30) + '...',
        session: !!data.session,
        database: 'Acessível'
      });

    } catch (error: any) {
      setStatus('❌ Erro inesperado');
      setDetails({ error: error.message });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Teste de Conexão Supabase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-lg font-medium">{status}</p>
          </div>
          
          {details && (
            <div className="bg-gray-100 p-3 rounded-md">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}
          
          <Button onClick={testConnection} className="w-full">
            Testar Novamente
          </Button>
          
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Voltar ao Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
