import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChevronDown, CalendarIcon, ArrowLeft, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { formatDateBR, formatNumberBR, getBrasiliaDate, getDateFnsLocale, createIdWithBrasiliaTimestamp } from "@/lib/date-utils";
import { useServices } from "@/hooks/use-supabase";

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

export default function CriarServicoMobile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { addService, loading: loadingService } = useServices();
  
  console.log('🔄 CriarServicoMobile renderizado, pathname:', location.pathname);
  
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect para carregar dados salvos - EXECUTA SEMPRE que o componente monta
  useEffect(() => {
    console.log('🚀 Iniciando carregamento de dados...');
    
    // 1. Primeiro verifica se há dados temporários (volta da seleção)
    const dadosTemp = sessionStorage.getItem('formularioServicoTemp');
    console.log('📋 Dados temporários encontrados:', !!dadosTemp);
    
    if (dadosTemp) {
      try {
        const dados = JSON.parse(dadosTemp);
        console.log('🔄 RESTAURANDO de sessionStorage:', {
          cliente: dados.nomeCliente,
          servico: dados.nomeServico,
          produtos: dados.produtos?.length || 0
        });
        
        setNovoServico({
          nomeProfissional: "Profissional",
          nomeCliente: dados.nomeCliente || "",
          nomeServico: dados.nomeServico || "",
          produtos: dados.produtos || []
        });
        
        if (dados.dataServico) {
          setDataServico(new Date(dados.dataServico));
        }
        
        console.log('✅ Dados restaurados do sessionStorage!');
      } catch (error) {
        console.error('❌ Erro ao restaurar dados temporários:', error);
      }
    }
    
    // 2. Verifica produtos recém-selecionados
    const produtosNovos = sessionStorage.getItem('produtosSelecionadosTemp');
    console.log('🛍️ Produtos novos encontrados:', !!produtosNovos);
    
    if (produtosNovos) {
      try {
        const produtos = JSON.parse(produtosNovos);
        console.log('➕ Adicionando produtos recém-selecionados:', produtos.length);
        
        const produtosComQuantidade = produtos.map((produto: any) => ({
          ...produto,
          quantidade: ""
        }));
        
        setNovoServico(prev => {
          const novosProducts = [...prev.produtos, ...produtosComQuantidade];
          console.log('📦 Total de produtos após merge:', novosProducts.length);
          return {
            ...prev,
            produtos: novosProducts
          };
        });
        
        // Remove os produtos processados
        sessionStorage.removeItem('produtosSelecionadosTemp');
        console.log('🗑️ produtosSelecionadosTemp removido');
        
      } catch (error) {
        console.error('❌ Erro ao processar produtos novos:', error);
      }
    }
    
    // 3. Se não há dados salvos, define data padrão
    if (!dadosTemp) {
      console.log('📅 Definindo data padrão');
      setDataServico(getBrasiliaDate());
    }
    
    console.log('🏁 Carregamento concluído');
  }, []); // Executa apenas na montagem do componente

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
      console.log('🔧 [Mobile] Iniciando criação de serviço...');
      
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

      console.log('📝 [Mobile] Dados do serviço:', servicoData);
      console.log('🛍️ [Mobile] Produtos utilizados:', produtosUtilizados);

      // Chamar o hook do Supabase
      const { data, error } = await addService(servicoData, produtosUtilizados);

      if (error) {
        throw error;
      }

      console.log('✅ [Mobile] Serviço criado com sucesso no Supabase:', data);
      
      // Também salvar no localStorage como backup
      const novoServicoSalvo = {
        id: data?.id || createIdWithBrasiliaTimestamp('SRV'),
        ...novoServico,
        dataCriacao: dataServico ? formatDateBR(dataServico) : formatDateBR(getBrasiliaDate()),
        status: 'pendente'
      };

      const servicosRecebidos = JSON.parse(localStorage.getItem('servicosRecebidos') || '[]');
      servicosRecebidos.unshift(novoServicoSalvo);
      localStorage.setItem('servicosRecebidos', JSON.stringify(servicosRecebidos));
      
      // Limpar dados temporários do sessionStorage
      sessionStorage.removeItem('formularioServicoTemp');
      sessionStorage.removeItem('produtosSelecionadosTemp');

      // Voltar para a página anterior
      navigate(-1);

    } catch (error) {
      console.error('❌ [Mobile] Erro ao criar serviço:', error);
      
      // Em caso de erro, salvar apenas no localStorage como fallback
      const novoServicoSalvo = {
        id: createIdWithBrasiliaTimestamp('SRV'),
        ...novoServico,
        dataCriacao: dataServico ? formatDateBR(dataServico) : formatDateBR(getBrasiliaDate()),
        status: 'pendente'
      };

      const servicosRecebidos = JSON.parse(localStorage.getItem('servicosRecebidos') || '[]');
      servicosRecebidos.unshift(novoServicoSalvo);
      localStorage.setItem('servicosRecebidos', JSON.stringify(servicosRecebidos));
      
      // Limpar dados temporários do sessionStorage
      sessionStorage.removeItem('formularioServicoTemp');
      sessionStorage.removeItem('produtosSelecionadosTemp');
      
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

  const abrirSelecaoProdutosMobile = () => {
    // Salvar todo o estado do formulário antes de navegar - usando sessionStorage
    const dadosFormulario = {
      nomeCliente: novoServico.nomeCliente,
      nomeServico: novoServico.nomeServico,
      produtos: novoServico.produtos,
      dataServico: dataServico?.toISOString()
    };
    
    console.log('💾 SALVANDO FORMULÁRIO no sessionStorage:', dadosFormulario);
    sessionStorage.setItem('formularioServicoTemp', JSON.stringify(dadosFormulario));
    
    navigate('/profissional/selecionar-produtos');
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
                    "w-full justify-start text-left font-normal bg-white border-2 border-border hover:bg-white",
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

        {/* Seleção de produtos - MOBILE */}
        <div className="space-y-4">
          <Label>Adicionar Produtos</Label>
          <Button 
            variant="outline" 
            className="w-full justify-between bg-white border-2 border-border hover:bg-white"
            onClick={abrirSelecaoProdutosMobile}
          >
            <span className="text-muted-foreground">Selecionar produto...</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </div>

        {/* Lista de produtos selecionados */}
        <div className="space-y-4">
          <Label>Produtos Utilizados</Label>
          <div className="border rounded-lg p-4 min-h-[200px] bg-muted/30 flex items-center justify-center">
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
            className="flex-1 bg-white text-foreground border-2 border-border hover:bg-white" 
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