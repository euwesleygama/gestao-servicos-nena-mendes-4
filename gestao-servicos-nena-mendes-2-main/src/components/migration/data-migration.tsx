import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { AlertCircle, CheckCircle, Upload } from 'lucide-react'
import { parseDateBR, getBrasiliaDate, formatDateForDatabase } from '@/lib/date-utils'

interface MigrationStep {
  name: string
  completed: boolean
  error?: string
}

export default function DataMigration() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [steps, setSteps] = useState<MigrationStep[]>([
    { name: 'Migrar Categorias', completed: false },
    { name: 'Migrar Marcas', completed: false },
    { name: 'Migrar Produtos', completed: false },
    { name: 'Migrar Serviços', completed: false }
  ])
  const { toast } = useToast()

  const updateStep = (index: number, completed: boolean, error?: string) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, completed, error } : step
    ))
  }

  const migrateCategories = async () => {
    try {
      const savedCategories = localStorage.getItem('adminCategories')
      if (!savedCategories) {
        updateStep(0, true)
        return
      }

      const categories = JSON.parse(savedCategories)
      
      // Verificar se já existem categorias
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('name')

      const existingNames = existingCategories?.map(c => c.name) || []
      const newCategories = categories.filter((name: string) => !existingNames.includes(name))

      if (newCategories.length > 0) {
        const { error } = await supabase
          .from('categories')
          .insert(newCategories.map((name: string) => ({ name })))

        if (error) throw error
      }

      updateStep(0, true)
    } catch (error: any) {
      updateStep(0, false, error.message)
    }
  }

  const migrateBrands = async () => {
    try {
      const savedBrands = localStorage.getItem('adminBrands')
      if (!savedBrands) {
        updateStep(1, true)
        return
      }

      const brands = JSON.parse(savedBrands)
      
      // Verificar se já existem marcas
      const { data: existingBrands } = await supabase
        .from('brands')
        .select('name')

      const existingNames = existingBrands?.map(b => b.name) || []
      const newBrands = brands.filter((name: string) => !existingNames.includes(name))

      if (newBrands.length > 0) {
        const { error } = await supabase
          .from('brands')
          .insert(newBrands.map((name: string) => ({ name })))

        if (error) throw error
      }

      updateStep(1, true)
    } catch (error: any) {
      updateStep(1, false, error.message)
    }
  }

  const migrateProducts = async () => {
    try {
      const savedProducts = localStorage.getItem('adminProducts')
      if (!savedProducts) {
        updateStep(2, true)
        return
      }

      const products = JSON.parse(savedProducts)
      
      // Buscar categorias e marcas para fazer o mapeamento
      const { data: categories } = await supabase.from('categories').select('id, name')
      const { data: brands } = await supabase.from('brands').select('id, name')

      const categoryMap = new Map(categories?.map(c => [c.name, c.id]) || [])
      const brandMap = new Map(brands?.map(b => [b.name, b.id]) || [])

      const productsToInsert = products.map((product: any) => ({
        name: product.name,
        category_id: categoryMap.get(product.category),
        brand_id: brandMap.get(product.brand),
        barcode: product.barcode || null,
        sku: product.sku || null,
        package_quantity: product.packageQuantity,
        unit: product.unit || 'g',
        purchase_price: product.purchasePrice,
        unit_cost: product.unitCost,
        image_url: product.imageUrl || null
      }))

      if (productsToInsert.length > 0) {
        const { error } = await supabase
          .from('products')
          .insert(productsToInsert)

        if (error) throw error
      }

      updateStep(2, true)
    } catch (error: any) {
      updateStep(2, false, error.message)
    }
  }

  const migrateServices = async () => {
    try {
      const savedServices = localStorage.getItem('servicosRecebidos')
      if (!savedServices) {
        updateStep(3, true)
        return
      }

      const services = JSON.parse(savedServices)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // Buscar produtos para fazer o mapeamento
      const { data: products } = await supabase.from('products').select('id, name')
      const productMap = new Map(products?.map(p => [p.name, p.id]) || [])

      for (const service of services) {
        // Inserir serviço
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .insert({
            professional_name: service.nomeProfissional,
            client_name: service.nomeCliente,
            service_name: service.nomeServico,
            service_date: formatDateForDatabase(parseDateBR(service.dataCriacao) || getBrasiliaDate()),
            status: service.status || 'pending',
            created_by: user.id
          })
          .select()
          .single()

        if (serviceError) throw serviceError

        // Inserir produtos do serviço
        if (service.produtos && service.produtos.length > 0) {
          const serviceProducts = service.produtos
            .map((produto: any) => {
              const productId = productMap.get(produto.nome)
              if (!productId) return null

              return {
                service_id: serviceData.id,
                product_id: productId,
                quantity_used: parseFloat(produto.quantidade?.replace(/\./g, '') || '0')
              }
            })
            .filter(Boolean)

          if (serviceProducts.length > 0) {
            const { error: productsError } = await supabase
              .from('service_products')
              .insert(serviceProducts)

            if (productsError) throw productsError
          }
        }
      }

      updateStep(3, true)
    } catch (error: any) {
      updateStep(3, false, error.message)
    }
  }

  const runMigration = async () => {
    setIsRunning(true)
    setProgress(0)

    // Reset steps
    setSteps(prev => prev.map(step => ({ ...step, completed: false, error: undefined })))

    try {
      await migrateCategories()
      setProgress(25)

      await migrateBrands()
      setProgress(50)

      await migrateProducts()
      setProgress(75)

      await migrateServices()
      setProgress(100)

      toast({
        title: "Migração concluída!",
        description: "Todos os dados foram transferidos com sucesso para o Supabase."
      })
    } catch (error: any) {
      toast({
        title: "Erro na migração",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsRunning(false)
    }
  }

  const hasLocalStorageData = () => {
    return !!(
      localStorage.getItem('adminProducts') ||
      localStorage.getItem('adminCategories') ||
      localStorage.getItem('adminBrands') ||
      localStorage.getItem('servicosRecebidos')
    )
  }

  if (!hasLocalStorageData()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Migração de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum dado encontrado no localStorage para migrar.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Migração de Dados do localStorage para Supabase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Esta ferramenta irá transferir seus dados do localStorage para o banco de dados Supabase.
            Este processo só precisa ser executado uma vez.
          </AlertDescription>
        </Alert>

        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso da migração</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">{step.name}</span>
              <div className="flex items-center gap-2">
                {step.error && (
                  <span className="text-xs text-red-500">{step.error}</span>
                )}
                {step.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                )}
              </div>
            </div>
          ))}
        </div>

        <Button 
          onClick={runMigration} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Migrando...' : 'Iniciar Migração'}
        </Button>
      </CardContent>
    </Card>
  )
}
