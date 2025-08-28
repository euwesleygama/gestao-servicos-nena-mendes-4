
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TypographyH3, TypographyMuted } from "@/components/ui/typography";
import { useAuth } from "@/hooks/use-supabase";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "professional"
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro na validação",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Erro no cadastro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const { data, error } = await signUp(
      formData.email, 
      formData.password, 
      formData.name, 
      formData.userType as 'admin' | 'professional'
    );

    if (data?.user && !error) {
      // Manter compatibilidade com localStorage
      localStorage.setItem("userType", formData.userType);
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("userName", formData.name);
      
      setTimeout(() => {
        navigate(formData.userType === "admin" ? "/admin" : "/profissional");
      }, 500);
    }
    
    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full shadow-elegant mx-auto bg-beauty-secondary border border-beauty-border">
        <CardHeader className="space-y-2 text-center">
          <TypographyH3 className="text-beauty-primary">
            Criar Conta
          </TypographyH3>
          <TypographyMuted>
            Preencha os dados para criar sua conta
          </TypographyMuted>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-beauty-primary">
                Nome Completo
              </Label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Seu nome completo"
                className="flex h-10 w-full rounded-md border border-beauty-border px-3 py-2 text-sm bg-beauty-secondary text-beauty-primary-light placeholder:text-beauty-accent focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:border-beauty-border focus-visible:border-beauty-border transition-none disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-beauty-primary">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                variant="noFocus"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="seu@email.com"
                className="border-beauty-border bg-beauty-secondary text-beauty-primary-light placeholder:text-beauty-accent"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-beauty-primary">
                Senha
              </Label>
              <PasswordInput
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="••••••••"
                className="border-beauty-border bg-beauty-secondary text-beauty-primary-light placeholder:text-beauty-accent focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-beauty-primary">
                Confirmar Senha
              </Label>
              <PasswordInput
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder="••••••••"
                className="border-beauty-border bg-beauty-secondary text-beauty-primary-light placeholder:text-beauty-accent focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-beauty-primary">Tipo de Conta</Label>
              <Select
                value={formData.userType}
                onValueChange={(value) => handleInputChange("userType", value)}
              >
                <SelectTrigger className="w-full border-beauty-border bg-beauty-secondary text-beauty-primary-light focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-beauty-border [&>svg]:text-beauty-accent [&>svg]:opacity-100">
                  <SelectValue placeholder="Selecione o tipo de conta" className="text-beauty-accent" />
                </SelectTrigger>
                <SelectContent className="bg-beauty-secondary border-beauty-border">
                  <SelectItem value="professional" className="cursor-pointer text-beauty-primary hover:bg-beauty-secondary focus:bg-beauty-secondary">
                    Profissional
                  </SelectItem>
                  <SelectItem value="admin" className="cursor-pointer text-beauty-primary hover:bg-beauty-secondary focus:bg-beauty-secondary">
                    Administrador
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-beauty-primary text-beauty-neutral hover:bg-beauty-primary shadow-soft hover:shadow-elegant transition-all duration-300 disabled:bg-beauty-secondary disabled:text-beauty-accent"
            >
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button
              variant="no-hover"
              onClick={() => navigate("/login")}
              className="text-beauty-primary-light font-normal"
            >
              Já tem conta? <span className="font-medium text-beauty-primary-light">Entrar</span>
            </Button>
          </div>
        </CardContent>
      </Card>
  );
}
