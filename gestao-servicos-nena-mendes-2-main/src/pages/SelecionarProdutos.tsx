import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Plus, Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Interface para produtos do admin
interface AdminProduct {
  id: string;
  name: string;
  category: string;
  brand: string;
  imageUrl?: string;
}

// Função para converter produtos do admin para formato do modal
const convertAdminProductToModalFormat = (adminProduct: AdminProduct) => ({
  id: adminProduct.id,
  nome: adminProduct.name,
  categoria: adminProduct.category,
  imagem: adminProduct.imageUrl || "/lovable-uploads/a9458181-099d-4115-8ba3-da6d9344619c.png"
});

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  imagem: string;
}

export default function SelecionarProdutos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<Produto[]>([]);
  const [produtosSelecionados, setProdutosSelecionados] = useState<string[]>([]);

  // Carregar produtos do localStorage quando o componente montar
  useEffect(() => {
    const carregarProdutos = () => {
      const savedProducts = localStorage.getItem('adminProducts');
      let produtosFormatados: Produto[] = [];
      
      if (savedProducts) {
        try {
          const adminProducts: AdminProduct[] = JSON.parse(savedProducts);
          produtosFormatados = adminProducts.map(convertAdminProductToModalFormat);
        } catch (error) {
          console.error('Erro ao carregar produtos:', error);
        }
      }
      
      setProdutosDisponiveis(produtosFormatados);
    };
    
    carregarProdutos();
    
    // Listener para mudanças no localStorage (sincronização entre abas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminProducts') {
        carregarProdutos();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleProduto = (produtoId: string) => {
    setProdutosSelecionados(prev => 
      prev.includes(produtoId) 
        ? prev.filter(id => id !== produtoId)
        : [...prev, produtoId]
    );
  };

  const confirmarSelecao = () => {
    const produtos = produtosDisponiveis.filter(p => produtosSelecionados.includes(p.id));
    
    // Salvar produtos selecionados no sessionStorage para comunicação
    sessionStorage.setItem('produtosSelecionadosTemp', JSON.stringify(produtos));
    
    toast({
      title: "Produtos selecionados",
      description: `${produtos.length} produto(s) adicionado(s) ao serviço.`
    });
    
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-10 w-10 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Selecionar Produtos</h1>
              <p className="text-sm text-muted-foreground">
                {produtosSelecionados.length} selecionado(s)
              </p>
            </div>
          </div>
          
          {produtosSelecionados.length > 0 && (
            <Button onClick={confirmarSelecao} size="sm">
              Confirmar
            </Button>
          )}
        </div>
      </div>

      {/* Lista de produtos */}
      <div className="p-4">
        <div className="-mr-1">
          <Command className="bg-transparent">
            <CommandInput 
              placeholder="Buscar produtos..." 
              className="border border-border mb-4 pl-6"
            />
            <CommandList>
              <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
              <CommandGroup className="p-0">
                <div className="space-y-3">
                {produtosDisponiveis.map(produto => {
                  const isSelected = produtosSelecionados.includes(produto.id);
                  
                  return (
                    <CommandItem 
                      key={produto.id} 
                      value={produto.nome} 
                      onSelect={() => toggleProduto(produto.id)}
                      className={cn(
                        "flex items-center gap-3 p-4 cursor-pointer rounded-lg border transition-smooth",
                        isSelected 
                          ? "bg-primary/5 border-primary" 
                          : "bg-card border-border hover:bg-accent"
                      )}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={produto.imagem} 
                          alt={produto.nome} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm leading-tight text-foreground line-clamp-2">
                          {produto.nome}
                        </div>
                        <Badge variant="secondary" className="text-xs mt-2 text-white" style={{ backgroundColor: '#262626' }}>
                          {produto.categoria}
                        </Badge>
                      </div>
                      
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        ) : (
                          <Plus className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
               </div>
             </CommandGroup>
             </CommandList>
           </Command>
         </div>
       </div>
     </div>
   );
 }