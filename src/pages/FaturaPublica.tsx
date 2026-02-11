import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle, Clock, XCircle, Wallet, RefreshCw, QrCode, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Fatura {
  id: string;
  cliente_nome: string;
  plano_nome: string | null;
  valor: number;
  status: string;
  gateway: string | null;
  pix_qr_code: string | null;
  pix_copia_cola: string | null;
  pix_manual_key: string | null;
  paid_at: string | null;
  created_at: string;
}

const POLL_INTERVAL = 5000;

export default function FaturaPublica() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPix, setShowPix] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousStatusRef = useRef<string | null>(null);

  const fetchFatura = useCallback(async (isPolling = false) => {
    if (!id) return;
    try {
      const resp = await fetch(
        `https://dxxfablfqigoewcfmjzl.supabase.co/functions/v1/generate-fatura`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get-fatura", fatura_id: id }),
        }
      );
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        if (!isPolling) setError(data.error || "Fatura não encontrada");
        return;
      }
      const newFatura = data.fatura as Fatura;

      if (previousStatusRef.current === "pendente" && newFatura.status === "pago") {
        toast({ title: "✅ Pagamento confirmado!", description: "Seu plano será renovado automaticamente." });
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }

      previousStatusRef.current = newFatura.status;
      setFatura(newFatura);
    } catch {
      if (!isPolling) setError("Erro ao carregar fatura");
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchFatura(false);
  }, [fetchFatura]);

  useEffect(() => {
    if (!fatura || fatura.status === "pago") return;
    intervalRef.current = setInterval(() => {
      fetchFatura(true);
    }, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fatura?.status, fetchFatura]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copiado!", description: "Código PIX copiado para a área de transferência." });
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
          <p className="text-slate-500 text-sm">Carregando fatura...</p>
        </div>
      </div>
    );
  }

  if (error || !fatura) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4">
        <div className="max-w-sm w-full bg-white rounded-xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Fatura não encontrada</h2>
          <p className="text-sm text-slate-500 mt-2">{error || "O link pode estar expirado ou inválido."}</p>
        </div>
      </div>
    );
  }

  const isPaid = fatura.status === "pago";
  const isPending = fatura.status === "pendente";
  const statusLabel = isPaid ? "PAGO" : "EM ABERTO";
  const statusColor = isPaid ? "bg-emerald-500" : "bg-red-500";
  const hasPix = fatura.pix_qr_code || fatura.pix_copia_cola || (fatura.gateway === "pix_manual" && fatura.pix_manual_key);

  return (
    <div className="min-h-screen bg-[#f0f2f5] py-6 px-4 sm:py-10">
      <div className="max-w-3xl mx-auto">

        {/* Invoice Document */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">

          {/* Status Ribbon */}
          <div className="absolute top-0 right-0 overflow-hidden w-28 h-28 pointer-events-none">
            <div className={`${statusColor} text-white text-[11px] font-bold tracking-wider text-center py-1.5 w-40 absolute top-[26px] right-[-40px] rotate-45 shadow-md`}>
              {statusLabel}
            </div>
          </div>

          {/* Header */}
          <div className="px-6 sm:px-10 pt-8 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">Fatura</h1>
                <p className="text-slate-400 text-sm mt-1">Documento de cobrança</p>
              </div>
            </div>

            {/* Divider with info */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 border-b-2 border-emerald-500 pb-3">
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <span className="font-semibold text-slate-700">Nº:</span>
                <span className="font-mono text-xs">{fatura.id.slice(0, 13).toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <span className="font-semibold text-slate-700">Data:</span>
                <span>{new Date(fatura.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
              {fatura.paid_at && (
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">Pago em:</span>
                  <span>{new Date(fatura.paid_at).toLocaleDateString("pt-BR")}</span>
                </div>
              )}
            </div>

            {/* Client / Company */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Fatura para</p>
                <p className="text-base font-semibold text-slate-800">{fatura.cliente_nome}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="px-6 sm:px-10 pb-6">
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Descrição</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Plano</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Valor</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-3.5 text-slate-700">Adesão/Renovação de plano</td>
                    <td className="px-4 py-3.5 text-slate-600">{fatura.plano_nome || "—"}</td>
                    <td className="px-4 py-3.5 text-right text-slate-600">R$ {Number(fatura.valor).toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-800">R$ {Number(fatura.valor).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="px-6 sm:px-10 pb-6">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-0">
              {/* Info text */}
              <div className="flex-1 text-sm text-slate-500 pr-4">
                <p className="font-semibold text-slate-700 mb-1">Informação</p>
                <p>Caso não tenha usado o pagamento online, nos envie o comprovante de pagamento.</p>
              </div>

              {/* Totals */}
              <div className="sm:w-64 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sub Total:</span>
                  <span className="text-slate-700">R$ {Number(fatura.valor).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Desconto:</span>
                  <span className="text-slate-700">-R$ 0,00</span>
                </div>
                <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between text-base">
                  <span className="font-bold text-slate-800">Total:</span>
                  <span className="font-bold text-emerald-600">R$ {Number(fatura.valor).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Banner */}
          {isPaid && (
            <div className="mx-6 sm:mx-10 mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-500 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-700">Pagamento Confirmado</p>
                <p className="text-sm text-emerald-600">Seu plano será renovado automaticamente. Obrigado!</p>
              </div>
            </div>
          )}

          {/* Note */}
          <div className="px-6 sm:px-10 pb-4">
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <span className="mt-0.5">📄</span>
              <p><strong>NOTA:</strong> Este é um recibo gerado por computador e não requer assinatura física.</p>
            </div>
          </div>

          {/* Action Buttons */}
          {!isPaid && (
            <div className="px-6 sm:px-10 pb-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-11 gap-2 text-sm font-medium"
                  onClick={() => window.print()}
                >
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
                {hasPix && (
                  <Button
                    className="flex-1 h-11 gap-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => setShowPix(!showPix)}
                  >
                    <QrCode className="h-4 w-4" />
                    {showPix ? "Ocultar PIX" : "Pagar com PIX"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* PIX Payment Section */}
          {!isPaid && showPix && (
            <div className="border-t border-slate-100 bg-slate-50 px-6 sm:px-10 py-6 space-y-5">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <QrCode className="h-4 w-4 text-emerald-500" />
                Pagamento via PIX
              </h3>

              {/* QR Code */}
              {fatura.pix_qr_code && (
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <img
                      src={`data:image/png;base64,${fatura.pix_qr_code}`}
                      alt="QR Code PIX"
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Escaneie o QR Code com o app do seu banco</p>
                </div>
              )}

              {/* Copia e Cola */}
              {fatura.pix_copia_cola && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">PIX Copia e Cola</label>
                  <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs break-all font-mono text-slate-600 max-h-20 overflow-y-auto">
                    {fatura.pix_copia_cola}
                  </div>
                  <Button
                    className={`w-full h-10 text-sm font-medium rounded-lg transition-all ${
                      copied
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    }`}
                    onClick={() => handleCopy(fatura.pix_copia_cola!)}
                  >
                    {copied ? <><CheckCircle className="h-4 w-4 mr-2" /> Copiado!</> : <><Copy className="h-4 w-4 mr-2" /> Copiar Código PIX</>}
                  </Button>
                </div>
              )}

              {/* PIX Manual */}
              {fatura.gateway === "pix_manual" && fatura.pix_manual_key && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-slate-700">Chave PIX</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-3 text-sm break-all font-mono text-slate-600">
                    {fatura.pix_manual_key}
                  </div>
                  <Button
                    className={`w-full h-10 text-sm font-medium rounded-lg transition-all ${
                      copied
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    }`}
                    onClick={() => handleCopy(fatura.pix_manual_key!)}
                  >
                    {copied ? <><CheckCircle className="h-4 w-4 mr-2" /> Copiado!</> : <><Copy className="h-4 w-4 mr-2" /> Copiar Chave PIX</>}
                  </Button>
                  <p className="text-xs text-slate-500 text-center">
                    Envie <strong className="text-emerald-600">R$ {Number(fatura.valor).toFixed(2)}</strong> para a chave acima
                  </p>
                </div>
              )}

              {/* No payment method */}
              {!fatura.pix_qr_code && !fatura.pix_copia_cola && fatura.gateway !== "pix_manual" && (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-500">Nenhum método de pagamento configurado.</p>
                  <p className="text-xs text-slate-400 mt-1">Entre em contato com o vendedor.</p>
                </div>
              )}

              {/* Polling indicator */}
              {isPending && (
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-200">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Verificando pagamento automaticamente...</span>
                </div>
              )}
            </div>
          )}

          {/* Auto-show PIX when no button interaction yet and pending */}
          {!isPaid && !showPix && isPending && hasPix && (
            <div className="px-6 sm:px-10 pb-4">
              <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1.5">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Verificando pagamento automaticamente...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-4">
          Obrigado por escolher nossos serviços!
        </p>
      </div>
    </div>
  );
}
