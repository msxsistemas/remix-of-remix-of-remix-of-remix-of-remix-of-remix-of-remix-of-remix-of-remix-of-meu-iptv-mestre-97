import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSubscription } from "@/hooks/useSubscription";
import { useProfile } from "@/hooks/useProfile";
import { useNotificacoes } from "@/hooks/useNotificacoes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LogOut, User, Bell, RefreshCw, MessageSquare, Check, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const { userId } = useCurrentUser();
  const { subscription, daysLeft, isTrial } = useSubscription(userId);
  const { profile } = useProfile(userId);
  const { notificacoes, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotificacoes(userId);
  const navigate = useNavigate();

  const getUserInitials = (name?: string | null, email?: string) => {
    const n = name || profile?.nome_completo;
    if (n) {
      const parts = n.trim().split(' ');
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return n.substring(0, 2).toUpperCase();
    }
    if (email) {
      const parts = email.split('@')[0].split('.');
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (profile?.nome_completo) return profile.nome_completo;
    const fullName = user?.user_metadata?.full_name;
    if (fullName) return fullName;
    if (user?.email) {
      return user.email.split('@')[0].split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }
    return 'Usuário';
  };

  const getCompanyName = () => {
    return profile?.nome_empresa || user?.user_metadata?.company_name || 'Minha Empresa';
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
    if (daysLeft <= 3) return "destructive";
    if (daysLeft <= 7) return "outline";
    return "secondary";
  };

  const getNotifIcon = (tipo: string) => {
    switch (tipo) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full bg-[radial-gradient(1200px_600px_at_-20%_-10%,hsl(var(--brand)/.15)_0%,transparent_60%)] overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col h-full min-w-0">
          <header className="h-14 sm:h-16 border-b flex items-center px-2 sm:px-4 gap-1.5 sm:gap-2 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 flex-shrink-0">
            <SidebarTrigger className="hover-scale touch-friendly" />

            {/* Expiration badge */}
            {getExpirationLabel() && (
              <Badge variant={getExpirationVariant()} className="hidden sm:flex text-[11px] px-2 py-0.5">
                {isTrial ? '⏳ Trial: ' : ''}{getExpirationLabel()}
              </Badge>
            )}

            {/* Right side actions */}
            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              {/* Renew button */}
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
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
                      className="h-9 w-9 text-muted-foreground hover:text-primary"
                      onClick={() => navigate('/whatsapp/parear')}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Parear WhatsApp</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Notifications popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h4 className="font-semibold text-sm">Notificações</h4>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={markAllAsRead}>
                        <Check className="h-3 w-3 mr-1" />
                        Marcar todas
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="max-h-72">
                    {notificacoes.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground text-sm">
                        Nenhuma notificação
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notificacoes.map((n) => (
                          <div
                            key={n.id}
                            className={`px-4 py-3 flex gap-3 cursor-pointer hover:bg-accent/50 transition-colors ${
                              !n.lida ? 'bg-primary/5' : ''
                            }`}
                            onClick={() => {
                              if (!n.lida) markAsRead(n.id);
                              if (n.link) navigate(n.link);
                            }}
                          >
                            <span className="text-lg flex-shrink-0 mt-0.5">{getNotifIcon(n.tipo)}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!n.lida ? 'font-semibold' : 'font-medium'}`}>{n.titulo}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">{n.mensagem}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              {/* Company name dropdown with profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1.5 sm:gap-2 h-auto p-1.5 sm:p-2 hover:bg-accent touch-friendly">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-xs sm:text-sm font-medium">
                        {getUserInitials(user?.user_metadata?.full_name, user?.email)}
                      </span>
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-sm font-semibold leading-tight">
                        {getCompanyName()}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                        {getDisplayName()}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem disabled>
                    <User className="mr-2 h-4 w-4" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">{getDisplayName()}</span>
                      <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/perfil')}>
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
