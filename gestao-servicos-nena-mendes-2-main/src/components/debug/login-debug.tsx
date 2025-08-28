import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-supabase';
import { CheckCircle, XCircle, Clock, AlertCircle, Wifi } from 'lucide-react';

export default function LoginDebug() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { signIn } = useAuth();

  const addResult = (test: string, status: 'success' | 'error' | 'warning', message: string, data?: any) => {
    const result = {
      test,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    setResults(prev => [...prev, result]);
    console.log(`🧪 [${test}] ${status.toUpperCase()}: ${message}`, data);
  };

  const testConnection = async () => {
    setTesting(true);
    setResults([]);

    // 1. Teste de configuração do Supabase
    addResult('Config', 'warning', 'Verificando configuração...');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      addResult('Config', 'error', 'Variáveis de ambiente não configuradas');
      setTesting(false);
      return;
    }

    addResult('Config', 'success', 'Variáveis de ambiente configuradas', {
      url: supabaseUrl,
      hasKey: !!supabaseKey
    });

    // 2. Teste de conectividade
    addResult('Connectivity', 'warning', 'Testando conectividade...');
    try {
      const startTime = Date.now();
      const { data, error } = await supabase.auth.getSession();
      const endTime = Date.now();
      
      if (error) {
        addResult('Connectivity', 'error', `Erro de conexão: ${error.message}`);
      } else {
        addResult('Connectivity', 'success', `Conectado em ${endTime - startTime}ms`, {
          session: !!data.session,
          responseTime: endTime - startTime
        });
      }
    } catch (error) {
      addResult('Connectivity', 'error', `Falha na conectividade: ${error}`);
    }

    // 3. Teste de database
    addResult('Database', 'warning', 'Testando acesso ao banco...');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        addResult('Database', 'error', `Erro no banco: ${error.message}`);
      } else {
        addResult('Database', 'success', 'Acesso ao banco funcionando');
      }
    } catch (error) {
      addResult('Database', 'error', `Falha no banco: ${error}`);
    }

    // 4. Teste de login (se credenciais fornecidas)
    if (email && password) {
      addResult('Login', 'warning', 'Testando login...');
      try {
        const startTime = Date.now();
        const result = await signIn(email, password);
        const endTime = Date.now();

        if (result.error) {
          addResult('Login', 'error', `Falha no login: ${result.error.message}`, {
            responseTime: endTime - startTime
          });
        } else {
          addResult('Login', 'success', `Login bem-sucedido em ${endTime - startTime}ms`, {
            user: result.data?.user?.email,
            responseTime: endTime - startTime
          });
        }
      } catch (error) {
        addResult('Login', 'error', `Erro no login: ${error}`);
      }
    }

    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 border-green-200 text-green-800';
      case 'error': return 'bg-red-100 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Debug de Login e Conectividade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email (opcional)</Label>
              <Input 
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Senha (opcional)</Label>
              <Input 
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button 
            onClick={testConnection} 
            disabled={testing}
            className="w-full"
          >
            {testing ? 'Testando...' : 'Executar Testes'}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-md ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(result.status)}
                    <Badge variant="outline" className="text-xs">
                      {result.test}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {result.timestamp}
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium">{result.message}</p>
                  
                  {result.data && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-gray-600">
                        Ver detalhes
                      </summary>
                      <pre className="mt-1 text-xs bg-gray-50 p-2 rounded border overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
