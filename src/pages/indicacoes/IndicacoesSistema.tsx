import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  UserPlus, 
  DollarSign, 
  Trophy,
  Gift,
  FileText,
  MessageSquare,
  Users,
  History,
  Copy,
  Check,
  Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";

export default function IndicacoesSistema() {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  
  // Mock data - would come from database in production
  const stats = {
    saldoDisponivel: 0,
    totalIndicacoes: 0,
    resgatesPagos: 0,
    nivel: "INICIANTE",
    progressoNivel: 0,
    proximoNivel: "Intermediário",
    indicacoesParaProximo: 5,
  };

  const userCode = "REF_" + Math.random().toString(36).substring(2, 14).toUpperCase();
  const baseUrl = window.location.origin;
  
  const links = {
    vendas: `${baseUrl}/site?ref=${userCode}`,
    cadastro: `${baseUrl}/register?ref=${userCode}`,
  };

  useEffect(() => {
    document.title = "Indique e Ganhe | Tech Play";
  }, []);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(type);
      toast.success("Link copiado!");
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (error) {
      toast.error("Erro ao copiar link");
    }
  };

  return (
    <main className="space-y-6">
      {/* Header com gradiente */}
      <div className="rounded-xl bg-gradient-to-r from-primary/80 via-primary to-primary/80 p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="h-6 w-6 text-primary-foreground" />
          <h1 className="text-2xl font-bold text-primary-foreground">Sistema "Indique e Ganhe"</h1>
        </div>
        <p className="text-primary-foreground/80">Ganhe comissões indicando novos clientes!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">R$ {stats.saldoDisponivel.toFixed(2).replace('.', ',')}</p>
            <p className="text-sm text-muted-foreground">Saldo Disponível</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalIndicacoes}</p>
            <p className="text-sm text-muted-foreground">Total de Indicações</p>
            <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
              {stats.nivel}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.resgatesPagos}</p>
            <p className="text-sm text-muted-foreground">Resgates Pagos</p>
            <p className="text-xs text-muted-foreground mt-2">Aguardando primeiro pagamento</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-lg font-bold text-foreground">Progresso de Nível</p>
            <div className="w-full bg-muted rounded-full h-2 mt-3 mb-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${stats.progressoNivel}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{stats.indicacoesParaProximo} para {stats.proximoNivel}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="indique" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="indique" className="flex-1 min-w-[140px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Gift className="h-4 w-4" />
            Indique & Ganhe!
          </TabsTrigger>
          <TabsTrigger value="materiais" className="flex-1 min-w-[140px] gap-2">
            <FileText className="h-4 w-4" />
            Materiais de Divulgação
          </TabsTrigger>
          <TabsTrigger value="modelos" className="flex-1 min-w-[140px] gap-2">
            <MessageSquare className="h-4 w-4" />
            Modelos de Mensagem
          </TabsTrigger>
          <TabsTrigger value="indicacoes" className="flex-1 min-w-[140px] gap-2">
            <Users className="h-4 w-4" />
            Suas Indicações
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex-1 min-w-[140px] gap-2">
            <History className="h-4 w-4" />
            Histórico de Resgates
          </TabsTrigger>
        </TabsList>

        {/* Tab: Indique & Ganhe! */}
        <TabsContent value="indique" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Link da Página de Vendas:</h3>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-muted rounded-lg px-4 py-3 text-sm text-muted-foreground font-mono break-all">
                  {links.vendas}
                </div>
                <Button 
                  onClick={() => handleCopy(links.vendas, 'vendas')}
                  className="shrink-0"
                >
                  {copiedLink === 'vendas' ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copiar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-primary">★</span>
                Ideal para divulgação! Leva para a página de apresentação completa do sistema com seu código de indicação.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Link de Cadastro Direto:</h3>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-muted rounded-lg px-4 py-3 text-sm text-muted-foreground font-mono break-all">
                  {links.cadastro}
                </div>
                <Button 
                  onClick={() => handleCopy(links.cadastro, 'cadastro')}
                  className="shrink-0"
                >
                  {copiedLink === 'cadastro' ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copiar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-primary">ⓘ</span>
                Leva direto para a página de cadastro - ideal para quem já conhece o sistema.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Materiais de Divulgação */}
        <TabsContent value="materiais" className="mt-4">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Em breve você terá acesso a banners, imagens e materiais para divulgação.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Modelos de Mensagem */}
        <TabsContent value="modelos" className="mt-4">
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Em breve você terá modelos de mensagens prontas para enviar aos seus contatos.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Suas Indicações */}
        <TabsContent value="indicacoes" className="mt-4">
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Você ainda não possui indicações. Compartilhe seu link e comece a ganhar!</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Histórico de Resgates */}
        <TabsContent value="historico" className="mt-4">
          <Card>
            <CardContent className="p-8 text-center">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum resgate realizado ainda. Quando você solicitar um resgate, ele aparecerá aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
