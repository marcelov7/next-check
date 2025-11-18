"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';

type Area = { id: number; nome: string; descricao?: string | null; ativo: boolean; equipamentos?: { id: number }[] };

export default function AreaCrud() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAreas = async () => {
    const res = await fetch('/api/areas');
    const data = await res.json();
    setAreas(data);
  };

  useEffect(() => { fetchAreas(); }, []);

  const createArea = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/areas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome, descricao }) });
    if (res.ok) {
      setNome(''); setDescricao('');
      await fetchAreas();
    } else {
      alert('Erro ao criar área');
    }
    setLoading(false);
  };

  const remove = async (id: number) => {
    if (!confirm('Confirmar exclusão da área? Isso removerá equipamentos vinculados.')) return;
    const res = await fetch(`/api/areas/${id}`, { method: 'DELETE' });
    if (res.ok) fetchAreas(); else alert('Erro ao deletar');
  };

  const edit = async (area: Area) => {
    const newName = prompt('Nome', area.nome) ?? area.nome;
    const newDesc = prompt('Descrição', area.descricao ?? '') ?? area.descricao ?? '';
    const res = await fetch(`/api/areas/${area.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: newName, descricao: newDesc }) });
    if (res.ok) fetchAreas(); else alert('Erro ao atualizar');
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Áreas</h2>
      <form onSubmit={createArea} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        <input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da área" className="w-full rounded-md border px-3 py-2" />
        <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição (opcional)" className="w-full rounded-md border px-3 py-2" />
        <button type="submit" disabled={loading} className="w-full md:w-auto rounded-md bg-primary px-4 py-2 text-white">{loading ? 'Criando...' : 'Criar'}</button>
      </form>

      <div className="space-y-2">
        {areas.map(a => (
          <div key={a.id} className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-md border p-3 gap-2">
            <div>
              <div className="flex items-center gap-3">
                <div className="font-medium">{a.nome}</div>
                  <Link href={`/equipamentos?areaId=${a.id}`} className="text-xs text-muted-foreground bg-muted/30 rounded-full px-2 py-1">{(a.equipamentos ?? []).length} equipamentos</Link>
              </div>
              <div className="text-sm text-muted-foreground mt-1">{a.descricao}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => edit(a)} className="rounded-md border px-3 py-1 text-sm md:text-base">Editar</button>
              <button onClick={() => remove(a.id)} className="rounded-md border px-3 py-1 text-red-600 text-sm md:text-base">Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
