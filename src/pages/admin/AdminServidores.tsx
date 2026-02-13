import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Server, Wrench, Settings } from "lucide-react";
import { PROVEDORES } from "@/config/provedores";
import type { ProviderConfig } from "@/config/provedores";

export default function AdminServidores() {
  useEffect(() => {
    document.title = "Servidores | Admin";
  }, []);

  // Only show integrated or maintenance providers (not "em breve")
  const servidoresAtivos = PROVEDORES.filter(p => p.integrado || p.emManutencao);

  return (
    <div>
      <header className="rounded-lg border mb-3 overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-card border-b border-border">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-foreground/70" />
            <h1 className="text-base font-semibold tracking-tight text-foreground">Gerenciar Servidores</h1>
          </div>
          <p className="text-xs/6 text-muted-foreground">Servidores IPTV ativos e em manutenção disponíveis para os usuários.</p>
        </div>
      </header>

      <main className="space-y-3">
        {servidoresAtivos.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Nenhum servidor ativo encontrado.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {servidoresAtivos.map((provedor) => (
              <Card key={provedor.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        provedor.emManutencao ? "bg-orange-500/10" : "bg-green-500/10"
                      }`}>
                        {provedor.emManutencao ? (
                          <Wrench className="w-5 h-5 text-orange-500" />
                        ) : (
                          <Server className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-foreground">{provedor.nome}</h3>
                        <p className="text-xs text-muted-foreground">{provedor.descricao}</p>
                      </div>
                    </div>
                    {provedor.emManutencao ? (
                      <Badge variant="outline" className="text-orange-400 border-orange-400/50 bg-orange-400/10 text-[11px]">
                        Manutenção
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/10 text-[11px]">
                        Ativo
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>ID:</span>
                      <span className="font-mono text-foreground">{provedor.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Integrado:</span>
                      <span className={provedor.integrado ? "text-green-500" : "text-muted-foreground"}>
                        {provedor.integrado ? "Sim" : "Não"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground text-center">
              Os servidores são configurados no código-fonte. Para adicionar ou remover provedores, edite os arquivos de configuração em <code className="bg-muted px-1 rounded">src/config/provedores/</code>.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
