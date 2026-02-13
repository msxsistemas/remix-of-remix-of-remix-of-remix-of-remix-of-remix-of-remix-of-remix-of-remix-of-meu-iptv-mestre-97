import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Server, Wrench, Ban, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ServidorDB {
  id: string;
  nome: string;
  descricao: string | null;
  status: string;
}

export default function AdminServidores() {
  const [servidores, setServidores] = useState<ServidorDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Servidores | Admin";
    fetchServidores();
  }, []);

  const fetchServidores = async () => {
    const { data } = await supabase.from("system_servidores").select("*").order("nome");
    if (data) setServidores(data as ServidorDB[]);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("system_servidores")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
      return;
    }

    setServidores(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    toast({ title: `Status atualizado para "${newStatus}"` });
  };

  const getStatusIcon = (status: string) => {
    if (status === "manutencao") return <Wrench className="w-5 h-5 text-orange-500" />;
    if (status === "inativo") return <Ban className="w-5 h-5 text-destructive" />;
    return <Server className="w-5 h-5 text-green-500" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === "manutencao") return <Badge variant="outline" className="text-orange-400 border-orange-400/50 bg-orange-400/10 text-[11px]">Manutenção</Badge>;
    if (status === "inativo") return <Badge variant="outline" className="text-destructive border-destructive/50 bg-destructive/10 text-[11px]">Inativo</Badge>;
    return <Badge className="bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/10 text-[11px]">Ativo</Badge>;
  };

  const statusOrder: Record<string, number> = { ativo: 0, manutencao: 1, inativo: 2 };
  const sorted = [...servidores].sort((a, b) => (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3));
  const buscados = busca ? sorted.filter(s => s.nome.toLowerCase().includes(busca.toLowerCase())) : sorted;
  const filtrados = filtro === "todos" ? buscados : buscados.filter(s => s.status === filtro);
  const contagem = { todos: servidores.length, ativo: servidores.filter(s => s.status === "ativo").length, manutencao: servidores.filter(s => s.status === "manutencao").length, inativo: servidores.filter(s => s.status === "inativo").length };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Carregando...</div>;

  return (
    <div>
      <header className="rounded-lg border mb-3 overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-card border-b border-border">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-foreground/70" />
            <h1 className="text-base font-semibold tracking-tight text-foreground">Gerenciar Servidores</h1>
          </div>
          <p className="text-xs/6 text-muted-foreground">Altere o status dos servidores visíveis para os usuários.</p>
        </div>
      </header>

      <main className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {([["todos", "Todos"], ["ativo", "Ativos"], ["manutencao", "Manutenção"], ["inativo", "Inativos"]] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFiltro(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${filtro === key ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground"}`}
              >
                {label} ({contagem[key]})
              </button>
            ))}
          </div>
          <div className="relative sm:ml-auto sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Buscar servidor..." value={busca} onChange={e => setBusca(e.target.value)} className="h-8 text-xs pl-8" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtrados.map((srv) => (
            <Card key={srv.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      srv.status === "manutencao" ? "bg-orange-500/10" : srv.status === "inativo" ? "bg-destructive/10" : "bg-green-500/10"
                    }`}>
                      {getStatusIcon(srv.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{srv.nome}</h3>
                      <p className="text-xs text-muted-foreground">{srv.descricao}</p>
                    </div>
                  </div>
                  {getStatusBadge(srv.status)}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Alterar Status</label>
                  <Select value={srv.status} onValueChange={(v) => handleStatusChange(srv.id, v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="manutencao">Em Manutenção</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
