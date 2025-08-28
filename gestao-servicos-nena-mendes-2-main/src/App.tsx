import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./components/auth/auth-page";
import RegisterPage from "./components/auth/register-page";
import AdminDashboard from "./components/dashboard/admin-dashboard";
import ProfessionalDashboard from "./components/dashboard/professional-dashboard";
import ProtectedRoute from "./components/auth/protected-route";
import SimpleTest from "./components/debug/simple-test";
import ConnectionTest from "./components/debug/connection-test";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/test" element={<SimpleTest />} />
          <Route path="/connection-test" element={<ConnectionTest />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/" element={<AuthPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/profissional/*" element={<ProfessionalDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
