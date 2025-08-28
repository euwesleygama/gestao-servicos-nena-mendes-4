import { useState } from "react";
import { Package, Download, Clock, Upload, LogOut, User, Settings, Bell, ChevronDown, Home } from "lucide-react";
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
  useSidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AppSidebarProps {
  userType: "admin" | "professional";
}

export function AppSidebar({ userType }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentPath = location.pathname;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    gestao: true,
    operacoes: true
  });

  const userName = localStorage.getItem("userName") || "Usuário";
  const userEmail = localStorage.getItem("userEmail") || "usuario@email.com";

  // Mock notification count
  const notificationCount = 3;

  const adminItems = [
    { 
      category: "Gestão",
      key: "gestao",
      items: [
        { title: "Produtos", url: "/admin/produtos", icon: Package, description: "Gerenciar produtos", badge: "12" },
        { title: "Recebidos", url: "/admin/recebidos", icon: Download, description: "Pedidos recebidos", badge: "5" },
      ]
    }
  ];

  const professionalItems = [
    {
      category: "Gestão",
      key: "operacoes",
      items: [
        { title: "Envios", url: "/profissional/envios", icon: Upload, description: "Gerenciar envios", badge: "8" },
      ]
    }
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

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <TooltipProvider>
      <Sidebar variant="inset" className="border-r border-border bg-[#f5f5f5]">
        {/* Header */}
        <SidebarHeader className="border-b">
          <div className="flex h-16 items-center justify-center px-4">
            <h1 className="text-lg font-semibold text-black font-libre-baskerville uppercase tracking-wide whitespace-nowrap">
              Nena Mendes
            </h1>
          </div>
        </SidebarHeader>

        {/* Content */}
        <SidebarContent>
          <div className="px-2 py-2">
            {menuItems.map((section) => (
              <SidebarGroup key={section.category} className="px-0">
                <Collapsible
                  open={openGroups[section.key]}
                  onOpenChange={() => toggleGroup(section.key)}
                  className="group/collapsible"
                >
                  {state !== "collapsed" && (
                    <CollapsibleTrigger asChild>
                      <SidebarGroupLabel className="group/label w-full justify-between text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                        {section.category}
                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarGroupLabel>
                    </CollapsibleTrigger>
                  )}
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {section.items.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            {state !== "collapsed" ? (
                              <SidebarMenuButton
                                asChild
                                isActive={isActive(item.url)}
                                tooltip={item.title}
                              >
                                <button
                                  onClick={() => navigate(item.url)}
                                  className="flex w-full items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-left outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground"
                                >
                                  <item.icon className="h-4 w-4" />
                                   <span>{item.title}</span>
                                </button>
                              </SidebarMenuButton>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <SidebarMenuButton
                                    asChild
                                    isActive={isActive(item.url)}
                                    className="h-8 w-8"
                                  >
                                    <button
                                      onClick={() => navigate(item.url)}
                                      className="flex items-center justify-center"
                                    >
                                      <item.icon className="h-4 w-4" />
                                      <span className="sr-only">{item.title}</span>
                                    </button>
                                  </SidebarMenuButton>
                                </TooltipTrigger>
                                <TooltipContent side="right" align="center">
                                  <p>{item.title}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarGroup>
            ))}
          </div>
        </SidebarContent>

        {/* Footer */}
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
                <DropdownMenuContent align="end" side="right">
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
    </TooltipProvider>
  );
}