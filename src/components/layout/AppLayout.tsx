import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSubscription } from "@/hooks/useSubscription";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Bell, RefreshCw, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const { userId } = useCurrentUser();
  const { subscription, daysLeft, isTrial } = useSubscription(userId);
  const navigate = useNavigate();

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      const parts = email.split('@')[0].split('.');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    const fullName = user?.user_metadata?.full_name;
    if (fullName) return fullName;
    if (user?.email) {
      const username = user.email.split('@')[0];
      return username
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }
    return 'Usuário';
  };

  const getCompanyName = () => {
    return user?.user_metadata?.company_name || 'Minha Empresa';
  };

  const getExpirationLabel = () => {
    if (!subscription) return null;
    if (daysLeft === null) return null;
    if (daysLeft <= 0) return 'Expirado';
    if (daysLeft === 1) return '1 dia restante';
    return `${daysLeft} dias restantes`;
  };

  const getExpirationVariant = (): "default" | "destructive" | "secondary" | "outline" => {
    if (daysLeft === null) return "secondary";
    if (daysLeft <= 0) return "destructive";
    if (daysLeft <= 3) return "destructive";
    if (daysLeft <= 7) return "outline";
    return "secondary";
  };

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full bg-[radial-gradient(1200px_600px_at_-20%_-10%,hsl(var(--brand)/.15)_0%,transparent_60%)] overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col h-full min-w-0">
          <header className="h-12 sm:h-14 border-b flex items-center px-2 sm:px-3 gap-1.5 sm:gap-2 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 flex-shrink-0">
            <SidebarTrigger className="hover-scale touch-friendly" />

            {/* Expiration badge */}
            {getExpirationLabel() && (
              <Badge variant={getExpirationVariant()} className="hidden sm:flex text-[11px] px-2 py-0.5">
                {isTrial ? '⏳ Trial: ' : ''}{getExpirationLabel()}
              </Badge>
            )}

            {/* Right side actions */}
            <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
              {/* Renew button */}
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => navigate('/planos-disponiveis')}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Renovar</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Renovar acesso</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* WhatsApp shortcut */}
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-emerald-500"
                      onClick={() => navigate('/whatsapp/parear')}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Parear WhatsApp</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Notifications */}
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground relative"
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notificações</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Company name dropdown with profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1.5 sm:gap-2 h-auto p-1.5 sm:p-2 hover:bg-accent touch-friendly">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-xs sm:text-sm font-medium">
                        {getUserInitials(user?.user_metadata?.full_name, user?.email)}
                      </span>
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-sm font-medium">
                        {getCompanyName()}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem disabled>
                    <User className="mr-2 h-4 w-4" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">
                        {getDisplayName()}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user?.email || 'email@exemplo.com'}
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/configuracoes/mensagens-padroes')}>
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 animate-enter min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
