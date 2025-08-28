import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Filter, Eye, CheckCircle2, Clock, ChevronDown, Package, X, User, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useServices } from "@/hooks/use-supabase";
type ServicoRecebido = {
  id: string;
  nomeProfissional: string;
  nomeCliente: string;
  nomeServico: string;
  produtos: Array<{
    id: string;
    nome: string;
    categoria: string;
    imagem: string;
    quantidade: string;
    custoUnitario: number; // Custo por unidade em reais
  }>;
  dataCriacao: string;
  status: string;
};
export default function RecebidosDashboard() {
  const [servicosRecebidos, setServicosRecebidos] = useState<ServicoRecebido[]>([]);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [busca, setBusca] = useState("");
  const [produtosExpandidos, setProdutosExpandidos] = useState<Record<string, boolean>>({});
  const {
    toast
  } = useToast();

  // Carregar dados do localStorage
  useEffect(() => {
    const loadServicos = () => {
      const servicosExistentes = localStorage.getItem('servicosRecebidos');
      if (servicosExistentes) {
        try {
          const servicos = JSON.parse(servicosExistentes);
          setServicosRecebidos(servicos);
        } catch (error) {
          console.error('Erro ao carregar serviços:', error);
          setServicosRecebidos([]);
        }
      } else {
        setServicosRecebidos([]);
      }
    };
    loadServicos();
  }, []);
  const calcularValorTotal = (produtos: ServicoRecebido['produtos']) => {
    return produtos.reduce((total, produto) => {
      // Extrair apenas os números da quantidade e tratar ponto como separador de milhares
      let quantidadeStr = produto.quantidade.replace(/[^\d.,]/g, '');
      // Se tem ponto seguido de exatamente 3 dígitos, é separador de milhares
      if (quantidadeStr.includes('.') && quantidadeStr.split('.')[1]?.length === 3) {
        quantidadeStr = quantidadeStr.replace('.', '');
      }
      const quantidadeNum = parseFloat(quantidadeStr.replace(',', '.')) || 0;
      
      // Se custoUnitario não estiver disponível, buscar nos produtos admin
      let custoUnitario = produto.custoUnitario;
      if (!custoUnitario || custoUnitario === 0) {
        const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
        const adminProduct = adminProducts.find((p: any) => p.id === produto.id);
        custoUnitario = adminProduct?.unitCost || 0;
      }
      
      return total + quantidadeNum * custoUnitario;
    }, 0);
  };
  const toggleProdutosExpandidos = (servicoId: string) => {
    setProdutosExpandidos(prev => ({
      ...prev,
      [servicoId]: !prev[servicoId]
    }));
  };
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: {
        label: "Pendente",
        variant: "secondary" as const,
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200"
      },
      aprovado: {
        label: "Aprovado",
        variant: "default" as const,
        icon: CheckCircle2,
        className: "bg-green-100 text-green-800 border-green-200"
      },
      recusado: {
        label: "Recusado",
        variant: "destructive" as const,
        icon: Clock,
        className: "bg-red-100 text-red-800 border-red-200"
      }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    const Icon = config.icon;
    return <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>;
  };
  const servicosFiltrados = servicosRecebidos.filter(servico => {
    const matchStatus = filtroStatus === "todos" || servico.status === filtroStatus;
    const matchBusca = servico.nomeCliente.toLowerCase().includes(busca.toLowerCase()) || servico.nomeServico.toLowerCase().includes(busca.toLowerCase()) || servico.nomeProfissional.toLowerCase().includes(busca.toLowerCase()) || servico.id.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });
  const stats = {
    total: servicosRecebidos.length,
    pendentes: servicosRecebidos.filter(s => s.status === 'pendente').length,
    aprovados: servicosRecebidos.filter(s => s.status === 'aprovado').length
  };
  return <div className="space-y-6 w-full min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-beauty-primary">Serviços Recebidos</h1>
          <p className="text-beauty-accent">Gerencie os serviços enviados pelos profissionais</p>
        </div>
      </div>

      {/* Stats Cards */}

      {/* Filters */}
      <Card className="shadow-soft border-neutral-300 bg-beauty-neutral">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="busca" className="text-beauty-primary">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-beauty-accent h-4 w-4" />
                <Input id="busca" placeholder="Buscar por cliente, serviço, profissional ou ID..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-10 border-neutral-300 bg-beauty-secondary text-beauty-primary-light placeholder:text-beauty-accent focus:border-beauty-primary" />
              </div>
            </div>
            
            <div className="w-full sm:w-48">
              <Label htmlFor="status" className="text-beauty-primary">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="border-neutral-300 bg-beauty-secondary text-beauty-primary-light focus:border-beauty-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="recusado">Recusado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <Card className="shadow-soft border-neutral-300 bg-beauty-neutral">
        <CardContent className="p-6">
          {servicosFiltrados.length === 0 ? <div className="flex flex-col items-center justify-center text-center py-8 min-h-[200px]">
              
              <p className="text-beauty-primary text-lg">
                {servicosRecebidos.length === 0 ? "Nenhum serviço recebido ainda" : "Nenhum serviço encontrado com os filtros aplicados"}
              </p>
              <p className="text-beauty-accent mt-2 text-sm">
                {servicosRecebidos.length === 0 ? "Os serviços enviados pelos profissionais aparecerão aqui" : "Tente ajustar os filtros para ver mais resultados"}
              </p>
            </div> : <div className="space-y-4">
              
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                 {servicosFiltrados.map(servico => <Card key={servico.id} className="border border-neutral-300 bg-beauty-secondary shadow-soft hover:shadow-elegant transition-all duration-200">
                    <CardContent className="p-6">
                      {/* Header com título e status */}
                      <CardHeader className="p-0 pb-4">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg font-semibold text-beauty-primary">
                            {servico.nomeServico}
                          </CardTitle>
                          {getStatusBadge(servico.status)}
                        </div>
                      </CardHeader>

                      <div className="space-y-4">
                        {/* Informações principais: profissional, cliente e data */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex items-center gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-muted-foreground">Profissional</p>
                              <p className="font-medium text-foreground truncate">{servico.nomeProfissional}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-muted-foreground">Cliente</p>
                              <p className="font-medium text-foreground truncate">{servico.nomeCliente}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-muted-foreground">Data</p>
                              <p className="font-medium text-foreground">{servico.dataCriacao}</p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Valor total */}
                        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                          
                          <div>
                            <p className="text-xs text-muted-foreground">Valor Total</p>
                            <p className="text-xl font-bold text-foreground">
                              R$ {calcularValorTotal(servico.produtos).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Botões de ação - apenas para status pendente */}
                        {servico.status === 'pendente' && <>
                            <Separator />
                            <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
                              <Button onClick={() => {
                        const servicosAtualizados = servicosRecebidos.map(s => s.id === servico.id ? {
                          ...s,
                          status: 'recusado'
                        } : s);
                        setServicosRecebidos(servicosAtualizados);
                        localStorage.setItem('servicosRecebidos', JSON.stringify(servicosAtualizados));
                        toast({
                          title: "Serviço recusado",
                          description: `O serviço ${servico.nomeServico} foi recusado.`
                        });
                      }} variant="destructive" className="w-full" size="lg">
                                <X className="h-4 w-4 mr-2" />
                                Recusar
                              </Button>
                              <Button onClick={() => {
                        const servicosAtualizados = servicosRecebidos.map(s => s.id === servico.id ? {
                          ...s,
                          status: 'aprovado'
                        } : s);
                        setServicosRecebidos(servicosAtualizados);
                        localStorage.setItem('servicosRecebidos', JSON.stringify(servicosAtualizados));
                        toast({
                          title: "Serviço aprovado",
                          description: `O serviço ${servico.nomeServico} foi aprovado com sucesso.`
                        });
                      }} variant="default" className="w-full bg-green-600 hover:bg-green-700" size="lg">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Aprovar
                              </Button>
                            </div>
                          </>}
                      </div>

                      {servico.produtos.length > 0 && <Collapsible open={produtosExpandidos[servico.id]} onOpenChange={() => toggleProdutosExpandidos(servico.id)} className="mt-4">
                          <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full justify-between border-neutral-300 text-beauty-primary hover:bg-beauty-secondary bg-beauty-neutral">
                              <span>Produtos Utilizados ({servico.produtos.length})</span>
                              <ChevronDown className={`h-4 w-4 transition-transform ${produtosExpandidos[servico.id] ? 'rotate-180' : ''}`} />
                            </Button>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent className="mt-3">
                            <div className="space-y-3 bg-beauty-neutral p-4 rounded-lg border border-neutral-300">
                              {servico.produtos.map((produto, index) => <div key={index} className="flex items-start gap-3 p-3 bg-beauty-secondary rounded border border-neutral-300">
                                  <img src={produto.imagem} alt={produto.nome} className="w-12 h-12 object-cover rounded" />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-xs leading-tight mb-1 text-beauty-primary">
                                      {produto.nome}
                                    </h4>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge variant={produto.categoria === "Condicionador" ? "default" : "secondary"} className="text-xs">
                                        {produto.categoria}
                                      </Badge>
                                      {produto.quantidade && <span className="text-xs text-beauty-accent">
                                          Qtd: {produto.quantidade}
                                        </span>}
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