import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/use-supabase";
import { Plus, Search, Edit, Trash2, Package, ImageIcon, Upload, X, Eye, Settings } from "lucide-react";
// Usando as interfaces do Supabase
import { Product, Category, Brand } from "@/lib/supabase";
import { getCurrentBrasiliaDateTime, formatCurrencyBR, formatDateTimeBR, formatDatabaseDateToBR } from "@/lib/date-utils";

const units = ["g", "ml", "kg", "l", "unidade", "pacote", "caixa"];

// Componente para imagem com fallback
const ProductImage = ({ src, alt, className, onClick }: { src?: string | null; alt: string; className: string; onClick?: () => void }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!src || hasError) {
    return (
      <div className={`${className} border rounded-md flex items-center justify-center text-muted-foreground bg-gray-50`}>
        <ImageIcon className="h-6 w-6" />
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${className} ${isLoading ? 'opacity-50' : ''}`}
      onClick={onClick}
      onLoad={() => setIsLoading(false)}
      onError={() => {
        setHasError(true);
        setIsLoading(false);
      }}
    />
  );
};

export default function ProductsManagement() {
  // Usar hooks do Supabase
  const { 
    products, 
    categories, 
    brands, 
    loading,
    addProduct, 
    updateProduct, 
    deleteProduct,
    addCategory,
    addBrand 
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const { toast } = useToast();

  // Dados são carregados automaticamente pelos hooks do Supabase
  const [newProduct, setNewProduct] = useState({
    name: "",
    category_id: "",
    brand_id: "",
    barcode: "",
    sku: "",
    package_quantity: "",
    purchase_price: "",
    image_url: ""
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase())) || 
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || product.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Função para formatar número com pontos
  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Função para formatar preço em reais
  const formatPrice = (value: string) => {
    // Remove tudo exceto números
    const number = value.replace(/\D/g, "");
    if (!number) return "";

    // Converte para centavos
    const numberValue = parseInt(number);

    // Formata como moeda brasileira
    const formatted = formatCurrencyBR(numberValue / 100).replace('R$ ', '');
    return formatted;
  };

  // Função para calcular custo unitário
  const calculateUnitCost = (price: number, quantity: number) => {
    if (quantity === 0) return 0;
    return price / quantity;
  };

  // Função para redimensionar e otimizar imagem
  const resizeImage = (file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Converter para base64 com compressão
        const base64String = canvas.toDataURL('image/jpeg', quality);
        resolve(base64String);
      };

      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Função para obter data/hora atual no fuso de Brasília
  const getBrazilDateTime = () => {
    return getCurrentBrasiliaDateTime();
  };
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.category_id || !newProduct.brand_id || !newProduct.package_quantity || !newProduct.purchase_price) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const packageQty = parseFloat(newProduct.package_quantity.replace(/\./g, ""));
    const price = parseFloat(newProduct.purchase_price.replace(/[R$\s,.]/g, "")) / 100;

    const productData = {
      name: newProduct.name,
      category_id: newProduct.category_id,
      brand_id: newProduct.brand_id,
      barcode: newProduct.barcode || null,
      sku: newProduct.sku || null,
      package_quantity: packageQty,
      unit: "g",
      purchase_price: price,
      unit_cost: calculateUnitCost(price, packageQty),
      image_url: newProduct.image_url || null
    };

    const { error } = await addProduct(productData);

    if (!error) {
      setNewProduct({
        name: "",
        category_id: "",
        brand_id: "",
        barcode: "",
        sku: "",
        package_quantity: "",
        purchase_price: "",
        image_url: ""
      });
      setIsAddDialogOpen(false);
    }
  };
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category_id: product.category_id || "",
      brand_id: product.brand_id || "",
      barcode: product.barcode || "",
      sku: product.sku || "",
      package_quantity: formatNumber(product.package_quantity.toString()),
      purchase_price: formatPrice((product.purchase_price * 100).toString()),
      image_url: product.image_url || ""
    });
  };
  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    const packageQty = parseFloat(newProduct.package_quantity.replace(/\./g, ""));
    const price = parseFloat(newProduct.purchase_price.replace(/[R$\s,.]/g, "")) / 100;

    const updates = {
      name: newProduct.name,
      category_id: newProduct.category_id,
      brand_id: newProduct.brand_id,
      barcode: newProduct.barcode || null,
      sku: newProduct.sku || null,
      package_quantity: packageQty,
      unit: "g",
      purchase_price: price,
      unit_cost: calculateUnitCost(price, packageQty),
      image_url: newProduct.image_url || null
    };

    const { error } = await updateProduct(editingProduct.id, updates);

    if (!error) {
      setEditingProduct(null);
      setNewProduct({
        name: "",
        category_id: "",
        brand_id: "",
        barcode: "",
        sku: "",
        package_quantity: "",
        purchase_price: "",
        image_url: ""
      });
    }
  };
  const handleDeleteProduct = async (productId: string) => {
    await deleteProduct(productId);
  };

  // Funções para gerenciar categorias
  const handleAddCategory = async () => {
    console.log('handleAddCategory chamada com:', newCategoryName);
    
    if (!newCategoryName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para a categoria",
        variant: "destructive"
      });
      return;
    }

    if (categories.some(cat => cat.name === newCategoryName.trim())) {
      toast({
        title: "Erro",
        description: "Esta categoria já existe",
        variant: "destructive"
      });
      return;
    }

    console.log('Tentando adicionar categoria:', newCategoryName.trim());
    const { error } = await addCategory(newCategoryName.trim());
    console.log('Resultado addCategory:', { error });
    
    if (!error) {
      setNewCategoryName("");
    }
  };
  // Funções de edição e exclusão removidas - agora gerenciadas pelo Supabase

  // Função para gerenciar marcas
  const handleAddBrand = async () => {
    console.log('handleAddBrand chamada com:', newBrandName);
    
    if (!newBrandName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para a marca",
        variant: "destructive"
      });
      return;
    }

    if (brands.some(brand => brand.name === newBrandName.trim())) {
      toast({
        title: "Erro",
        description: "Esta marca já existe",
        variant: "destructive"
      });
      return;
    }

    console.log('Tentando adicionar marca:', newBrandName.trim());
    const { error } = await addBrand(newBrandName.trim());
    console.log('Resultado addBrand:', { error });
    
    if (!error) {
      setNewBrandName("");
    }
  };
  
  // Funções de edição e exclusão de marcas removidas - agora gerenciadas pelo Supabase
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-beauty-primary mx-auto mb-4"></div>
          <p className="text-beauty-primary">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Produtos</h1>
          <p className="text-muted-foreground">adicione e gerencie produtos</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-beauty-primary hover:bg-beauty-primary-light text-beauty-neutral shadow-soft hover:shadow-elegant">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[672px] max-w-[95vw] h-[635px] bg-background border-beauty-accent shadow-elegant">
              <DialogHeader>
                <DialogTitle className="text-foreground">Configurações do Sistema</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="categories" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-beauty-secondary border-beauty-accent">
                  <TabsTrigger value="categories" className="text-foreground data-[state=active]:bg-beauty-primary data-[state=active]:text-beauty-neutral">
                    Categorias
                  </TabsTrigger>
                  <TabsTrigger value="brands" className="text-foreground data-[state=active]:bg-beauty-primary data-[state=active]:text-beauty-neutral">
                    Marcas
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="categories" className="space-y-6 mt-6">
                  <Card className="shadow-soft bg-card border-beauty-accent">
                    <CardHeader>
                      <CardTitle className="text-card-foreground">Gerenciar Categorias</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Nova categoria" 
                          value={newCategoryName} 
                          onChange={e => setNewCategoryName(e.target.value)} 
                          className="bg-background border-beauty-accent text-foreground" 
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCategory();
                            }
                          }}
                        />
                        <Button 
                          type="button"
                          onClick={handleAddCategory} 
                          size="sm" 
                          className="bg-beauty-primary hover:bg-beauty-primary-light text-beauty-neutral h-10 aspect-square p-0"
                          disabled={!newCategoryName.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="h-64 overflow-y-auto space-y-2">
                        {categories.map(category => <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg border-beauty-accent bg-background/50">
                            <span className="text-foreground font-medium">{category.name}</span>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" disabled>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>)}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="brands" className="space-y-6 mt-6">
                  <Card className="shadow-soft bg-card border-beauty-accent">
                    <CardHeader>
                      <CardTitle className="text-card-foreground">Gerenciar Marcas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Nova marca" 
                          value={newBrandName} 
                          onChange={e => setNewBrandName(e.target.value)} 
                          className="bg-background border-beauty-accent text-foreground" 
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddBrand();
                            }
                          }}
                        />
                        <Button 
                          type="button"
                          onClick={handleAddBrand} 
                          size="sm" 
                          className="bg-beauty-primary hover:bg-beauty-primary-light text-beauty-neutral h-10 aspect-square p-0"
                          disabled={!newBrandName.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="h-64 overflow-y-auto space-y-2">
                        {brands.map(brand => <div key={brand.id} className="flex items-center justify-between p-3 border rounded-lg border-beauty-accent bg-background/50">
                            <span className="text-foreground font-medium">{brand.name}</span>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" disabled>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>)}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)} className="border-beauty-accent text-foreground hover:bg-beauty-secondary">
                  Fechar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-beauty-primary hover:bg-beauty-primary-light text-beauty-neutral shadow-soft hover:shadow-elegant">
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
          <DialogContent className="w-[672px] max-w-[95vw] h-[635px] bg-background border-beauty-accent">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingProduct ? "Editar Produto" : "Adicionar Novo Produto"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-foreground">Nome do Produto *</Label>
                <Input id="name" value={newProduct.name} onChange={e => setNewProduct({
                  ...newProduct,
                  name: e.target.value
                })} placeholder="Digite o nome do produto" className="bg-background border-beauty-accent text-foreground" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-foreground">Categoria *</Label>
                  <Select value={newProduct.category_id} onValueChange={value => setNewProduct({
                    ...newProduct,
                    category_id: value
                  })}>
                    <SelectTrigger className="bg-background border-beauty-accent text-foreground">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="brand" className="text-foreground">Marca *</Label>
                  <Select value={newProduct.brand_id} onValueChange={value => setNewProduct({
                    ...newProduct,
                    brand_id: value
                  })}>
                    <SelectTrigger className="bg-background border-beauty-accent text-foreground">
                      <SelectValue placeholder="Selecione uma marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(brand => <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="barcode" className="text-foreground">Código de Barras</Label>
                  <Input id="barcode" value={newProduct.barcode} onChange={e => setNewProduct({
                    ...newProduct,
                    barcode: e.target.value
                  })} placeholder="Digite o código de barras" className="bg-background border-beauty-accent text-foreground" />
                </div>
                
                <div>
                  <Label htmlFor="sku" className="text-foreground">SKU</Label>
                  <Input id="sku" value={newProduct.sku} onChange={e => setNewProduct({
                    ...newProduct,
                    sku: e.target.value
                  })} placeholder="Digite o SKU" className="bg-background border-beauty-accent text-foreground" />
                </div>
              </div>

              <div>
                <Label htmlFor="packageQuantity" className="text-foreground">Quantidade por Embalagem (g) *</Label>
                <Input id="packageQuantity" value={newProduct.package_quantity} onChange={e => setNewProduct({
                  ...newProduct,
                  package_quantity: formatNumber(e.target.value)
                })} placeholder="1.000" className="bg-background border-beauty-accent text-foreground" />
              </div>

              <div>
                <Label htmlFor="purchasePrice" className="text-foreground">Preço de Compra (R$) *</Label>
                <Input id="purchasePrice" value={newProduct.purchase_price} onChange={e => setNewProduct({
                  ...newProduct,
                  purchase_price: formatPrice(e.target.value)
                })} placeholder="1.000,00" className="bg-background border-beauty-accent text-foreground" />
              </div>

              <div>
                <Label htmlFor="imageFile" className="text-foreground">Imagem do Produto</Label>
                <div className="flex gap-2">
                  <Input id="imageFile" type="file" accept="image/*" onChange={async e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Verificar tamanho do arquivo (máximo 10MB)
                      if (file.size > 10 * 1024 * 1024) {
                        toast({
                          title: "Erro",
                          description: "A imagem deve ter no máximo 10MB",
                          variant: "destructive"
                        });
                        return;
                      }

                      try {
                        // Mostrar loading
                        toast({
                          title: "Processando imagem...",
                          description: "Aguarde enquanto otimizamos a imagem"
                        });

                        // Redimensionar e otimizar imagem
                        const optimizedBase64 = await resizeImage(file, 800, 800, 0.8);
                        
                        // Verificar tamanho final (base64 é ~33% maior que binário)
                        const sizeInBytes = (optimizedBase64.length * 3) / 4;
                        if (sizeInBytes > 2 * 1024 * 1024) { // 2MB limit for base64
                          // Tentar com qualidade menor
                          const smallerImage = await resizeImage(file, 600, 600, 0.6);
                          setNewProduct({
                            ...newProduct,
                            image_url: smallerImage
                          });
                        } else {
                          setNewProduct({
                            ...newProduct,
                            image_url: optimizedBase64
                          });
                        }

                        toast({
                          title: "Sucesso!",
                          description: "Imagem processada com sucesso"
                        });

                      } catch (error) {
                        console.error('Erro ao processar imagem:', error);
                        toast({
                          title: "Erro",
                          description: "Erro ao processar a imagem. Tente uma imagem menor.",
                          variant: "destructive"
                        });
                      }
                    }
                  }} className="flex-1 bg-background border-beauty-accent text-foreground" />
                  {newProduct.image_url && <Button type="button" variant="outline" size="sm" onClick={() => setShowImagePreview(true)} className="px-3">
                      <Eye className="h-4 w-4" />
                    </Button>}
                </div>

              </div>

              

              <div className="grid grid-cols-2 gap-3 pt-4">
                <Button onClick={editingProduct ? handleUpdateProduct : handleAddProduct} className="bg-beauty-primary hover:bg-beauty-primary-light text-beauty-neutral shadow-soft hover:shadow-elegant">
                  {editingProduct ? "Atualizar" : "Adicionar"}
                </Button>
                <Button variant="outline" className="border-beauty-accent text-foreground hover:bg-beauty-secondary" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingProduct(null);
                  setNewProduct({
                    name: "",
                    category_id: "",
                    brand_id: "",
                    barcode: "",
                    sku: "",
                    package_quantity: "",
                    purchase_price: "",
                    image_url: ""
                  });
                }}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>

        {/* Image Preview Dialog */}
        <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
          <DialogContent className="sm:max-w-lg p-0 bg-background border-beauty-accent shadow-elegant">
            {/* Header with title and close button */}
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-xl font-semibold text-foreground">Foto do Produto</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowImagePreview(false)} className="h-8 w-8 rounded-full hover:bg-beauty-secondary text-foreground">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Image container */}
            <div className="px-6 pb-6">
              <div className="aspect-square bg-beauty-secondary rounded-lg overflow-hidden">
                {newProduct.image_url ? <img src={newProduct.image_url} alt="Prévia do produto" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>


      {/* Filters */}
      <Card className="shadow-soft bg-card border-beauty-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            
            Lista de Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome, código de barras ou SKU..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-background border-beauty-accent text-foreground" />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 bg-background border-beauty-accent text-foreground">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Imagem</TableHead>
                  <TableHead className="text-center">Nome</TableHead>
                  <TableHead className="text-center">Categoria</TableHead>
                  <TableHead className="text-center">Marca</TableHead>
                  <TableHead className="text-center">Código de Barras</TableHead>
                  <TableHead className="text-center">SKU</TableHead>
                  <TableHead className="text-center">Quantidade (g)</TableHead>
                  <TableHead className="text-center">Preço de Compra</TableHead>
                  <TableHead className="text-center">Custo por 1g</TableHead>
                  <TableHead className="text-center">Atualização</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(product => <TableRow key={product.id}>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <ProductImage
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setSelectedImage(product.image_url || null)}
                        />
                       </div>
                     </TableCell>
                     <TableCell className="font-medium text-center text-foreground">{product.name}</TableCell>
                     <TableCell className="text-center">
                       <div className="flex justify-center">
                         <Badge variant="outline" className="border-beauty-accent text-foreground">{product.category?.name || 'N/A'}</Badge>
                       </div>
                     </TableCell>
                     <TableCell className="text-center text-foreground">{product.brand?.name || 'N/A'}</TableCell>
                     <TableCell className="font-mono text-sm text-center text-muted-foreground">{product.barcode || '-'}</TableCell>
                     <TableCell className="font-mono text-sm text-center text-muted-foreground">{product.sku || '-'}</TableCell>
                     <TableCell className="text-center text-foreground">
                       {formatNumber(product.package_quantity.toString())}g
                     </TableCell>
                     <TableCell className="font-medium text-center text-foreground">
                       R$ {product.purchase_price.toFixed(2)}
                     </TableCell>
                     <TableCell className="font-medium text-foreground text-center">
                       R$ {product.unit_cost.toFixed(4)}
                     </TableCell>
                     <TableCell className="text-sm text-center text-muted-foreground">{formatDatabaseDateToBR(product.updated_at)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-2 justify-center">
                         <Button variant="outline" size="sm" onClick={() => {
                      handleEditProduct(product);
                      setIsAddDialogOpen(true);
                    }} className="border-beauty-accent text-foreground hover:bg-beauty-secondary rounded-md h-10 w-10 p-0">
                           <Edit className="h-4 w-4" />
                         </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product.id)} className="text-destructive hover:text-destructive border-beauty-accent rounded-md h-10 w-10 p-0">
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </div>

          {filteredProducts.length === 0 && <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== "all" ? "Tente ajustar os filtros de busca" : "Comece adicionando seu primeiro produto"}
              </p>
            </div>}
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="sm:max-w-lg p-0 bg-background border-beauty-accent shadow-elegant">
          {/* Header with title and close button */}
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-xl font-semibold text-foreground">Foto do Produto</h2>
            <Button variant="ghost" size="icon" onClick={() => setSelectedImage(null)} className="h-8 w-8 rounded-full hover:bg-beauty-secondary text-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Image container */}
          <div className="px-6 pb-6">
            <div className="aspect-square bg-beauty-secondary rounded-lg overflow-hidden">
              {selectedImage ? <img src={selectedImage} alt="Foto do produto" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}