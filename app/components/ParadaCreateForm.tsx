"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";

export default function ParadaCreateForm() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("programada");
  const [duracao, setDuracao] = useState("");
  const [equipe, setEquipe] = useState("");
  const [descricao, setDescricao] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!codigo || !nome) {
      setError("Código e Nome são obrigatórios");
      return;
    }
    setCreating(true);
    try {
      const payload = {
        nome,
        descricao,
        tipo: tipo === "programada" ? "preventiva" : tipo,
        equipeResponsavel: equipe,
        macro: codigo,
        duracaoPrevistaHoras: duracao ? Number(duracao) : null,
      };

      const res = await fetch("/api/paradas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Erro ao criar a parada");
        setCreating(false);
        return;
      }

      // Após criar a parada, direciona para a etapa de configuração
      router.push(`/paradas/${data.id}/configurar`);
    } catch (err) {
      console.error(err);
      setError("Erro ao criar a parada");
      setCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Código da Parada (Macro) *</label>
          <input value={codigo} onChange={(e) => setCodigo(e.target.value)} className="w-full rounded-md border px-3 py-2" placeholder="Ex: GP-2025.04" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Nome da Parada *</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full rounded-md border px-3 py-2" placeholder="Ex: Parada programada do forno" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full rounded-md border px-3 py-2">
            <option value="programada">Programada</option>
            <option value="preventiva">Preventiva</option>
            <option value="corretiva">Corretiva</option>
            <option value="emergencial">Emergencial</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Duração Prevista (horas)</label>
          <input type="number" min={0} value={duracao} onChange={(e) => setDuracao(e.target.value)} className="w-full rounded-md border px-3 py-2" placeholder="Ex: 4" />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Equipe Responsável</label>
        <textarea value={equipe} onChange={(e) => setEquipe(e.target.value)} className="w-full rounded-md border px-3 py-2" placeholder="Ex: João Silva (Coordenador)\nMaria Santos (Técnica)" />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Descrição</label>
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full rounded-md border px-3 py-2 min-h-[120px]" placeholder="Descreva os procedimentos e objetivos da parada" />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={creating}>{creating ? 'Criando...' : 'Criar Parada'}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </form>
  );
}
