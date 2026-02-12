import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, UserCheck, AlertTriangle, UserX, TrendingUp, DollarSign, 
  Receipt, CreditCard, Eye, EyeOff, Crown, Clock, UserPlus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from "recharts";

interface AdminStats {
  totalUsers: number;
  totalClientes: number;
  clientesAtivos: number;
  clientesVencidos: number;
  totalEntradas: number;
  totalSaidas: number;
  lucro: number;
  totalCobrancas: number;
  cobrancasPagas: number;
  subsAtivas: number;
  subsPendentes: number;
  subsExpiradas: number;
  novosUsersHoje: number;
  novosUsersSemana: number;
  novosUsersMes: number;
  novosClientesHoje: number;
  novosClientesSemana: number;
  novosClientesMes: number;
  clientesVencendoHoje: number;
  clientesVencendo3Dias: number;
  usersGrowth: Array<{ day: string; total: number }>;
  clientesGrowth: Array<{ day: string; total: number }>;
  recentUsers: Array<{ id: string; email: string; created_at: string; full_name: string }>;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLucro, setShowLucro] = useState(false);

  useEffect(() => {
    document.title = "Dashboard Admin | Msx Gestor";
    const fetchStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const resp = await fetch(
          `https://dxxfablfqigoewcfmjzl.supabase.co/functions/v1/admin-api`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ action: "global_stats" }),
          }
        );
        const result = await resp.json();
        if (result.success) setStats(result.stats);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-64" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted" />
          ))}
        </div>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted" />
          ))}
        </div>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-72 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return <p className="text-muted-foreground">Erro ao carregar dados.</p>;

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom Dia" : hora < 18 ? "Boa Tarde" : "Boa Noite";
  const currentMonth = new Date().toLocaleString("pt-BR", { month: "long" });

  const tooltipStyle = {
    backgroundColor: "hsl(220, 18%, 18%)",
    border: "1px solid hsl(220, 15%, 25%)",
    borderRadius: "8px",
    fontSize: "12px",
    color: "hsl(210, 40%, 98%)",
  };

  // Chart data
  const growthData = stats.usersGrowth.map((u, i) => ({
    day: u.day,
    "Novos Usuários": u.total,
    "Novos Clientes": stats.clientesGrowth[i]?.total ?? 0,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
        {saudacao}, Admin!
      </h1>

      {/* 1ª linha — Cards principais da plataforma */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-primary p-5 text-white transition-transform duration-200 hover:scale-[1.02] shadow-lg">
          <div className="flex items-center gap-4">
            <Users className="h-6 w-6 text-white/80" />
            <div>
              <p className="text-base font-medium text-white">Usuários do Sistema</p>
              <p className="text-2xl font-bold ml-1">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-success p-5 text-white transition-transform duration-200 hover:scale-[1.02] shadow-lg">
          <div className="flex items-center gap-4">
            <UserCheck className="h-6 w-6 text-white/80" />
            <div>
              <p className="text-base font-medium text-white">Clientes Ativos</p>
              <p className="text-2xl font-bold ml-1">{stats.clientesAtivos}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-destructive p-5 text-white transition-transform duration-200 hover:scale-[1.02] shadow-lg">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-6 w-6 text-white/80" />
            <div>
              <p className="text-base font-medium text-white">Clientes Vencidos</p>
              <p className="text-2xl font-bold ml-1">{stats.clientesVencidos}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2ª linha — Cards de crescimento e alertas */}
      <section className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Novos Usuários */}
        <div className="relative overflow-hidden rounded-xl bg-card border border-border p-5 flex items-center gap-4">
          <div className="rounded-full bg-primary/20 p-2">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Novos Usuários Hoje</span>
              <span className="text-foreground font-semibold">{stats.novosUsersHoje}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Esta Semana</span>
              <span className="text-foreground font-semibold">{stats.novosUsersSemana}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Este Mês</span>
              <span className="text-foreground font-semibold">{stats.novosUsersMes}</span>
            </div>
          </div>
        </div>

        {/* Novos Clientes (global) */}
        <div className="relative overflow-hidden rounded-xl bg-card border border-border p-5 flex items-center gap-4">
          <div className="rounded-full bg-[hsl(142,70%,45%)]/20 p-2">
            <Users className="h-6 w-6 text-[hsl(142,70%,45%)]" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Novos Clientes Hoje</span>
              <span className="text-foreground font-semibold">{stats.novosClientesHoje}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Esta Semana</span>
              <span className="text-foreground font-semibold">{stats.novosClientesSemana}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Este Mês</span>
              <span className="text-foreground font-semibold">{stats.novosClientesMes}</span>
            </div>
          </div>
        </div>

        {/* Assinaturas & Alertas */}
        <div className="relative overflow-hidden rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-full bg-primary/20 p-1">
              <Crown className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Assinaturas SaaS</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Ativas</span>
              <span className="text-foreground font-semibold">{stats.subsAtivas}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Pendentes</span>
              <span className="text-foreground font-semibold">{stats.subsPendentes}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Expiradas</span>
              <span className="text-foreground font-semibold">{stats.subsExpiradas}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3ª linha — Cards financeiros globais */}
      <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-primary/20 p-3">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm text-muted-foreground">Lucro Líquido Global</p>
                <Badge className="bg-success text-success-foreground text-xs px-2 py-0.5">
                  {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">
                  {showLucro ? fmt(stats.lucro) : "R$ •••••"}
                </p>
                <button
                  onClick={() => setShowLucro(!showLucro)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showLucro ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-primary/20 p-3">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Cobranças</p>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-bold text-foreground">{stats.totalCobrancas}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pagas</p>
                  <p className="text-xl font-bold text-[hsl(142,70%,45%)]">{stats.cobrancasPagas}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                  <p className="text-xl font-bold text-destructive">{stats.totalCobrancas - stats.cobrancasPagas}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 4ª linha — Gráficos */}
      <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Crescimento da Plataforma (7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="gClients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 25%)" opacity={0.3} />
                  <XAxis dataKey="day" stroke="hsl(215, 20%, 65%)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215, 20%, 65%)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "11px", color: "hsl(215, 20%, 65%)" }} iconType="circle" />
                  <Area type="monotone" dataKey="Novos Usuários" stroke="hsl(199, 89%, 48%)" fill="url(#gUsers)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Novos Clientes" stroke="hsl(142, 70%, 45%)" fill="url(#gClients)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Resumo Financeiro Global
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-[hsl(142,70%,45%)]/10 p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Entradas</p>
                <p className="text-lg font-bold text-[hsl(142,70%,45%)]">{fmt(stats.totalEntradas)}</p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Saídas</p>
                <p className="text-lg font-bold text-destructive">{fmt(stats.totalSaidas)}</p>
              </div>
            </div>
            <div className="rounded-lg bg-primary/10 p-4">
              <p className="text-xs text-muted-foreground mb-1">Lucro Líquido</p>
              <p className="text-2xl font-bold text-primary">{fmt(stats.lucro)}</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Clientes</span>
                <span className="font-semibold text-foreground">{stats.totalClientes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Vencendo Hoje</span>
                <span className="font-semibold text-destructive">{stats.clientesVencendoHoje}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Vencendo em 3 Dias</span>
                <span className="font-semibold text-foreground">{stats.clientesVencendo3Dias}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 5ª linha — Últimos Usuários */}
      <section>
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="bg-primary p-4">
            <h3 className="font-semibold text-primary-foreground">Últimos Usuários Cadastrados</h3>
            <p className="text-sm text-primary-foreground/80">Os 10 usuários mais recentes da plataforma</p>
          </div>
          <div className="bg-card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Nome</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Data Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3">
                      <span className="text-primary font-medium">{user.full_name || "—"}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-foreground">{user.email}</span>
                    </td>
                    <td className="p-3">
                      <span className="inline-block px-3 py-1 rounded-full border border-border text-sm">
                        {new Date(user.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
