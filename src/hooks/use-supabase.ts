import { useState, useEffect } from 'react'
import { supabase, User, Product, Service, Category, Brand } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

// Hook para autenticação
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          // Buscar dados do usuário na tabela profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profile) {
            setUser(profile)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (profile) {
              setUser(profile)
            }
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error('Erro no listener de auth:', error)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 useAuth.signIn: Tentando login para:', email);
      
      // Verificar se as variáveis de ambiente estão configuradas
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Configuração do Supabase não encontrada. Verifique as variáveis de ambiente.');
      }
      
      // Adicionar timeout para a requisição
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: A conexão demorou muito')), 10000);
      });

      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ useAuth.signIn: Erro do Supabase:', error);
        throw error;
      }

      console.log('✅ useAuth.signIn: Login bem-sucedido');
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo(a) de volta!"
      })

      return { data, error: null }
    } catch (error: unknown) {
      console.error('❌ useAuth.signIn: Erro capturado:', error);
      
      let errorMessage = "Credenciais inválidas";
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      if (errorMsg.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos";
      } else if (errorMsg.includes("Email not confirmed")) {
        errorMessage = "Email não confirmado. Verifique sua caixa de entrada.";
      } else if (errorMsg.includes("Too many requests")) {
        errorMessage = "Muitas tentativas. Tente novamente em alguns minutos.";
      } else if (errorMsg.includes("Timeout")) {
        errorMessage = "Conexão muito lenta. Verifique sua internet.";
      } else if (errorMsg.includes("fetch")) {
        errorMessage = "Problema de conexão. Verifique sua internet.";
      } else if (errorMsg.includes("Configuração do Supabase")) {
        errorMessage = "Erro de configuração. Entre em contato com o suporte.";
      } else if (errorMsg.includes("Failed to fetch")) {
        errorMessage = "Sem conexão com a internet. Verifique sua rede.";
      }
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive"
      })
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) }
    }
  }

  const signUp = async (email: string, password: string, name: string, userType: 'admin' | 'professional') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            user_type: userType
          }
        }
      })

      if (error) throw error

      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo(a), ${name}!`
      })

      return { data, error: null }
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }
}

// Hook para produtos
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name),
          brand:brands(id, name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name')

      if (error) throw error
      setBrands(data || [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar marcas",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchBrands()
      ])
      setLoading(false)
    }

    loadData()

    // Configurar subscriptions em tempo real
    const productsSubscription = supabase
      .channel('products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Produto alterado:', payload)
          fetchProducts() // Recarregar produtos quando houver mudanças
        }
      )
      .subscribe()

    const categoriesSubscription = supabase
      .channel('categories-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          console.log('Categoria alterada:', payload)
          fetchCategories() // Recarregar categorias quando houver mudanças
        }
      )
      .subscribe()

    const brandsSubscription = supabase
      .channel('brands-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'brands' },
        (payload) => {
          console.log('Marca alterada:', payload)
          fetchBrands() // Recarregar marcas quando houver mudanças
        }
      )
      .subscribe()

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(productsSubscription)
      supabase.removeChannel(categoriesSubscription)
      supabase.removeChannel(brandsSubscription)
    }
  }, [])

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso"
      })

      await fetchProducts()
      return { data, error: null }
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar produto",
        description: error.message,
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso"
      })

      await fetchProducts()
      return { data, error: null }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Produto removido com sucesso"
      })

      await fetchProducts()
      return { error: null }
    } catch (error: any) {
      toast({
        title: "Erro ao remover produto",
        description: error.message,
        variant: "destructive"
      })
      return { error }
    }
  }

  const addCategory = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name }])
        .select()

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Categoria adicionada com sucesso"
      })

      await fetchCategories()
      return { data, error: null }
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar categoria",
        description: error.message,
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  const addBrand = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .insert([{ name }])
        .select()

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Marca adicionada com sucesso"
      })

      await fetchBrands()
      return { data, error: null }
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar marca",
        description: error.message,
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  return {
    products,
    categories,
    brands,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    addBrand,
    refreshProducts: fetchProducts,
    refreshCategories: fetchCategories,
    refreshBrands: fetchBrands
  }
}

// Hook para serviços
export const useServices = () => {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          service_products(
            *,
            product:products(
              *,
              category:categories(name),
              brand:brands(name)
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setServices(data || [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar serviços",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true)
      await fetchServices()
      setLoading(false)
    }

    loadServices()

    // Configurar subscription em tempo real para serviços
    const servicesSubscription = supabase
      .channel('services-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'services' },
        (payload) => {
          console.log('Serviço alterado:', payload)
          fetchServices() // Recarregar serviços quando houver mudanças
        }
      )
      .subscribe()

    const serviceProductsSubscription = supabase
      .channel('service-products-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'service_products' },
        (payload) => {
          console.log('Produto de serviço alterado:', payload)
          fetchServices() // Recarregar serviços quando produtos mudarem
        }
      )
      .subscribe()

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(servicesSubscription)
      supabase.removeChannel(serviceProductsSubscription)
    }
  }, [])

  const addService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>, products: Array<{ product_id: string; quantity_used: number }>) => {
    try {
      console.log('🔧 useServices.addService chamado com:', { service, products });

      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Usuário atual:', user);

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Adicionar created_by ao serviço
      const serviceWithUser = {
        ...service,
        created_by: user.id
      };

      console.log('📝 Dados do serviço com usuário:', serviceWithUser);

      // Inserir serviço
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .insert([serviceWithUser])
        .select()
        .single()

      console.log('💾 Resultado da inserção do serviço:', { serviceData, serviceError });

      if (serviceError) throw serviceError

      // Inserir produtos do serviço
      if (products.length > 0) {
        const serviceProducts = products.map(p => ({
          service_id: serviceData.id,
          product_id: p.product_id,
          quantity_used: p.quantity_used
        }))

        console.log('🛍️ Inserindo produtos do serviço:', serviceProducts);

        const { error: productsError } = await supabase
          .from('service_products')
          .insert(serviceProducts)

        console.log('🛍️ Resultado da inserção dos produtos:', { productsError });

        if (productsError) throw productsError
      }

      console.log('✅ Serviço criado com sucesso no hook!');

      toast({
        title: "Sucesso",
        description: "Serviço criado com sucesso"
      })

      await fetchServices()
      return { data: serviceData, error: null }
    } catch (error: any) {
      console.log('❌ Erro no hook addService:', error);
      toast({
        title: "Erro ao criar serviço",
        description: error.message,
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  const updateServiceStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update({ status })
        .eq('id', id)
        .select()

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Status do serviço atualizado"
      })

      await fetchServices()
      return { data, error: null }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  return {
    services,
    loading,
    addService,
    updateServiceStatus,
    refreshServices: fetchServices
  }
}
