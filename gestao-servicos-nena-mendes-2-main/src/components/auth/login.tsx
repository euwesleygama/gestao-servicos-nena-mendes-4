import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { TypographyH3, TypographyMuted } from "@/components/ui/typography";
import { useAuth } from "@/hooks/use-supabase";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Evitar múltiplas submissões
    if (isLoading) return;
    
    setIsLoading(true);

    if (!email || !password) {
      toast({
        title: "Erro no login",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Timeout para evitar carregamento infinito
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Timeout",
        description: "A conexão demorou muito. Tente novamente.",
        variant: "destructive",
      });
    }, 10000); // 10 segundos

    try {
      console.log('🔐 Tentando fazer login com:', email);
      const { data, error } = await signIn(email, password);

      clearTimeout(timeoutId);

      if (error) {
        console.error('❌ Erro retornado do signIn:', error);
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        console.log('✅ Login bem-sucedido:', data.user);
        
        // Buscar dados do perfil da tabela profiles
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('user_type, name')
            .eq('id', data.user.id)
            .single();

          let userType = "professional";
          let userName = "Usuário";

          if (profile && !profileError) {
            userType = profile.user_type || "professional";
            userName = profile.name || data.user.user_metadata?.name || "Usuário";
            console.log('👤 Perfil encontrado:', profile);
          } else {
            // Fallback para user_metadata se perfil não existir
            userType = data.user.user_metadata?.user_type || "professional";
            userName = data.user.user_metadata?.name || "Usuário";
            console.log('⚠️ Usando fallback do user_metadata:', { userType, userName });
          }
          
          // Manter compatibilidade com localStorage
          localStorage.setItem("userType", userType);
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userName", userName);
          
          console.log('🚀 Redirecionando para:', userType === "admin" ? "/admin" : "/profissional");
          
          // Redirecionamento
          navigate(userType === "admin" ? "/admin" : "/profissional");
          
        } catch (profileError) {
          console.error('❌ Erro ao buscar perfil:', profileError);
          // Continuar com dados do user_metadata
          const userType = data.user.user_metadata?.user_type || "professional";
          const userName = data.user.user_metadata?.name || "Usuário";
          
          localStorage.setItem("userType", userType);
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userName", userName);
          
          navigate(userType === "admin" ? "/admin" : "/profissional");
        }
      } else {
        console.error('❌ Dados do usuário não encontrados');
        toast({
          title: "Erro no login",
          description: "Falha na autenticação. Verifique suas credenciais.",
          variant: "destructive",
        });
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('❌ Erro geral no login:', error);
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro de conexão. Verifique sua internet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-elegant mx-auto bg-beauty-secondary border-beauty-border">
        <CardHeader className="space-y-2 text-center">
          <TypographyH3 className="text-beauty-primary">
            Entrar
          </TypographyH3>
           <TypographyMuted className="text-beauty-subtitle">
             Entre na sua conta para continuar
           </TypographyMuted>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-beauty-primary-light">
                Email
              </Label>
               <Input
                 id="email"
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="seu@email.com"
                 variant="noFocus"
                 className="focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-beauty-accent border-beauty-border bg-beauty-secondary text-beauty-primary-light"
                 required
               />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-beauty-primary-light">
                Senha
              </Label>
               <PasswordInput
                 id="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="••••••••"
                 className="bg-beauty-secondary text-beauty-primary-light placeholder:text-beauty-accent focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none border-beauty-border"
                 required
               />
            </div>
             <Button
               type="submit"
               disabled={isLoading}
               className="w-full bg-beauty-button text-beauty-secondary hover:bg-beauty-button/90 shadow-soft hover:shadow-elegant transition-all duration-300 disabled:bg-beauty-accent disabled:text-beauty-secondary"
             >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <div className="mt-6 text-center">
             <Button
               variant="no-hover"
               onClick={() => navigate("/register")}
               className="font-normal text-beauty-primary-light"
             >
               Não tem conta? <span className="font-medium text-beauty-primary-light">Criar uma agora</span>
             </Button>
          </div>
        </CardContent>
      </Card>
  );
}