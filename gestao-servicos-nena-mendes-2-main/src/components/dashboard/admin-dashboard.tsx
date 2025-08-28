
import { Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ModernSidebar } from "@/components/layout/modern-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import ProductsManagement from "./products-management";
import RecebidosDashboard from "./recebidos-dashboard";
import ConfiguracoesAdmin from "./configuracoes-admin";

const AdminDashboard = () => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <ModernSidebar userType="admin" />
        <SidebarInset className="w-full">
          <header className="sticky top-0 z-40 flex h-14 md:h-16 items-center gap-2 border-b bg-background px-3 md:px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h2 className="text-sm md:text-lg font-semibold truncate">
                {isMobile ? 'Bem-vindo(a)!' : `Seja bem-vindo(a), ${localStorage.getItem('userName') || 'Administrador'}`}
              </h2>
            </div>
          </header>
          <main className="flex-1 p-3 md:p-6 bg-beauty-secondary min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)]">
            <Routes>
              <Route path="produtos" element={<ProductsManagement />} />
              <Route path="recebidos" element={<RecebidosDashboard />} />
              <Route path="configuracoes" element={<ConfiguracoesAdmin />} />
              <Route path="*" element={<ProductsManagement />} />
            </Routes>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
