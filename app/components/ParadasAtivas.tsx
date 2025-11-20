"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/app/components/ui/sheet";
import { Plus, Clock, Users, AlertTriangle, Wrench, ShieldCheck, Calendar } from "lucide-react";
import Link from "next/link";

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
  _count?: { testes: number };
};

export default function ParadasAtivas() {
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Form state
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("preventiva");
  const [equipe, setEquipe] = useState("");
  const [macro, setMacro] = useState("");
  const [duracao, setDuracao] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdParada, setCreatedParada] = useState<Parada | null>(null);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/paradas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          descricao,
          tipo,
          equipeResponsavel: equipe,
          macro,
          duracaoPrevistaHoras: duracao,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // keep the sheet open and show the created parada summary
        setCreatedParada(data as Parada);
        fetchParadas();
      } else {
        alert(data?.error || "Erro ao criar parada");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao criar parada");
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setNome("");
    setDescricao("");
    setTipo("preventiva");
    setEquipe("");
    setMacro("");
    setDuracao("");
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'preventiva': return <ShieldCheck className="h-5 w-5 text-green-500" />;
      case 'corretiva': return <Wrench className="h-5 w-5 text-orange-500" />;
      case 'emergencial': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Parada
            </Button>
          </SheetTrigger>
          <SheetContent className="max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Nova Parada</h3>
                  <p className="text-sm text-muted-foreground">Preencha os dados abaixo para criar uma nova parada.</p>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Nome da Parada</label>
                    <input required value={nome} onChange={e => setNome(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm bg-background" placeholder="Ex: Manutenção Linha 1" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Tipo</label>
                      <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm bg-background">
                        <option value="preventiva">Preventiva</option>
                        <option value="corretiva">Corretiva</option>
                        <option value="emergencial">Emergencial</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Duração Prevista (horas)</label>
                      <input type="number" min={0} value={duracao} onChange={e => setDuracao(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm bg-background" placeholder="Ex: 4" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Macro / Área</label>
                    <input value={macro} onChange={e => setMacro(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm bg-background" placeholder="Ex: Caldeiraria" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Equipe Responsável</label>
                    <input value={equipe} onChange={e => setEquipe(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm bg-background" placeholder="Ex: Mecânica A" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Descrição</label>
                    <textarea value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm bg-background min-h-[100px]" placeholder="Detalhes da parada..." />
                  </div>

                  <div className="pt-4 flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => { setOpen(false); setCreatedParada(null); }}>Cancelar</Button>
                    <Button type="submit" disabled={creating || !nome}>{creating ? "Criando..." : "Criar Parada"}</Button>
                  </div>
                </form>
              </div>

              {/* Preview / resumo em tempo real */}
              <div className="border rounded-xl p-4 bg-background">
                <h4 className="text-sm font-medium mb-3">Resumo (pré-visualização)</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full p-2 bg-muted/50">
                      {getIcon(tipo)}
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{nome || "(Nome da parada)"}</div>
                      <div className="text-xs text-muted-foreground capitalize">{tipo}</div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <div><strong>Macro:</strong> {macro || '-'}</div>
                    <div><strong>Equipe:</strong> {equipe || '-'}</div>
                    <div><strong>Início:</strong> {new Date().toLocaleString('pt-BR')}</div>
                    <div><strong>Previsto:</strong> {duracao ? `${duracao}h` : '-'}</div>
                  </div>

                  <div className="pt-2 text-sm">
                    <strong>Descrição</strong>
                    <p className="text-muted-foreground mt-1">{descricao || '—'}</p>
                  </div>

                  {/* After creation: show created summary and actions */}
                  {createdParada && (
                    <div className="mt-4 p-3 border rounded-md bg-card">
                      <div className="text-sm font-medium">Parada criada</div>
                      <div className="text-sm text-muted-foreground mt-2">{createdParada.nome}</div>
                      <div className="flex gap-2 mt-3">
                        <Link href={`/paradas/${createdParada.id}`} className="text-sm text-primary underline">Ver detalhes</Link>
                        <Button variant="outline" onClick={() => { resetForm(); setCreatedParada(null); }}>Criar outra</Button>
                        <Button onClick={() => { setOpen(false); setCreatedParada(null); }}>Fechar</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Carregando paradas...</div>
      ) : paradas.length === 0 ? (
        <div className="text-center py-10 border rounded-xl bg-card/50">
          <p className="text-muted-foreground">Nenhuma parada ativa no momento.</p>
          <Button variant="link" onClick={() => setOpen(true)}>Criar a primeira</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paradas.map((parada) => (
            <div key={parada.id} className="group relative flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 bg-muted/50`}>
                    {getIcon(parada.tipo)}
                  </div>
                  <div>
                    <h3 className="font-semibold leading-none">{parada.nome}</h3>
                    <span className="text-xs text-muted-foreground capitalize">{parada.tipo}</span>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  Ativa
                </span>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground flex-1">
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

              <div className="mt-5 pt-4 border-t flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {parada._count?.testes || 0} testes realizados
                </div>
                <Link href={`/paradas/${parada.id}`} className="text-sm font-medium text-primary hover:underline">
                  Ver detalhes &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
