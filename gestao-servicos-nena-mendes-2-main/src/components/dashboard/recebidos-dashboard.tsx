import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, CheckCircle2, Clock, ChevronDown, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useServices } from "@/hooks/use-supabase";
import { formatDateBR, formatDatabaseDateToBR } from "@/lib/date-utils";

export default function RecebidosDashboard() {
  // Usar hook do Supabase para serviços
  const { services, updateServiceStatus, loading } = useServices();
  
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [busca, setBusca] = useState("");
  const [produtosExpandidos, setProdutosExpandidos] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Filtrar serviços
  const servicosFiltrados = services.filter(servico => {
    const matchesSearch = servico.service_name.toLowerCase().includes(busca.toLowerCase()) ||
                         servico.client_name.toLowerCase().includes(busca.toLowerCase()) ||
                         servico.professional_name.toLowerCase().includes(busca.toLowerCase());
    const matchesStatus = filtroStatus === "todos" || 
                         (filtroStatus === "pendente" && servico.status === "pending") ||
                         (filtroStatus === "aprovado" && servico.status === "approved") ||
                         (filtroStatus === "recusado" && servico.status === "rejected");
    return matchesSearch && matchesStatus;
  });

  const toggleProdutosExpandidos = (servicoId: string) => {
    setProdutosExpandidos(prev => ({
      ...prev,
      [servicoId]: !prev[servicoId]
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: "Pendente",
        variant: "secondary" as const,
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200"
      },
      approved: {
        label: "Aprovado",
        variant: "default" as const,
        icon: CheckCircle2,
        className: "bg-green-100 text-green-800 border-green-200"
      },
      rejected: {
        label: "Recusado",
        variant: "destructive" as const,
        icon: Clock,
        className: "bg-red-100 text-red-800 border-red-200"
      }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleStatusChange = async (servicoId: string, novoStatus: 'pending' | 'approved' | 'rejected') => {
    const { error } = await updateServiceStatus(servicoId, novoStatus);
    if (!error) {
      toast({
        title: novoStatus === 'approved' ? "Serviço aprovado" : "Serviço recusado",
        description: `O serviço foi ${novoStatus === 'approved' ? 'aprovado' : 'recusado'} com sucesso.`
      });
    }
  };

  const calcularValorTotal = (serviceProducts: any[]) => {
    return serviceProducts?.reduce((total, serviceProduto) => {
      const quantidade = serviceProduto.quantity_used || 0;
      const custoUnitario = serviceProduto.product?.unit_cost || 0;
      return total + (quantidade * custoUnitario);
    }, 0) || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-beauty-primary mx-auto mb-4"></div>
          <p className="text-beauty-primary">Carregando serviços...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-beauty-primary">Serviços Recebidos</h1>
          <p className="text-beauty-accent">Gerencie os serviços enviados pelos profissionais</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-soft border-neutral-300 bg-beauty-neutral">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="busca" className="text-beauty-primary">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-beauty-accent h-4 w-4" />
                <Input 
                  id="busca" 
                  placeholder="Buscar por cliente, serviço, profissional ou ID..." 
                  value={busca} 
                  onChange={e => setBusca(e.target.value)} 
                  className="pl-10 border-neutral-300 bg-beauty-secondary text-beauty-primary-light placeholder:text-beauty-accent focus:border-beauty-primary" 
                />
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
          {servicosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-8 min-h-[200px]">
              <p className="text-beauty-primary text-lg">
                {services.length === 0 ? "Nenhum serviço recebido ainda" : "Nenhum serviço encontrado com os filtros aplicados"}
              </p>
              <p className="text-beauty-accent mt-2 text-sm">
                {services.length === 0 ? "Os serviços enviados pelos profissionais aparecerão aqui" : "Tente ajustar os filtros para ver mais resultados"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {servicosFiltrados.map(servico => (
                  <Card key={servico.id} className="border border-neutral-300 bg-beauty-secondary shadow-soft hover:shadow-elegant transition-all duration-200">
                    <CardContent className="p-6">
                      {/* Header com título e status */}
                      <CardHeader className="p-0 pb-4">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg font-semibold text-beauty-primary">
                            {servico.service_name}
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
                              <p className="font-medium text-foreground truncate">{servico.professional_name}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-muted-foreground">Cliente</p>
                              <p className="font-medium text-foreground truncate">{servico.client_name}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-muted-foreground">Data</p>
                              <p className="font-medium text-foreground">{formatDatabaseDateToBR(servico.service_date)}</p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Valor total */}
                        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                          <div>
                            <p className="text-xs text-muted-foreground">Valor Total</p>
                            <p className="text-xl font-bold text-foreground">
                              R$ {calcularValorTotal(servico.service_products || []).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Botões de ação - apenas para status pendente */}
                        {servico.status === 'pending' && (
                          <>
                            <Separator />
                            <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
                              <Button 
                                onClick={() => handleStatusChange(servico.id, 'rejected')} 
                                variant="destructive" 
                                className="w-full" 
                                size="lg"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Recusar
                              </Button>
                              <Button 
                                onClick={() => handleStatusChange(servico.id, 'approved')} 
                                variant="default" 
                                className="w-full bg-green-600 hover:bg-green-700" 
                                size="lg"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Aprovar
                              </Button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Produtos utilizados */}
                      {servico.service_products && servico.service_products.length > 0 && (
                        <Collapsible 
                          open={produtosExpandidos[servico.id]} 
                          onOpenChange={() => toggleProdutosExpandidos(servico.id)} 
                          className="mt-4"
                        >
                          <CollapsibleTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="w-full justify-between border-neutral-300 text-beauty-primary hover:bg-beauty-secondary bg-beauty-neutral"
                            >
                              <span>Produtos Utilizados ({servico.service_products.length})</span>
                              <ChevronDown className={`h-4 w-4 transition-transform ${produtosExpandidos[servico.id] ? 'rotate-180' : ''}`} />
                            </Button>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent className="mt-3">
                            <div className="space-y-3 bg-beauty-neutral p-4 rounded-lg border border-neutral-300">
                              {servico.service_products.map((serviceProduto, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-beauty-secondary rounded border border-neutral-300">
                                  <img 
                                    src={serviceProduto.product?.image_url || "/lovable-uploads/a9458181-099d-4115-8ba3-da6d9344619c.png"} 
                                    alt={serviceProduto.product?.name} 
                                    className="w-12 h-12 object-cover rounded" 
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-xs leading-tight mb-1 text-beauty-primary">
                                      {serviceProduto.product?.name}
                                    </h4>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge 
                                        variant={serviceProduto.product?.category?.name === "Condicionador" ? "default" : "secondary"} 
                                        className="text-xs"
                                      >
                                        {serviceProduto.product?.category?.name}
                                      </Badge>
                                      <span className="text-xs text-beauty-accent">
                                        Qtd: {serviceProduto.quantity_used}g
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
