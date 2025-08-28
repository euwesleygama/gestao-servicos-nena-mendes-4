import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar as CalendarIcon,
  TrendingUp,
  Package,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateBR, formatCurrencyBR, formatDatabaseDateToBR } from "@/lib/date-utils";

// Dados serão carregados do localStorage

const statusConfig = {
  entregue: { 
    label: "Entregue", 
    variant: "default" as const, 
    icon: CheckCircle, 
    color: "text-green-600" 
  },
  transito: { 
    label: "Em Trânsito", 
    variant: "secondary" as const, 
    icon: Package, 
    color: "text-blue-600" 
  },
  processando: { 
    label: "Processando", 
    variant: "outline" as const, 
    icon: Clock, 
    color: "text-yellow-600" 
  },
  cancelado: { 
    label: "Cancelado", 
    variant: "destructive" as const, 
    icon: XCircle, 
    color: "text-red-600" 
  }
};

export default function HistoricoDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [historico, setHistorico] = useState<any[]>([]);

  // Carregar histórico do localStorage
  useEffect(() => {
    const historicoSalvo = localStorage.getItem('historicoEnvios');
    if (historicoSalvo) {
      try {
        const data = JSON.parse(historicoSalvo);
        setHistorico(data);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        setHistorico([]);
      }
    } else {
      setHistorico([]);
    }
  }, []);

  const filteredHistorico = historico.filter(item => {
    const matchesSearch = item.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tracking?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "todos" || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: historico.length,
    entregues: historico.filter(item => item.status === "entregue").length,
    emTransito: historico.filter(item => item.status === "transito").length,
    valorTotal: historico.reduce((sum, item) => sum + (item.valor || 0), 0)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-beauty-primary">Histórico de Envios</h1>
          <p className="text-beauty-accent">Acompanhe todos os seus envios e entregas</p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-beauty-accent">Total de Envios</CardTitle>
            <Package className="h-4 w-4 text-beauty-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beauty-primary">{stats.total}</div>
            <p className="text-xs text-beauty-accent">+2 desde ontem</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-beauty-accent">Entregues</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beauty-primary">{stats.entregues}</div>
            <p className="text-xs text-beauty-accent">Taxa de {((stats.entregues / stats.total) * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-beauty-accent">Em Trânsito</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beauty-primary">{stats.emTransito}</div>
            <p className="text-xs text-beauty-accent">Sendo processados</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-beauty-accent">Valor Total</CardTitle>
            <Package className="h-4 w-4 text-beauty-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beauty-primary">
              {formatCurrencyBR(stats.valorTotal)}
            </div>
            <p className="text-xs text-beauty-accent">Receita total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beauty-primary">
            <Clock className="h-5 w-5" />
            Histórico Detalhado
          </CardTitle>
          
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-beauty-accent" />
              <Input
                placeholder="Buscar por cliente, ID ou código de rastreamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
                <SelectItem value="transito">Em Trânsito</SelectItem>
                <SelectItem value="processando">Processando</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Envio</TableHead>
                  <TableHead>Data Entrega</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistorico.length > 0 ? filteredHistorico.map((item) => {
                  const statusInfo = statusConfig[item.status as keyof typeof statusConfig];
                  if (!statusInfo) return null;
                  
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.cliente}</TableCell>
                      <TableCell className="text-beauty-accent">{item.destino}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={statusInfo.variant}
                          className="gap-1"
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.dataEnvio ? formatDatabaseDateToBR(item.dataEnvio) : "-"}
                      </TableCell>
                      <TableCell>
                        {item.dataEntrega ? formatDatabaseDateToBR(item.dataEntrega) : "-"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrencyBR(item.valor || 0)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-beauty-accent">Nenhum histórico disponível</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {filteredHistorico.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-beauty-accent mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-beauty-primary mb-2">
                Nenhum envio encontrado
              </h3>
              <p className="text-beauty-accent">
                Tente ajustar os filtros ou fazer uma nova busca.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}