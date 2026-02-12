import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Timer,
  TimerOff,
  Layers,
  CirclePause,
  CalendarClock,
  Shuffle,
  Save,
  RotateCcw,
  Clock,
} from "lucide-react";

interface EnvioConfig {
  tempoMinimo: number;
  tempoMaximo: number;
  limiteLote: number;
  pausaProlongada: number;
  limiteDiario: string;
  variarIntervalo: boolean;
}

const DEFAULT_CONFIG: EnvioConfig = {
  tempoMinimo: 5,
  tempoMaximo: 10,
  limiteLote: 10,
  pausaProlongada: 15,
  limiteDiario: "",
  variarIntervalo: true,
};

const STORAGE_KEY = "whatsapp_envio_config";

export default function ConfiguracaoEnvio() {
  const [config, setConfig] = useState<EnvioConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
      } catch {
        // ignore
      }
    }
  }, []);

  const handleSave = () => {
    if (config.tempoMinimo < 5 || config.tempoMinimo > 120) {
      toast.error("Tempo mínimo deve ser entre 5 e 120 segundos");
      return;
    }
    if (config.tempoMaximo < config.tempoMinimo || config.tempoMaximo > 120) {
      toast.error("Tempo máximo deve ser maior que o mínimo e até 120 segundos");
      return;
    }
    if (config.limiteLote < 1) {
      toast.error("Limite de lote deve ser pelo menos 1");
      return;
    }
    if (config.pausaProlongada < 1 || config.pausaProlongada > 120) {
      toast.error("Pausa prolongada deve ser entre 1 e 120 segundos");
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    toast.success("Configurações salvas com sucesso!");
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Configurações restauradas ao padrão!");
  };

  // Cálculo de tempo estimado para 100 mensagens
  const calcEstimatedTime = () => {
    const avgInterval = config.variarIntervalo
      ? (config.tempoMinimo + config.tempoMaximo) / 2
      : config.tempoMinimo;
    const batches = Math.ceil(100 / config.limiteLote);
    const pauses = batches - 1;
    const totalSeconds = 100 * avgInterval + pauses * config.pausaProlongada;
    const minutes = Math.round(totalSeconds / 60);
    return `~${minutes} minutos`;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuração de Envio</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure os intervalos e limites para envio de mensagens pelo WhatsApp
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Intervalos de Envio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tempo Mínimo e Máximo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Timer className="h-4 w-4 text-primary" />
                Tempo Mínimo (segundos) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min={5}
                max={120}
                value={config.tempoMinimo}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, tempoMinimo: Number(e.target.value) }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Intervalo mínimo entre mensagens (5-120 segundos)
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <TimerOff className="h-4 w-4 text-primary" />
                Tempo Máximo (segundos) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min={5}
                max={120}
                value={config.tempoMaximo}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, tempoMaximo: Number(e.target.value) }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Intervalo máximo entre mensagens (5-120 segundos)
              </p>
            </div>
          </div>

          {/* Limite de lote e pausa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Layers className="h-4 w-4 text-primary" />
                Limite de Mensagens por Lote <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min={1}
                value={config.limiteLote}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, limiteLote: Number(e.target.value) }))
                }
              />
              <p className="text-xs text-muted-foreground">
                A cada X mensagens enviadas, o sistema irá pausar
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <CirclePause className="h-4 w-4 text-destructive" />
                Pausa Prolongada (segundos) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min={1}
                max={120}
                value={config.pausaProlongada}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, pausaProlongada: Number(e.target.value) }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Tempo de pausa após atingir o limite do lote (máx. 2 minutos)
              </p>
            </div>
          </div>

          {/* Limite diário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <CalendarClock className="h-4 w-4 text-green-500" />
                Limite Diário de Mensagens
              </Label>
              <Input
                type="number"
                min={0}
                placeholder="Sem limite"
                value={config.limiteDiario}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, limiteDiario: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Deixe vazio para não limitar (opcional)
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Shuffle className="h-4 w-4 text-primary" />
                Variar Intervalo entre Mensagens
              </Label>
              <div className="flex items-center gap-3 mt-1">
                <Switch
                  checked={config.variarIntervalo}
                  onCheckedChange={(v) =>
                    setConfig((c) => ({ ...c, variarIntervalo: v }))
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {config.variarIntervalo
                    ? "Ativado — intervalo aleatório entre mín. e máx."
                    : "Desativado — sempre usa o tempo mínimo"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Varia os segundos de uma mensagem pra outra para não ter o mesmo intervalo sempre
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prévia de Tempo Estimado */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Prévia de Tempo Estimado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <p className="text-xl font-bold text-primary">
                {config.variarIntervalo
                  ? `${config.tempoMinimo}s - ${config.tempoMaximo}s`
                  : `${config.tempoMinimo}s`}
              </p>
              <p className="text-xs text-muted-foreground">Intervalo entre mensagens</p>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {config.limiteLote} msgs
              </p>
              <p className="text-xs text-muted-foreground">Antes da pausa</p>
            </div>
            <div>
              <p className="text-xl font-bold text-destructive">
                {config.pausaProlongada}s
              </p>
              <p className="text-xs text-muted-foreground">Pausa prolongada</p>
            </div>
          </div>

          <div className="w-full h-1 bg-primary/20 rounded-full mb-3">
            <div className="h-full bg-primary rounded-full w-full" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            <Clock className="inline h-3 w-3 mr-1" />
            Tempo estimado para 100 mensagens:{" "}
            <span className="text-primary font-semibold">{calcEstimatedTime()}</span>
          </p>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex justify-center gap-4">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Salvar Configurações
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Restaurar Padrão
        </Button>
      </div>
    </div>
  );
}
