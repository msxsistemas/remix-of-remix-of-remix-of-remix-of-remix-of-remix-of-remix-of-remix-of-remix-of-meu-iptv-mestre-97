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
  const cards = [
    {
      label: "Clientes Ativos",
      value: clientesAtivos,
      icon: Users,
      bgColor: "bg-[hsl(120,60%,45%)]",
    },
    {
      label: "Clientes Vencidos",
      value: clientesVencidos,
      icon: Users,
      bgColor: "bg-[hsl(0,80%,50%)]",
    },
    {
      label: "Clientes Desativados",
      value: clientesDesativados,
      icon: UserX,
      bgColor: "bg-[hsl(250,70%,60%)]",
    },
  ];

  return (
    <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`relative overflow-hidden rounded-xl ${card.bgColor} p-5 text-white transition-transform duration-200 hover:scale-[1.02]`}
        >
          {/* Decorative icon on right */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <card.icon className="h-16 w-16 text-white/20" />
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <card.icon className="h-5 w-5 text-white/80" />
            <div>
              <p className="text-sm font-medium text-white/90">{card.label}</p>
              <p className="text-xl font-bold">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
