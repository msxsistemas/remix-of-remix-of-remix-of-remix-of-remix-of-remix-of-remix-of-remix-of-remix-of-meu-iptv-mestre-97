import { Card, CardContent } from "@/components/ui/card";
import { Users, AlertTriangle, UserX } from "lucide-react";

interface Props {
  clientesAtivos: number;
  clientesVencidos: number;
  clientesDesativados?: number;
}

export default function DashboardClientCards({
  clientesAtivos,
  clientesVencidos,
  clientesDesativados = 0,
}: Props) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-500/10 p-3">
              <Users className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clientes Ativos</p>
              <p className="text-2xl font-bold text-foreground">{clientesAtivos}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-red-500/10 p-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clientes Vencidos</p>
              <p className="text-2xl font-bold text-foreground">{clientesVencidos}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-purple-500/10 p-3">
              <UserX className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clientes Desativados</p>
              <p className="text-2xl font-bold text-foreground">{clientesDesativados}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
