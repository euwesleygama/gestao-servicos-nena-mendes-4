import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Package, MapPin, Calendar, CheckCircle2, Clock, Truck, Plus, Search, Filter, Download, ChevronDown, X, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useProducts, useServices, useAuth } from "@/hooks/use-supabase";
import { formatDateBR, formatNumberBR, getBrasiliaDate, getDateFnsLocale, formatDateForDatabase, debugDateConversion, safeDateForDatabase, safeDateBR, formatDatabaseDateToBR } from "@/lib/date-utils";

// Dados serão carregados do localStorage

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

export default function EnviosDashboard() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // Usar hooks do Supabase
  const { products: produtosSupabase, loading: loadingProducts } = useProducts();
  const { services, addService, loading: loadingServices } = useServices();
  const { user } = useAuth();
  
  const [novoEnvio, setNovoEnvio] = useState({
    destinatario: "",
    endereco: "",
    cep: "",
    cidade: "",
    estado: "",
    produto: "",
    observacoes: "",
    prioridade: "normal"
  });
  const [novoServico, setNovoServico] = useState({
    nomeProfissional: "",
    nomeCliente: "",
    nomeServico: "",
    produtos: [] as Array<{
      id: string;
      nome: string;
      categoria: string;
      imagem: string;
      quantidade: string;
      custoUnitario?: number;
    }>
  });
  const [dataServico, setDataServico] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [produtoSelecionadoCombobox, setProdutoSelecionadoCombobox] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalProdutosAberto, setModalProdutosAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [busca, setBusca] = useState("");
  const [produtosExpandidos, setProdutosExpandidos] = useState<Record<string, boolean>>({});
  
  // Converter produtos do Supabase para formato do componente
  const produtosDisponiveis = produtosSupabase.map(product => ({
    id: product.id,
    nome: product.name,
    categoria: product.category?.name || 'Sem categoria',
    imagem: product.image_url || "/lovable-uploads/a9458181-099d-4115-8ba3-da6d9344619c.png"
  }));

  const { toast } = useToast();

  // Os produtos agora vêm automaticamente do Supabase via hook useProducts
  // Com subscriptions em tempo real - não precisa de localStorage!

  // Os serviços agora vêm automaticamente do Supabase via hook useServices
  // Com subscriptions em tempo real!

  // Atualizar nome do profissional quando usuário carregar
  useEffect(() => {
    if (user && user.name) {
      setNovoServico(prev => ({
        ...prev,
        nomeProfissional: user.name
      }));
    }
  }, [user]);

  // Previne seleção automática do texto no modal e define data inicial apenas se não existir
  useEffect(() => {
    if (modalAberto) {
      // Define data atual no horário de Brasília APENAS se não há data selecionada
      if (!dataServico) {
        setDataServico(getBrasiliaDate());
      }
      
      // Pequeno delay para garantir que o modal foi renderizado
      setTimeout(() => {
        const profissionalInput = document.getElementById('nomeProfissional');
        if (profissionalInput) {
          profissionalInput.blur();
          // Remove qualquer seleção existente
          if (window.getSelection) {
            window.getSelection()?.removeAllRanges();
          }
        }
      }, 50);
    }
  }, [modalAberto]);
  const handleSubmitEnvio = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!novoEnvio.destinatario || !novoEnvio.endereco || !novoEnvio.produto) {
      toast({
        title: "Erro na validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Envio criado com sucesso!",
      description: `Envio para ${novoEnvio.destinatario} foi registrado.`
    });

    // Reset form
    setNovoEnvio({
      destinatario: "",
      endereco: "",
      cep: "",
      cidade: "",
      estado: "",
      produto: "",
      observacoes: "",
      prioridade: "normal"
    });
  };
  const handleSubmitServico = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔄 handleSubmitServico chamado');
    console.log('📋 Dados do serviço:', { novoServico, dataServico });

    if (!novoServico.nomeCliente || !novoServico.nomeServico || !dataServico) {
      console.log('❌ Validação falhou:', {
        nomeCliente: novoServico.nomeCliente,
        nomeServico: novoServico.nomeServico,
        dataServico
      });
      toast({
        title: "Erro na validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🚀 Iniciando criação do serviço...');
      console.log('📅 Data selecionada pelo usuário:', dataServico);
      console.log('📅 Data formatada para exibição (formatDateBR):', formatDateBR(dataServico));
      console.log('📅 Data formatada para exibição (safeDateBR):', safeDateBR(dataServico));
      
      // Debug detalhado da conversão de data
      debugDateConversion(dataServico, 'DATA DO SERVIÇO ANTES DE SALVAR');

      // Preparar dados do serviço usando a função SUPER SEGURA
      const serviceData = {
        professional_name: novoServico.nomeProfissional,
        client_name: novoServico.nomeCliente,
        service_name: novoServico.nomeServico,
        service_date: safeDateForDatabase(dataServico), // Função manual SEM conversão de timezone
        status: 'pending' as const
      };

      console.log('📊 Dados do serviço preparados:', serviceData);
      console.log('📅 Data que será salva no banco:', serviceData.service_date);

      // Preparar produtos utilizados
      const serviceProducts = novoServico.produtos.map(produto => ({
        product_id: produto.id,
        quantity_used: parseFloat(produto.quantidade.replace(/\./g, '') || '0')
      }));

      console.log('🛍️ Produtos do serviço:', serviceProducts);

      // Salvar no Supabase
      console.log('💾 Salvando no Supabase...');
      const { error } = await addService(serviceData, serviceProducts);

      if (error) {
        console.log('❌ Erro do Supabase:', error);
        throw error;
      }

      console.log('✅ Serviço salvo com sucesso!');

      // Reset form mantendo o nome do profissional
      setNovoServico({
        nomeProfissional: user?.name || "",
        nomeCliente: "",
        nomeServico: "",
        produtos: []
      });
      setDataServico(undefined);
      setModalAberto(false);

      toast({
        title: "Sucesso!",
        description: "Serviço criado com sucesso!"
      });

    } catch (error: unknown) {
      console.log('❌ Erro na criação do serviço:', error);
      toast({
        title: "Erro ao criar serviço",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  };
  const adicionarProduto = () => {
    setModalProdutosAberto(true);
  };
  const selecionarProduto = (produto: typeof produtosDisponiveis[0]) => {
    // Buscar o custo unitário do produto no Supabase
    const produtoSupabase = produtosSupabase.find(p => p.id === produto.id);
    const custoUnitario = produtoSupabase?.unit_cost || 0;

    setNovoServico(prev => ({
      ...prev,
      produtos: [...prev.produtos, {
        id: produto.id,
        nome: produto.nome,
        categoria: produto.categoria,
        imagem: produto.imagem,
        quantidade: "",
        custoUnitario: custoUnitario
      }]
    }));
    setModalProdutosAberto(false);
  };
  const formatarNumero = (valor: string) => {
    return formatNumberBR(valor);
  };
  const atualizarQuantidade = (index: number, quantidade: string) => {
    const quantidadeFormatada = formatarNumero(quantidade);
    setNovoServico(prev => ({
      ...prev,
      produtos: prev.produtos.map((produto, i) => i === index ? {
        ...produto,
        quantidade: quantidadeFormatada
      } : produto)
    }));
  };
  const removerProduto = (index: number) => {
    setNovoServico(prev => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index)
    }));
  };
  const toggleProdutosExpandidos = (servicoId: string) => {
    setProdutosExpandidos(prev => ({
      ...prev,
      [servicoId]: !prev[servicoId]
    }));
  };
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      entregue: {
        label: "Entregue",
        variant: "default" as const,
        icon: CheckCircle2
      },
      transito: {
        label: "Em Trânsito",
        variant: "secondary" as const,
        icon: Truck
      },
      preparando: {
        label: "Preparando",
        variant: "outline" as const,
        icon: Clock
      }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    return <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>;
  };
  const getPrioridadeBadge = (prioridade: string) => {
    return prioridade === "urgente" ? <Badge variant="destructive" className="text-xs">Urgente</Badge> : null;
  };
  const stats = {
    totalEnvios: services.length,
    pendentes: services.filter(s => s.status === "pending").length,
    aprovados: services.filter(s => s.status === "approved").length,
    recusados: services.filter(s => s.status === "rejected").length
  };
  return <div className="space-y-4 md:space-y-6 w-full min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight text-[#262626]">Gestão de Serviços</h1>
          <p className="text-sm md:text-base text-[#737373]">Crie e acompanhe seus envios de serviços</p>
        </div>
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#262626] text-[#f5f5f5] hover:bg-[#262626] shadow-soft hover:shadow-elegant transition-all duration-300 w-full md:w-auto"
              onClick={() => {
                if (isMobile) {
                  navigate('/profissional/criar-servico');
                } else {
                  setModalAberto(true);
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2 text-[#f5f5f5]" />
              {isMobile ? "Novo" : "Novo Serviço"}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-[95vw] md:w-[672px] h-[90vh] md:h-[635px] bg-beauty-neutral border border-[#d4d4d4] shadow-elegant rounded-md p-0">
            <ScrollArea className="h-full px-4 md:px-6">
              <DialogHeader className="pt-4 md:pt-6 pb-4">
                <DialogTitle className="flex items-center gap-2 text-[#262626] text-lg md:text-xl">
                  Novo Envio de Serviço
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmitServico} className="space-y-4 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeProfissional" className="text-[#262626]">Nome da Profissional</Label>
                  <Input id="nomeProfissional" value={novoServico.nomeProfissional} onChange={e => setNovoServico(prev => ({
                    ...prev,
                    nomeProfissional: e.target.value
                  }))} className="bg-beauty-secondary border-[#d4d4d4] text-beauty-primary-light h-10 rounded-md focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none" readOnly autoFocus={false} onFocus={e => {
                    e.target.blur();
                    if (window.getSelection) {
                      window.getSelection()?.removeAllRanges();
                    }
                  }} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomeCliente" className="text-[#262626]">Nome da Cliente</Label>
                  <Input id="nomeCliente" placeholder="Nome da cliente" value={novoServico.nomeCliente} onChange={e => setNovoServico(prev => ({
                    ...prev,
                    nomeCliente: e.target.value
                  }))} className="border-[#d4d4d4] bg-beauty-secondary text-beauty-primary-light placeholder:text-[#737373] h-10 rounded-md focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-[#d4d4d4]" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeServico" className="text-[#262626]">Nome do Serviço</Label>
                  <Input id="nomeServico" placeholder="Ex: Escova Modelada..." value={novoServico.nomeServico} onChange={e => setNovoServico(prev => ({
                    ...prev,
                    nomeServico: e.target.value
                  }))} className="border-[#d4d4d4] bg-beauty-secondary text-beauty-primary-light placeholder:text-[#737373] h-10 rounded-md focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-[#d4d4d4]" required />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[#262626]">Data do Serviço</Label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10 border-[#d4d4d4] bg-beauty-secondary text-beauty-primary-light", !dataServico && "text-[#737373]")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataServico ? formatDateBR(dataServico) : <span>Selecione a data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent mode="single" selected={dataServico} onSelect={date => {
                        setDataServico(date);
                        setCalendarOpen(false);
                      }} locale={getDateFnsLocale()} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#262626]">Adicionar Produtos</Label>
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={comboboxOpen} className="w-full justify-between h-10 border-[#d4d4d4] bg-beauty-secondary text-beauty-primary-light hover:bg-beauty-secondary">
                      <span className="text-[#737373]">Selecionar produto...</span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-beauty-neutral border border-[#d4d4d4] shadow-elegant" align="start">
                    <Command className="bg-beauty-neutral">
                      <CommandInput placeholder="Digite para buscar..." className="h-9 border-none bg-beauty-neutral text-beauty-primary-light placeholder:text-[#737373]" />
                      <CommandList className="bg-beauty-neutral">
                        <CommandEmpty className="py-6 text-center text-sm text-[#737373]">
                          Nenhum produto encontrado.
                        </CommandEmpty>
                        <CommandGroup className="bg-beauty-neutral">
                          {produtosDisponiveis.map(produto => <CommandItem key={produto.id} value={produto.nome} onSelect={() => {
                            selecionarProduto(produto);
                            setComboboxOpen(false);
                          }} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-beauty-secondary data-[selected]:bg-beauty-secondary text-beauty-primary-light">
                              <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-background">
                                <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-beauty-primary truncate">
                                  {produto.nome}
                                </div>
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {produto.categoria}
                                </Badge>
                              </div>
                              <Plus className="h-4 w-4 text-[#737373]" />
                            </CommandItem>)}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[#262626]">Produtos Utilizados</Label>
                  
                </div>
                
                <div className={`border border-[#d4d4d4] rounded-md p-4 min-h-[180px] bg-beauty-secondary shadow-soft flex flex-col items-center text-center ${novoServico.produtos.length === 0 ? 'justify-center' : 'justify-start'}`}>
                  {novoServico.produtos.length === 0 ? <div>
                      <p className="font-medium text-sm text-[#262626]">Nenhum produto adicionado ainda</p>
                      <p className="text-xs mt-1 text-[#737373]">
                        Use o campo acima para adicionar produtos
                      </p>
                    </div> : <div className="space-y-3 w-full">
                        {novoServico.produtos.map((produto, index) => <div key={index} className="w-full bg-beauty-neutral py-2 px-2 rounded-md border border-neutral-300 shadow-soft hover:shadow-elegant transition-all duration-200 mt-0">
                            <div className="flex gap-3 w-full items-start">
                              <img src={produto.imagem} alt={produto.nome} className="w-[110px] h-[110px] object-cover rounded-lg flex-shrink-0 self-center" />
                              <div className="flex-1 relative pr-8 text-left">
                                <div className="mb-4 text-left">
                                  <h3 className="font-medium text-base leading-tight mb-2 text-beauty-primary text-left">
                                    {produto.nome} 
                                  </h3>
                                </div>
                                
                                <div className="text-left">
                                  <div className="flex items-center gap-2">
                                    
                                    <Input placeholder="digite a quantidade utilizada" value={produto.quantidade} onChange={e => atualizarQuantidade(index, e.target.value)} className="text-sm border-[#d4d4d4] bg-beauty-secondary text-beauty-primary-light placeholder:text-beauty-accent focus:border-beauty-primary h-10 rounded-md text-left w-52" />
                                    
                                  </div>
                                </div>
                                
                                <Button type="button" variant="ghost" size="sm" onClick={() => removerProduto(index)} className="absolute -top-2 -right-2 h-10 w-10 p-0 text-beauty-accent hover:text-destructive text-2xl">
                                  ×
                                </Button>
                              </div>
                            </div>
                         </div>)}
                      </div>}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-[#262626] text-[#ffffff] hover:bg-[#262626] shadow-soft hover:shadow-elegant transition-all duration-300 h-10 rounded-md"
                  onClick={(e) => {
                    console.log('🖱️ Botão SALVAR clicado');
                    handleSubmitServico(e);
                  }}
                >
                  SALVAR
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 border-[#262626] text-[#262626] hover:bg-beauty-secondary h-10 rounded-md" 
                  onClick={() => {
                    console.log('🖱️ Botão CANCELAR clicado');
                    setModalAberto(false);
                  }}
                >
                  CANCELAR
                </Button>
              </div>
            </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Modal de Seleção de Produtos */}
        <Dialog open={modalProdutosAberto} onOpenChange={setModalProdutosAberto}>
          <DialogPrimitive.Portal>
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[95vw] md:w-[672px] h-[90vh] md:h-[635px] translate-x-[-50%] translate-y-[-50%] bg-beauty-neutral border border-[#d4d4d4] shadow-elegant rounded-md p-4 md:p-6 gap-4 grid duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]" aria-describedby="modal-produtos-description">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-beauty-primary">
                  Selecionar Produtos
                </DialogTitle>
                <Button variant="ghost" size="sm" onClick={() => setModalProdutosAberto(false)} className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p id="modal-produtos-description" className="text-sm text-beauty-accent">
                Escolha os produtos que foram utilizados no serviço
              </p>
            </DialogHeader>
            
            <div className="mt-4 px-1">
              <div className="border border-[#d4d4d4] rounded-md p-4 min-h-[500px] bg-beauty-secondary shadow-soft">
                {produtosDisponiveis.length === 0 ? <div className="text-center py-8">
                    <p className="text-beauty-primary text-sm">Nenhum produto cadastrado</p>
                    <p className="text-beauty-accent text-xs mt-1">
                      Adicione produtos na área administrativa para poder selecioná-los aqui.
                    </p>
                  </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {produtosDisponiveis.map(produto => <div key={produto.id} className="border border-border rounded-lg p-4 cursor-pointer hover:bg-accent hover:shadow-soft transition-all duration-200 bg-card" onClick={() => selecionarProduto(produto)}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-background">
                            <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-xs md:text-sm leading-tight mb-1 text-foreground truncate">
                              {produto.nome}
                            </h3>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded-sm">
                              {produto.categoria}
                            </Badge>
                          </div>
                        </div>
                      </div>)}
                  </div>}
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
        </Dialog>
      </div>

      <Card className="shadow-soft border-[#d4d4d4] bg-beauty-neutral">
        <CardContent className="p-4 md:p-6">
          {loadingServices ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beauty-primary"></div>
            </div>
          ) : services.length === 0 ? <div className="flex flex-col items-center justify-center text-center py-8 min-h-[150px]">
              <p className="text-[#262626] text-lg">
                Nenhum histórico de serviço encontrado
              </p>
              <p className="text-[#737373] mt-2 text-sm">
                Clique em "Novo Serviço" para enviar um novo serviço
              </p>
            </div> : <div className="space-y-4">
              <h2 className="text-lg md:text-xl font-semibold text-beauty-primary mb-4">Histórico de Serviços</h2>
              <div className="space-y-4">
                {services.map(servico => <Card key={servico.id} className="border border-neutral-300 bg-beauty-secondary shadow-soft hover:shadow-elegant transition-all duration-200">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 md:gap-0 mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-beauty-primary text-sm md:text-base">{servico.service_name}</h3>
                          <p className="text-beauty-accent text-xs md:text-sm">Cliente: {servico.client_name}</p>
                          <p className="text-beauty-accent text-xs md:text-sm">Profissional: {servico.professional_name}</p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-beauty-accent text-xs md:text-sm">Data: {formatDatabaseDateToBR(servico.service_date)}</p>
                        </div>
                      </div>
                      
                      {servico.service_products && servico.service_products.length > 0 && <Collapsible open={produtosExpandidos[servico.id]} onOpenChange={() => toggleProdutosExpandidos(servico.id)} className="mt-3">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto text-sm font-medium text-beauty-primary hover:bg-transparent">
                              Produtos utilizados ({servico.service_products.length})
                              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${produtosExpandidos[servico.id] ? 'rotate-180' : ''}`} />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
                            <div className="grid grid-cols-1 gap-2 mt-2">
                              {servico.service_products.map((serviceProduto, index) => <div key={index} className="flex items-center gap-2 md:gap-3 p-2 bg-beauty-neutral rounded-md border border-neutral-300 animate-fade-in">
                                  <img src={serviceProduto.product?.image_url || "/lovable-uploads/a9458181-099d-4115-8ba3-da6d9344619c.png"} alt={serviceProduto.product?.name} className="w-8 h-8 md:w-10 md:h-10 object-cover rounded flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs md:text-sm text-beauty-primary font-medium truncate">{serviceProduto.product?.name}</p>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                       <Badge variant="secondary" className="text-[10px] md:text-xs bg-[#262626] text-white">
                                         {serviceProduto.product?.category?.name || 'Sem categoria'}
                                       </Badge>
                                      <span className="text-[10px] md:text-xs text-beauty-accent">Qtd: {serviceProduto.quantity_used}g</span>
                                    </div>
                                  </div>
                                </div>)}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>}
                    </CardContent>
                  </Card>)}
              </div>
            </div>}
        </CardContent>
      </Card>

    </div>;
}
