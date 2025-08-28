import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, CheckCircle2, Clock, ChevronDown, X, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useServices } from "@/hooks/use-supabase";
import { formatDateBR, formatCurrencyBR, formatDatabaseDateToBR } from "@/lib/date-utils";

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
    const matchesStatus = filtroStatus === "todos" || servico.status === filtroStatus;
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
        label: "Rejeitado",
        variant: "destructive" as const,
        icon: X,
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
        title: "Status atualizado!",
        description: `Serviço ${novoStatus === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso.`
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

  const stats = {
    total: services.length,
    pendentes: services.filter(s => s.status === 'pending').length,
    aprovados: services.filter(s => s.status === 'approved').length,
    rejeitados: services.filter(s => s.status === 'rejected').length
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Serviços Recebidos</h1>
          <p className="text-muted-foreground">Gerencie os serviços enviados pelos profissionais</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Aprovados</p>
                <p className="text-2xl font-bold text-green-600">{stats.aprovados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Rejeitados</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejeitados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por serviço, cliente ou profissional..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="approved">Aprovados</SelectItem>
                <SelectItem value="rejected">Rejeitados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Serviços ({servicosFiltrados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {servicosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                {busca || filtroStatus !== "todos" 
                  ? "Nenhum serviço encontrado com os filtros aplicados." 
                  : "Nenhum serviço recebido ainda."}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {servicosFiltrados.map((servico) => (
                <Card key={servico.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{servico.service_name}</h3>
                          {getStatusBadge(servico.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Cliente: {servico.client_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Profissional: {servico.professional_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Data: {formatDatabaseDateToBR(servico.service_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Criado: {formatDatabaseDateToBR(servico.created_at)}</span>
                          </div>
                        </div>

                        {/* Produtos utilizados */}
                        {servico.service_products && servico.service_products.length > 0 && (
                          <Collapsible 
                            open={produtosExpandidos[servico.id]} 
                            onOpenChange={() => toggleProdutosExpandidos(servico.id)}
                            className="mt-4"
                          >
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto text-sm">
                                Produtos utilizados ({servico.service_products.length})
                                <ChevronDown className={`h-4 w-4 transition-transform ${produtosExpandidos[servico.id] ? 'rotate-180' : ''}`} />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2">
                              <div className="grid grid-cols-1 gap-2">
                                {servico.service_products.map((serviceProduto, index) => (
                                  <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-md">
                                    <img 
                                      src={serviceProduto.product?.image_url || "/lovable-uploads/a9458181-099d-4115-8ba3-da6d9344619c.png"} 
                                      alt={serviceProduto.product?.name} 
                                      className="w-10 h-10 object-cover rounded" 
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium">{serviceProduto.product?.name}</p>
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>Categoria: {serviceProduto.product?.category?.name}</span>
                                        <span>Quantidade: {serviceProduto.quantity_used}g</span>
                                        <span>Custo: {formatCurrencyBR((serviceProduto.quantity_used || 0) * (serviceProduto.product?.unit_cost || 0))}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                <div className="mt-2 p-2 bg-blue-50 rounded-md">
                                  <p className="font-semibold text-blue-800">
                                    Valor Total: {formatCurrencyBR(calcularValorTotal(servico.service_products))}
                                  </p>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>

                      {/* Actions */}
                      {servico.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusChange(servico.id, 'approved')}
                          >
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(servico.id, 'rejected')}
                          >
                            Rejeitar
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
