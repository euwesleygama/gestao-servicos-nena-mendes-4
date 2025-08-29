import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, ChevronDown, CalendarIcon, ArrowLeft, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { formatDateBR, formatNumberBR, getBrasiliaDate, getDateFnsLocale, createIdWithBrasiliaTimestamp } from "@/lib/date-utils";
import { useServices, useProducts } from "@/hooks/use-supabase";

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

export default function CriarServicoDesktop() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addService, loading: loadingService } = useServices();
  const { products, loading: loadingProducts } = useProducts();
  
  const [novoServico, setNovoServico] = useState({
    nomeProfissional: "Profissional",
    nomeCliente: "",
    nomeServico: "",
    produtos: [] as Array<{
      id: string;
      nome: string;
      categoria: string;
      imagem: string;
      quantidade: string;
    }>
  });
  
  const [dataServico, setDataServico] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<Array<{
    id: string;
    nome: string;
    categoria: string;
    imagem: string;
  }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar produtos e dados salvos do localStorage quando o componente montar
  useEffect(() => {
    const carregarProdutos = () => {
      // Produtos de exemplo sempre disponíveis
      const produtosExemplo = [{
        id: "exemplo-1",
        nome: "MATIZADOR - LOURO ESCURO MARROM DOURADO 6.73 60G VEGAN - TRUSS",
        categoria: "Matizador",
        imagem: "/lovable-uploads/a9458181-099d-4115-8ba3-da6d9344619c.png"
      }, {
        id: "exemplo-2",
        nome: "Condicionador Nutritivo",
        categoria: "Condicionador",
        imagem: "/lovable-uploads/a9458181-099d-4115-8ba3-da6d9344619c.png"
      }, {
        id: "exemplo-3",
        nome: "Máscara Reconstrutora",
        categoria: "Máscara",
        imagem: "/lovable-uploads/a9458181-099d-4115-8ba3-da6d9344619c.png"
      }];
      
      // Usar produtos do Supabase se disponíveis
      let produtosFormatados = [...produtosExemplo];
      if (products && products.length > 0) {
        const produtosSupabase = products.map(product => ({
          id: product.id,
          nome: product.name,
          categoria: product.category?.name || 'Sem categoria',
          imagem: product.image_url || "/lovable-uploads/a9458181-099d-4115-8ba3-da6d9344619c.png"
        }));
        produtosFormatados = [...produtosExemplo, ...produtosSupabase];
      } else {
        // Fallback para localStorage se não há produtos do Supabase
        const savedProducts = localStorage.getItem('adminProducts');
        if (savedProducts) {
          try {
            const adminProducts: AdminProduct[] = JSON.parse(savedProducts);
            const produtosAdmin = adminProducts.map(convertAdminProductToModalFormat);
            produtosFormatados = [...produtosExemplo, ...produtosAdmin];
          } catch (error) {
            console.error('Erro ao carregar produtos:', error);
          }
        }
      }
      setProdutosDisponiveis(produtosFormatados);
    };
    
    carregarProdutos();
    
    // Restaurar formulário salvo anteriormente
    const formularioSalvo = localStorage.getItem('formularioServicoTemp');
    if (formularioSalvo) {
      try {
        const dadosFormulario = JSON.parse(formularioSalvo);
        console.log('Restaurando formulário salvo:', dadosFormulario);
        setNovoServico(prev => ({
          ...prev,
          nomeCliente: dadosFormulario.nomeCliente || "",
          nomeServico: dadosFormulario.nomeServico || "",
          produtos: dadosFormulario.produtos || []
        }));
        if (dadosFormulario.dataServico) {
          setDataServico(new Date(dadosFormulario.dataServico));
        }
        localStorage.removeItem('formularioServicoTemp');
      } catch (error) {
        console.error('Erro ao restaurar formulário:', error);
      }
    }
    
    // Define data atual no horário de Brasília apenas se não há data salva
    if (!formularioSalvo || !JSON.parse(formularioSalvo || '{}').dataServico) {
      setDataServico(getBrasiliaDate());
    }
  }, []);

  const handleSubmitServico = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevenir múltiplas submissões
    
    if (!novoServico.nomeCliente || !novoServico.nomeServico) {
      toast({
        title: "Erro na validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🔧 Iniciando criação de serviço...');
      
      // Preparar dados do serviço para o Supabase
      const servicoData = {
        professional_name: novoServico.nomeProfissional,
        client_name: novoServico.nomeCliente,
        service_name: novoServico.nomeServico,
        service_date: dataServico ? dataServico.toISOString().split('T')[0] : getBrasiliaDate().toISOString().split('T')[0],
        status: 'pending' as const
      };

      // Preparar produtos utilizados
      const produtosUtilizados = novoServico.produtos
        .filter(produto => produto.quantidade && produto.quantidade.trim() !== '')
        .map(produto => ({
          product_id: produto.id,
          quantity_used: parseFloat(produto.quantidade.replace(',', '.')) || 0
        }));

      console.log('📝 Dados do serviço:', servicoData);
      console.log('🛍️ Produtos utilizados:', produtosUtilizados);

      // Chamar o hook do Supabase
      const { data, error } = await addService(servicoData, produtosUtilizados);

      if (error) {
        throw error;
      }

      console.log('✅ Serviço criado com sucesso no Supabase:', data);
      
      // Também salvar no localStorage como backup
      const novoServicoSalvo = {
        id: data?.id || createIdWithBrasiliaTimestamp('SRV'),
        ...novoServico,
        dataCriacao: formatDateBR(dataServico || getBrasiliaDate()),
        status: 'pendente'
      };

      const servicosRecebidos = JSON.parse(localStorage.getItem('servicosRecebidos') || '[]');
      servicosRecebidos.unshift(novoServicoSalvo);
      localStorage.setItem('servicosRecebidos', JSON.stringify(servicosRecebidos));

      // Voltar para a página anterior
      navigate(-1);

    } catch (error) {
      console.error('❌ Erro ao criar serviço:', error);
      
      // Em caso de erro, salvar apenas no localStorage como fallback
      const novoServicoSalvo = {
        id: createIdWithBrasiliaTimestamp('SRV'),
        ...novoServico,
        dataCriacao: formatDateBR(dataServico || getBrasiliaDate()),
        status: 'pendente'
      };

      const servicosRecebidos = JSON.parse(localStorage.getItem('servicosRecebidos') || '[]');
      servicosRecebidos.unshift(novoServicoSalvo);
      localStorage.setItem('servicosRecebidos', JSON.stringify(servicosRecebidos));
      
      toast({
        title: "Serviço salvo localmente",
        description: "Não foi possível sincronizar com o servidor, mas o serviço foi salvo localmente.",
        variant: "default"
      });

      // Ainda assim navegar de volta
      navigate(-1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selecionarProduto = (produto: typeof produtosDisponiveis[0]) => {
    setNovoServico(prev => ({
      ...prev,
      produtos: [...prev.produtos, {
        id: produto.id,
        nome: produto.nome,
        categoria: produto.categoria,
        imagem: produto.imagem,
        quantidade: ""
      }]
    }));
    setComboboxOpen(false);
  };

  const formatarNumero = (valor: string) => {
    return formatNumberBR(valor);
  };

  const atualizarQuantidade = (index: number, quantidade: string) => {
    const quantidadeFormatada = formatarNumero(quantidade);
    setNovoServico(prev => ({
      ...prev,
      produtos: prev.produtos.map((produto, i) => 
        i === index ? { ...produto, quantidade: quantidadeFormatada } : produto
      )
    }));
  };

  const removerProduto = (index: number) => {
    setNovoServico(prev => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="h-10 w-10 p-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Novo Serviço</h1>
          <p className="text-sm text-muted-foreground">Registre um novo serviço</p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmitServico} className="space-y-6 max-w-2xl">
        {/* Informações básicas */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeProfissional">Nome da Profissional</Label>
            <Input 
              id="nomeProfissional" 
              value={novoServico.nomeProfissional} 
              onChange={e => setNovoServico(prev => ({
                ...prev,
                nomeProfissional: e.target.value
              }))} 
              readOnly 
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomeCliente">Nome da Cliente</Label>
            <Input 
              id="nomeCliente" 
              placeholder="Nome da cliente" 
              value={novoServico.nomeCliente} 
              onChange={e => setNovoServico(prev => ({
                ...prev,
                nomeCliente: e.target.value
              }))} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomeServico">Nome do Serviço</Label>
            <Input 
              id="nomeServico" 
              placeholder="Ex: Escova Modelada..." 
              value={novoServico.nomeServico} 
              onChange={e => setNovoServico(prev => ({
                ...prev,
                nomeServico: e.target.value
              }))} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Data do Serviço</Label>
            <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dataServico && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataServico ? formatDateBR(dataServico) : <span>Selecione a data</span>}
                </Button>
              </DialogTrigger>
              <DialogContent className="w-auto p-0 max-w-fit rounded-xl">
                <CalendarComponent 
                  mode="single" 
                  selected={dataServico} 
                  onSelect={date => {
                    setDataServico(date);
                    setCalendarOpen(false);
                  }} 
                  locale={getDateFnsLocale()} 
                  initialFocus 
                  className="p-3 pointer-events-auto rounded-xl"
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Seleção de produtos - DESKTOP */}
        <div className="space-y-4">
          <Label>Adicionar Produtos</Label>
          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                role="combobox" 
                aria-expanded={comboboxOpen} 
                className="w-full justify-between"
              >
                <span className="text-muted-foreground">Selecionar produto...</span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Digite para buscar..." />
                <CommandList>
                  <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                  <CommandGroup>
                    {produtosDisponiveis.map(produto => (
                      <CommandItem 
                        key={produto.id} 
                        value={produto.nome} 
                        onSelect={() => selecionarProduto(produto)}
                        className="flex items-center gap-3 p-3"
                      >
                        <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                          <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{produto.nome}</div>
                          <Badge variant="secondary" className="text-xs mt-1">{produto.categoria}</Badge>
                        </div>
                        <Plus className="h-4 w-4" />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Lista de produtos selecionados */}
        <div className="space-y-4">
          <Label>Produtos Utilizados</Label>
          <div className="border rounded-lg p-4 min-h-[200px] bg-muted/30">
            {novoServico.produtos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <p className="font-medium text-sm">Nenhum produto adicionado ainda</p>
                <p className="text-xs mt-1 text-muted-foreground">
                  Use o campo acima para adicionar produtos
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {novoServico.produtos.map((produto, index) => (
                  <div key={index} className="bg-card border rounded-lg p-4 relative">
                    <div className="flex gap-3">
                      <img 
                        src={produto.imagem} 
                        alt={produto.nome} 
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0" 
                      />
                      <div className="flex-1 space-y-3">
                        <h3 className="font-medium text-sm leading-tight">
                          {produto.nome}
                        </h3>
                        <Input 
                          placeholder="Digite a quantidade utilizada" 
                          value={produto.quantidade} 
                          onChange={e => atualizarQuantidade(index, e.target.value)} 
                          className="text-sm"
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removerProduto(index)} 
                        className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 pt-6">
          <Button 
            type="submit" 
            className="flex-1" 
            disabled={isSubmitting || loadingService}
          >
            {isSubmitting ? "SALVANDO..." : "SALVAR"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1" 
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            CANCELAR
          </Button>
        </div>
      </form>
    </div>
  );
}