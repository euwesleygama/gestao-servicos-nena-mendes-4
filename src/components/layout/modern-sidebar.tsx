
import { useState } from "react";
import { Package, Download, Upload, LogOut, User, ChevronDown, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { NavLink } from "react-router-dom";

interface ModernSidebarProps {
  userType: "admin" | "professional";
}

export function ModernSidebar({ userType }: ModernSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const currentPath = location.pathname;

  const userName = localStorage.getItem("userName") || "Usuário";
  const userEmail = localStorage.getItem("userEmail") || "usuario@email.com";

  const adminItems = [
    { title: "Produtos", url: "/admin/produtos", icon: Package },
    { title: "Recebidos", url: "/admin/recebidos", icon: Download },
  ];

  const professionalItems = [
    { title: "Envios", url: "/profissional/envios", icon: Upload },
  ];

  const menuItems = userType === "admin" ? adminItems : professionalItems;

  const isActive = (path: string) => currentPath === path;

  const handleLogout = () => {
    localStorage.clear();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getNavClassName = ({ isActive }: { isActive: boolean }) => 
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  return (
    <Sidebar 
      variant="inset" 
      className="border-r"
      collapsible="offcanvas"
      side="left"
    >
      <SidebarHeader className="border-b">
        <div className="flex h-14 md:h-16 items-center justify-center px-2 md:px-4">
          <h1 className="text-sm md:text-lg font-semibold text-foreground font-libre-baskerville uppercase tracking-wide text-center">
            {state === "collapsed" && !isMobile ? "NM" : "Nena Mendes"}
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {userType === "admin" ? "Gestão" : "Gestão"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} className={getNavClassName}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full justify-start data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="" alt={userName} />
                    <AvatarFallback className="text-xs">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  {state !== "collapsed" && (
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">{userName}</span>
                      <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
                    </div>
                  )}
                  {state !== "collapsed" && <ChevronDown className="h-4 w-4 ml-auto" />}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side={isMobile ? "top" : "right"}>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
