import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-supabase'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredUserType?: 'admin' | 'professional'
}

export default function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login')
        return
      }

      if (requiredUserType && user.user_type !== requiredUserType) {
        // Redirecionar para o dashboard apropriado
        navigate(user.user_type === 'admin' ? '/admin' : '/profissional')
        return
      }
    }
  }, [user, loading, navigate, requiredUserType])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beauty-neutral">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-beauty-primary mx-auto mb-4"></div>
          <p className="text-beauty-primary">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Será redirecionado para login
  }

  if (requiredUserType && user.user_type !== requiredUserType) {
    return null // Será redirecionado para o dashboard apropriado
  }

  return <>{children}</>
}
