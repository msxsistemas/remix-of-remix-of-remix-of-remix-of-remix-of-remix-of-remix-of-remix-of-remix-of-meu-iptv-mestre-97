import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Plus, Pencil, Trash2, Star, Package } from "lucide-react";

interface SystemPlan {
  id: string;
  nome: string;
  descricao: string | null;
  valor: number;
  intervalo: string;
  limite_clientes: number;
  limite_mensagens: number;
  limite_whatsapp_sessions: number;
  limite_paineis: number;
  recursos: string[];
  ativo: boolean;
  destaque: boolean;
  ordem: number;
}

export default function AdminPlanos() {
  const [plans, setPlans] = useState<SystemPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchPlans = async () => {
    const { data } = await supabase.from("system_plans").select("*").order("ordem");
    if (data) setPlans(data as SystemPlan[]);
    setLoading(false);
  };

  useEffect(() => {
    document.title = "Planos SaaS | Admin Msx Gestor";
    fetchPlans();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este plano?")) return;
    await supabase.from("system_plans").delete().eq("id", id);
    toast({ title: "Plano excluído" });
    fetchPlans();
  };

  return (
    <div>
      <header className="rounded-lg border mb-3 overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-card border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-foreground/70" />
                <h1 className="text-base font-semibold tracking-tight text-foreground">Planos SaaS</h1>
              </div>
              <p className="text-xs/6 text-muted-foreground">Gerencie os planos de assinatura disponíveis no sistema.</p>
            </div>
            <Button onClick={() => navigate("/admin/planos/novo")} size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Novo Plano
            </Button>
          </div>
        </div>
      </header>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-foreground/70" />
            <CardTitle className="text-sm">Planos ({plans.length})</CardTitle>
          </div>
          <CardDescription>Planos exibidos na página pública de preços.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum plano cadastrado</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Intervalo</TableHead>
                    <TableHead>Limites</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {p.nome}
                          {p.destaque && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                        </div>
                      </TableCell>
                      <TableCell>R$ {Number(p.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="capitalize">{p.intervalo}</TableCell>
                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          <div>{p.limite_clientes} clientes</div>
                          <div>{p.limite_mensagens} msgs</div>
                          <div>{p.limite_whatsapp_sessions} WhatsApp</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.ativo ? "default" : "secondary"}>{p.ativo ? "Ativo" : "Inativo"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/planos/editar/${p.id}`)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
