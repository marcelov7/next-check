"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";

type ParadaForEdit = {
  id: number;
  nome: string;
  macro: string | null;
  descricao: string | null;
  equipeResponsavel: string | null;
  tipo: "preventiva" | "corretiva" | "emergencial";
  duracaoPrevistaHoras: number | null;
  status: "em_andamento" | "concluida" | "cancelada";
};

export default function ParadaEditForm({ parada }: { parada: ParadaForEdit }) {
  const router = useRouter();
  const [codigo, setCodigo] = useState(parada.macro ?? "");
  const [nome, setNome] = useState(parada.nome);
  const [tipoUi, setTipoUi] = useState<
    "programada" | "preventiva" | "corretiva" | "emergencial"
  >(parada.tipo === "preventiva" ? "programada" : parada.tipo);
  const [duracao, setDuracao] = useState(
    parada.duracaoPrevistaHoras ? String(parada.duracaoPrevistaHoras) : ""
  );
  const [equipe, setEquipe] = useState(parada.equipeResponsavel ?? "");
  const [descricao, setDescricao] = useState(parada.descricao ?? "");
  const [status, setStatus] = useState<ParadaForEdit["status"]>(
    parada.status
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!codigo || !nome) {
      setError("Código e Nome são obrigatórios");
      return;
    }
    setSaving(true);
    try {
      const tipoPersistido =
        tipoUi === "programada" ? "preventiva" : tipoUi;

      const payload = {
        nome,
        descricao,
        tipo: tipoPersistido,
        equipeResponsavel: equipe,
        macro: codigo,
        duracaoPrevistaHoras: duracao ? Number(duracao) : null,
        status,
      };

      const res = await fetch(`/api/paradas/${parada.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Erro ao atualizar a parada");
        setSaving(false);
        return;
      }

      router.push(`/paradas/${parada.id}`);
    } catch (err) {
      console.error(err);
      setError("Erro ao atualizar a parada");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Código da Parada (Macro) *
          </label>
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="Ex: GP-2025.04"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Nome da Parada *
          </label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="Ex: Parada programada do forno"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Tipo
          </label>
          <select
            value={tipoUi}
            onChange={(e) =>
              setTipoUi(
                e.target.value as
                  | "programada"
                  | "preventiva"
                  | "corretiva"
                  | "emergencial"
              )
            }
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="programada">Programada</option>
            <option value="preventiva">Preventiva</option>
            <option value="corretiva">Corretiva</option>
            <option value="emergencial">Emergencial</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Duração Prevista (horas)
          </label>
          <input
            type="number"
            min={0}
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="Ex: 4"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Status
          </label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value as ParadaForEdit["status"]
              )
            }
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="em_andamento">Em andamento</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Equipe Responsável
        </label>
        <textarea
          value={equipe}
          onChange={(e) => setEquipe(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
          placeholder="Ex: João Silva (Coordenador)&#10;Maria Santos (Técnica)"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Descrição
        </label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full rounded-md border px-3 py-2 min-h-[120px]"
          placeholder="Descreva os procedimentos e objetivos da parada"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

