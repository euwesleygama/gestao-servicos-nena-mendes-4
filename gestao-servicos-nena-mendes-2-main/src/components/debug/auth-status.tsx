import { useAuth } from '@/hooks/use-supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Shield, AlertCircle } from 'lucide-react';

export default function AuthStatus() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Verificando autenticação...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Status de Autenticação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user ? (
          <>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">Logado como:</span>
            </div>
            
            <div className="pl-6 space-y-2">
              <p><strong>Nome:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <div className="flex items-center gap-2">
                <strong>Tipo:</strong>
                <Badge 
                  variant={user.user_type === 'admin' ? 'default' : 'secondary'}
                  className={user.user_type === 'admin' ? 'bg-green-500' : 'bg-blue-500'}
                >
                  {user.user_type === 'admin' ? 'Administrador' : 'Profissional'}
                </Badge>
              </div>
            </div>

            {user.user_type === 'admin' ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-center gap-2 text-green-700">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">✅ Pode adicionar categorias e marcas</span>
                </div>
              </div>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                <div className="flex items-center gap-2 text-orange-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">⚠️ Apenas visualização (não pode adicionar)</span>
                </div>
              </div>
            )}

            <Button 
              onClick={signOut} 
              variant="outline" 
              className="w-full"
            >
              Fazer Logout
            </Button>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center justify-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">❌ Não está logado</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button asChild className="w-full">
                <a href="/register">Criar Conta Admin</a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/login">Fazer Login</a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
