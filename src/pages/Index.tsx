import { Users, UserX, DollarSign, Eye, EyeOff, AlertTriangle } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { useMetricasClientes, useMetricasPagamentos, useMetricasRenovacoes } from "@/hooks/useMetricas";
import { useState } from "react";

export default function Index() {
  const { entradas, saidas, lucros, loading: loadingFinanceiro } = useFinanceiro();
  const {
    totalClientes,
    clientesAtivos,
    clientesVencidos,
    clientesNovosHoje,
    clientesNovosData,
    loading: loadingClientes,
  } = useMetricasClientes();
  const {
    totalPagamentos,
    valorTotalMes,
    mediaPorDia,
    pagamentosData,
    loading: loadingPagamentos,
  } = useMetricasPagamentos();
  const {
    totalRenovacoes,
    renovacoesHoje,
    mediaPorDia: mediaRenovacoesPorDia,
    renovacoesData,
    loading: loadingRenovacoes,
  } = useMetricasRenovacoes();

  const [showSaldoMes, setShowSaldoMes] = useState(true);
  const [showSaldoAno, setShowSaldoAno] = useState(true);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const mesAtual = new Date().toLocaleString("pt-BR", { month: "long" });
  const mesCapitalizado = mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1);
  const anoAtual = new Date().getFullYear();

  // Clientes desativados = vencidos (mesma lógica)
  const clientesDesativados = 0;

  // Build chart data combining clientes novos + renovados
  const chartClientesData = clientesNovosData.map((item, i) => ({
    day: item.day,
    ativados: item.total,
    cadastrados: item.total,
    renovados: renovacoesData[i]?.total || 0,
  }));

  // Build chart data for financeiro
  const chartFinanceiroData = pagamentosData.map((item) => ({
    day: item.day,
    vendas: item.valor,
    entradas: item.valor,
    saidas: 0,
    custos: 0,
  }));

  if (loadingFinanceiro || loadingClientes || loadingPagamentos || loadingRenovacoes) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-64" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <header>
        <h1 className="text-mobile-2xl md:text-2xl font-bold">Bom Dia! 👋</h1>
        <p className="text-mobile-sm text-muted-foreground flex items-center gap-1">
          🏠 / Home
        </p>
      </header>

      {/* Top 3 Cards */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {/* Clientes Ativos - Green */}
        <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-[hsl(142,70%,45%)] to-[hsl(142,70%,35%)] text-white min-h-[120px]">
          <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 opacity-20">
            <Users className="h-24 w-24" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-6 w-6 opacity-80" />
            <span className="text-sm font-medium opacity-90">Clientes Ativos</span>
          </div>
          <div className="text-4xl font-bold">{clientesAtivos}</div>
        </div>

        {/* Clientes Vencidos - Yellow/Orange */}
        <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-[hsl(38,92%,50%)] to-[hsl(25,90%,45%)] text-white min-h-[120px]">
          <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 opacity-20">
            <Users className="h-24 w-24" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-6 w-6 opacity-80" />
            <span className="text-sm font-medium opacity-90">Clientes Vencidos</span>
          </div>
          <div className="text-4xl font-bold">{clientesVencidos}</div>
        </div>

        {/* Clientes Desativados - Red/Pink */}
        <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-[hsl(340,80%,55%)] to-[hsl(350,80%,45%)] text-white min-h-[120px]">
          <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 opacity-20">
            <UserX className="h-24 w-24" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <UserX className="h-6 w-6 opacity-80" />
            <span className="text-sm font-medium opacity-90">Clientes Desativados</span>
          </div>
          <div className="text-4xl font-bold">{clientesDesativados}</div>
        </div>
      </section>

      {/* Saldo Cards */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {/* Saldo Líquido do Mês */}
        <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-dashboard-success/20">
            <DollarSign className="h-6 w-6 text-dashboard-success" />
          </div>
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-sm text-muted-foreground">Saldo Líquido do Mês</span>
              <span className="text-xs bg-dashboard-success text-white px-2 py-0.5 rounded font-medium">
                {mesCapitalizado}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold">
                {showSaldoMes ? formatCurrency(lucros) : "••••••"}
              </span>
              <button onClick={() => setShowSaldoMes(!showSaldoMes)} className="text-muted-foreground hover:text-foreground transition-colors">
                {showSaldoMes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-dashboard-success/20">
            <DollarSign className="h-6 w-6 text-dashboard-success" />
          </div>
        </div>

        {/* Saldo Líquido do Ano */}
        <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[hsl(268,83%,60%)]/20">
            <DollarSign className="h-6 w-6 text-[hsl(268,83%,60%)]" />
          </div>
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-sm text-muted-foreground">Saldo Líquido do Ano</span>
              <span className="text-xs bg-[hsl(268,83%,60%)] text-white px-2 py-0.5 rounded font-medium">
                {anoAtual}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold">
                {showSaldoAno ? formatCurrency(lucros) : "••••••"}
              </span>
              <button onClick={() => setShowSaldoAno(!showSaldoAno)} className="text-muted-foreground hover:text-foreground transition-colors">
                {showSaldoAno ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[hsl(268,83%,60%)]/20">
            <DollarSign className="h-6 w-6 text-[hsl(268,83%,60%)]" />
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Clientes Chart */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground">Clientes</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartClientesData}>
                <defs>
                  <linearGradient id="gradAtivados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(199,89%,48%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(199,89%,48%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradCadastrados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38,92%,50%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(38,92%,50%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradRenovados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142,70%,45%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(142,70%,45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Area type="monotone" dataKey="ativados" name="Clientes Ativados" stroke="hsl(199,89%,48%)" fill="url(#gradAtivados)" strokeWidth={2} />
                <Area type="monotone" dataKey="cadastrados" name="Apenas Cadastrados" stroke="hsl(38,92%,50%)" fill="url(#gradCadastrados)" strokeWidth={2} />
                <Area type="monotone" dataKey="renovados" name="Clientes Renovados" stroke="hsl(142,70%,45%)" fill="url(#gradRenovados)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financeiro Chart */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground">Financeiro</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartFinanceiroData}>
                <defs>
                  <linearGradient id="gradVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142,70%,45%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(142,70%,45%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38,92%,50%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(38,92%,50%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0,84%,60%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(0,84%,60%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradCustos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(340,80%,55%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(340,80%,55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Area type="monotone" dataKey="vendas" name="Vendas" stroke="hsl(142,70%,45%)" fill="url(#gradVendas)" strokeWidth={2} />
                <Area type="monotone" dataKey="entradas" name="Entradas" stroke="hsl(38,92%,50%)" fill="url(#gradEntradas)" strokeWidth={2} />
                <Area type="monotone" dataKey="saidas" name="Saídas" stroke="hsl(0,84%,60%)" fill="url(#gradSaidas)" strokeWidth={2} />
                <Area type="monotone" dataKey="custos" name="Custos Servidor" stroke="hsl(340,80%,55%)" fill="url(#gradCustos)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Clientes com Plano Vencido Banner */}
      <section>
        <div className="rounded-xl bg-gradient-to-r from-[hsl(0,84%,55%)] to-[hsl(0,84%,45%)] p-5 flex items-center justify-between text-white">
          <div>
            <h3 className="text-lg font-bold">Meus Clientes Com Plano Vencido</h3>
            <p className="text-sm opacity-80">Informe aos seus clientes sobre o vencimento</p>
          </div>
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </section>
    </div>
  );
}
