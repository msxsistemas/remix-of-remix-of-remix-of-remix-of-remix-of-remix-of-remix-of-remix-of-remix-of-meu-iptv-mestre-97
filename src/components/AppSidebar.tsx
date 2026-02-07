import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Users,
  DollarSign,
  Wallet,
  MessageSquare,
  ChevronRight,
  Link2,
  LayoutGrid,
  Package,
  Smartphone,
  BarChart3,
  CreditCard,
  ShoppingCart,
  Settings,
  Play,
} from "lucide-react";
import { useState } from "react";
import type { LucideProps } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Custom WhatsApp icon to match sidebar icon API
const WhatsAppIcon = (props: LucideProps) => (
  <svg
    viewBox="0 0 24 24"
    width={props.size ?? 24}
    height={props.size ?? 24}
    stroke="none"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M20.52 3.48A11.8 11.8 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.98L0 24l6.2-1.62A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.18-3.48-8.52zM12 22a9.94 9.94 0 01-5.45-1.5l-.39-.23-3.67.96.98-3.58-.25-.41A9.9 9.9 0 012 12C2 6.48 6.48 2 12 2c2.67 0 5.18 1.04 7.07 2.93A9.96 9.96 0 0122 12c0 5.52-4.48 10-10 10zm5.38-7.62c-.29-.14-1.71-.84-1.97-.93-.26-.1-.45-.14-.64.14-.19.29-.74.93-.9 1.12-.17.19-.33.2-.62.07-.29-.14-1.21-.45-2.3-1.43-.85-.76-1.43-1.7-1.6-1.98-.17-.29-.02-.45.12-.59.12-.12.29-.33.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.56-.88-2.14-.23-.55-.47-.48-.64-.48h-.55c-.17 0-.45.07-.69.36-.24.29-.9.88-.9 2.14s.93 2.48 1.06 2.65c.14.19 1.83 2.8 4.43 3.92.62.27 1.1.43 1.48.55.62.2 1.19.17 1.64.1.5-.07 1.71-.7 1.95-1.37.24-.67.24-1.24.17-1.37-.07-.12-.26-.2-.55-.33z" />
  </svg>
);

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  // Estado do submenu Clientes
  const clientesActive =
    currentPath === "/clientes" || currentPath.startsWith("/clientes/");
  const [clientesOpen, setClientesOpen] = useState(clientesActive);

  // Estado do submenu Pagamentos
  const pagamentosActive =
    currentPath === "/financeiro-extra" || currentPath.startsWith("/financeiro-extra/");
  const [pagamentosOpen, setPagamentosOpen] = useState(pagamentosActive);

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className="border-r border-sidebar-border" collapsible="icon">
      <SidebarContent className="bg-[hsl(220,25%,10%)]">
        {/* Logo Header */}
        <div className="flex justify-center py-8">
          <div className="w-20 h-20 rounded-full bg-[hsl(var(--brand))] flex items-center justify-center shadow-[0_0_30px_hsl(var(--brand)/0.4)]">
            <Play className="h-10 w-10 text-white fill-white ml-1" />
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="px-2">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-auto p-0">
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-foreground" 
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Home className="h-5 w-5" />
                      {!isCollapsed && <span className="text-sm">Dashboard</span>}
                    </div>
                    {!isCollapsed && <ChevronRight className="h-4 w-4 opacity-50" />}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Clientes */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setClientesOpen((o) => !o)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors w-full h-auto ${
                    clientesActive 
                      ? "bg-sidebar-accent text-sidebar-foreground" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    {!isCollapsed && <span className="text-sm">Clientes</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronRight className={`h-4 w-4 opacity-50 transition-transform ${clientesOpen ? "rotate-90" : ""}`} />
                  )}
                </SidebarMenuButton>
                {clientesOpen && !isCollapsed && (
                  <SidebarMenuSub className="ml-8 mt-1 space-y-0.5 border-l border-sidebar-border/50 pl-4">
                    {[
                      { to: "/clientes", label: "Listar/Criar", icon: LayoutGrid },
                      { to: "/clientes/planos", label: "Planos", icon: Package },
                      { to: "/clientes/produtos", label: "Produtos", icon: ShoppingCart },
                      { to: "/clientes/aplicativos", label: "Aplicativos", icon: Smartphone },
                      { to: "/clientes/metricas", label: "Métricas", icon: BarChart3 },
                      { to: "/clientes/integracoes", label: "Integrações", icon: Link2 },
                    ].map((item) => (
                      <SidebarMenuSubItem key={item.to}>
                        <SidebarMenuSubButton asChild className="h-auto p-0">
                          <NavLink
                            to={item.to}
                            end
                            className={`flex items-center gap-2 py-2 text-sm transition-colors ${
                              isActive(item.to)
                                ? "text-sidebar-primary"
                                : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                            }`}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {/* Financeiro */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-auto p-0">
                  <NavLink
                    to="/financeiro"
                    end
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-foreground" 
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5" />
                      {!isCollapsed && <span className="text-sm">Financeiro</span>}
                    </div>
                    {!isCollapsed && <ChevronRight className="h-4 w-4 opacity-50" />}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Pagamentos */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setPagamentosOpen((o) => !o)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors w-full h-auto ${
                    pagamentosActive 
                      ? "bg-sidebar-accent text-sidebar-foreground" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5" />
                    {!isCollapsed && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Pagamentos</span>
                        <Badge className="bg-[hsl(var(--brand))] text-white text-[10px] px-1.5 py-0 h-4">
                          Novo
                        </Badge>
                      </div>
                    )}
                  </div>
                  {!isCollapsed && (
                    <ChevronRight className={`h-4 w-4 opacity-50 transition-transform ${pagamentosOpen ? "rotate-90" : ""}`} />
                  )}
                </SidebarMenuButton>
                {pagamentosOpen && !isCollapsed && (
                  <SidebarMenuSub className="ml-8 mt-1 space-y-0.5 border-l border-sidebar-border/50 pl-4">
                    {[
                      { to: "/financeiro-extra/assas", label: "Assas", icon: CreditCard },
                      { to: "/financeiro-extra/checkout", label: "Checkout", icon: ShoppingCart },
                    ].map((item) => (
                      <SidebarMenuSubItem key={item.to}>
                        <SidebarMenuSubButton asChild className="h-auto p-0">
                          <NavLink
                            to={item.to}
                            end
                            className={`flex items-center gap-2 py-2 text-sm transition-colors ${
                              isActive(item.to)
                                ? "text-sidebar-primary"
                                : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                            }`}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {/* WhatsApp */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-auto p-0">
                  <NavLink
                    to="/parear-whatsapp"
                    end
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-foreground" 
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <WhatsAppIcon className="h-5 w-5" />
                      {!isCollapsed && <span className="text-sm">WhatsApp</span>}
                    </div>
                    {!isCollapsed && <ChevronRight className="h-4 w-4 opacity-50" />}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Mensagens de Cobrança */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-auto p-0">
                  <NavLink
                    to="/configuracoes/mensagens-cobranca"
                    end
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-foreground" 
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5" />
                      {!isCollapsed && <span className="text-sm">Mensagens</span>}
                    </div>
                    {!isCollapsed && <ChevronRight className="h-4 w-4 opacity-50" />}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Configurações */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-auto p-0">
                  <NavLink
                    to="/configuracoes"
                    end
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-foreground" 
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5" />
                      {!isCollapsed && <span className="text-sm">Configurações</span>}
                    </div>
                    {!isCollapsed && <ChevronRight className="h-4 w-4 opacity-50" />}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
