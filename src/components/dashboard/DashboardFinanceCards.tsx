import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";

interface Props {
  entradas: number;
  saidas: number;
  lucros: number;
  valorTotalMes: number;
  valorTotalAno?: number;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function DashboardFinanceCards({ 
  entradas, 
  saidas, 
  lucros, 
  valorTotalMes,
}: Props) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-500/10 p-3">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entradas</p>
              <p className="text-xl font-bold text-foreground">{fmt(entradas)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-red-500/10 p-3">
              <TrendingDown className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saídas</p>
              <p className="text-xl font-bold text-foreground">{fmt(saidas)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-500/10 p-3">
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lucros</p>
              <p className="text-xl font-bold text-foreground">{fmt(lucros)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-cyan-500/10 p-3">
              <Wallet className="h-6 w-6 text-cyan-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total do Mês</p>
              <p className="text-xl font-bold text-foreground">{fmt(valorTotalMes)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
