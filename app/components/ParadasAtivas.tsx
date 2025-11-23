"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Plus, Clock, Users, AlertTriangle, Wrench, ShieldCheck, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Parada = {
  id: number;
  nome: string;
  descricao: string | null;
  tipo: 'preventiva' | 'corretiva' | 'emergencial';
  status: 'em_andamento' | 'concluida' | 'cancelada';
  equipeResponsavel: string | null;
  macro: string | null;
  dataInicio: string | null;
  duracaoPrevistaHoras: number | null;
  testes?: { status: string }[];
  _count?: { testes: number };
};

export default function ParadasAtivas() {
  const router = useRouter();
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParadas();
  }, []);

  const fetchParadas = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/paradas?status=em_andamento");
      if (res.ok) {
        const data = await res.json();
        setParadas(data);
      }
    } catch (error) {
      console.error("Erro ao buscar paradas", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "preventiva":
        return <ShieldCheck className="h-5 w-5 text-success" />;
      case "corretiva":
        return <Wrench className="h-5 w-5 text-warning" />;
      case "emergencial":
        return <AlertTriangle className="h-5 w-5 text-danger" />;
      default:
        return <Clock className="h-5 w-5 text-primary" />;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    });
  };

  const getStatusLabel = (status: Parada["status"]) => {
    if (status === "em_andamento") return "Em andamento";
    if (status === "concluida") return "Concluída";
    return "Cancelada";
  };

  const getStatusClasses = (status: Parada["status"]) => {
    if (status === "em_andamento") {
      return "bg-warning/15 text-warning ring-warning/40";
    }
    if (status === "concluida") {
      return "bg-success/15 text-success ring-success/40";
    }
    return "bg-danger/15 text-danger ring-danger/40";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link href="/paradas/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Parada
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Carregando paradas...</div>
      ) : paradas.length === 0 ? (
        <div className="text-center py-10 border rounded-xl bg-card/50">
          <p className="text-muted-foreground">Nenhuma parada ativa no momento.</p>
          <Button variant="link" onClick={() => router.push('/paradas/create')}>Criar a primeira</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paradas.map((parada) => (
            <Link
              key={parada.id}
              href={`/paradas/${parada.id}`}
              className="group relative flex flex-col rounded-xl border bg-surface/80 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-secondary/70 p-2 text-primary-foreground">
                    {getIcon(parada.tipo)}
                  </div>
                  <div>
                    <h3 className="font-semibold leading-none text-secondary">
                      {parada.nome}
                    </h3>
                    <span className="mt-1 inline-flex rounded-full bg-secondary/60 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-secondary-foreground">
                      {parada.tipo}
                    </span>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${getStatusClasses(
                    parada.status
                  )}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      parada.status === "em_andamento"
                        ? "bg-warning"
                        : parada.status === "concluida"
                        ? "bg-success"
                        : "bg-danger"
                    }`}
                  />
                  {getStatusLabel(parada.status)}
                </span>
              </div>

              <div className="flex-1 space-y-2 text-sm text-muted-foreground">
                {parada.macro && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Macro: {parada.macro}</span>
                  </div>
                )}
                {parada.equipeResponsavel && (
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    <span>Equipe: {parada.equipeResponsavel}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Início: {formatDate(parada.dataInicio)}</span>
                </div>
                {parada.duracaoPrevistaHoras && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Previsto: {parada.duracaoPrevistaHoras}h</span>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs">
                <div className="flex flex-col gap-1 w-full mr-4">
                   <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{parada._count?.testes || 0} testes</span>
                      <span>
                        {parada._count?.testes 
                          ? Math.round(((parada.testes?.filter(t => t.status === 'ok').length || 0) / parada._count.testes) * 100) 
                          : 0}%
                      </span>
                   </div>
                   <div className="h-1.5 w-full rounded-full bg-muted">
                      <div 
                        className="h-full rounded-full bg-emerald-500" 
                        style={{ width: `${parada._count?.testes ? Math.round(((parada.testes?.filter(t => t.status === 'ok').length || 0) / parada._count.testes) * 100) : 0}%` }} 
                      />
                   </div>
                </div>
                <span className="text-[11px] font-medium text-primary group-hover:underline whitespace-nowrap">
                  Ver detalhes →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
