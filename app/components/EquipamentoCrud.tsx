"use client";

import { useEffect, useState } from "react";

type Area = { id: number; nome: string };
type Tipo = { id: number; nome: string };
type Equip = { id: number; nome: string; tag: string; descricao?: string | null; ativo: boolean; area: Area; tipo?: Tipo | null };

export default function EquipamentoCrud() {
  const [equipamentos, setEquipamentos] = useState<Equip[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [nome, setNome] = useState("");
  const [tag, setTag] = useState("");
  const [descricao, setDescricao] = useState("");
  const [areaId, setAreaId] = useState<string | number>('');
  const [tipoId, setTipoId] = useState<string | number>('');
  const [loading, setLoading] = useState(false);
  const [tipos, setTipos] = useState<Tipo[]>([]);

  const fetchAreas = async () => {
    const res = await fetch('/api/areas');
    const data = await res.json();
    setAreas(data);
    if (!areaId && data.length) setAreaId(data[0].id);
  };
  const fetchTipos = async () => {
    const res = await fetch('/api/tipos');
    const data = await res.json();
    setTipos(data);
    if (!tipoId && data.length) setTipoId(data[0].id);
  };
  const fetchEquip = async () => {
    const res = await fetch('/api/equipamentos');
    const data = await res.json();
    setEquipamentos(data);
  };

  useEffect(() => { fetchAreas(); fetchTipos(); fetchEquip(); }, []);

  const createEquip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaId) return alert('Selecione uma área');
    setLoading(true);
    const res = await fetch('/api/equipamentos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome, tag, descricao, areaId, tipoId: tipoId || null }) });
    if (res.ok) { setNome(''); setTag(''); setDescricao(''); await fetchEquip(); } else { alert('Erro ao criar equipamento'); }
    setLoading(false);
  };

  const remove = async (id: number) => {
    if (!confirm('Confirmar exclusão do equipamento?')) return;
    const res = await fetch(`/api/equipamentos/${id}`, { method: 'DELETE' });
    if (res.ok) fetchEquip(); else alert('Erro ao deletar');
  };

  const edit = async (equip: Equip) => {
    const newName = prompt('Nome', equip.nome) ?? equip.nome;
    const newTag = prompt('Tag', equip.tag) ?? equip.tag;
    const newDesc = prompt('Descrição', equip.descricao ?? '') ?? equip.descricao ?? '';
    const newAreaId = prompt('Area ID', String(equip.area.id)) ?? String(equip.area.id);
    const newTipoId = prompt('Tipo ID (vazio para nenhum)', String(equip.tipo?.id ?? '')) ?? String(equip.tipo?.id ?? '');
    const res = await fetch(`/api/equipamentos/${equip.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: newName, tag: newTag, descricao: newDesc, areaId: Number(newAreaId), tipoId: newTipoId ? Number(newTipoId) : null }) });
    if (res.ok) fetchEquip(); else alert('Erro ao atualizar');
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Equipamentos</h2>
      <form onSubmit={createEquip} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        <input required value={nome} onChange={(e)=>setNome(e.target.value)} placeholder="Nome" className="col-span-1 md:col-span-1 rounded-md border px-3 py-2" />
        <input required value={tag} onChange={(e)=>setTag(e.target.value)} placeholder="Tag" className="col-span-1 md:col-span-1 rounded-md border px-3 py-2" />
        <input value={descricao} onChange={(e)=>setDescricao(e.target.value)} placeholder="Descrição" className="col-span-1 md:col-span-1 rounded-md border px-3 py-2" />
        <select value={String(tipoId)} onChange={(e)=>setTipoId(Number(e.target.value))} className="col-span-1 md:col-span-1 rounded-md border px-3 py-2">
          <option value="">Tipo (opcional)</option>
          {tipos.map(t=> <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
        <select value={String(areaId)} onChange={(e)=>setAreaId(Number(e.target.value))} className="col-span-1 md:col-span-1 rounded-md border px-3 py-2">
          <option value="">Selecione a área</option>
          {areas.map(a=> <option key={a.id} value={a.id}>{a.nome}</option>)}
        </select>
        <div className="md:col-span-4">
          <button type="submit" disabled={loading} className="rounded-md bg-primary px-4 py-2 text-white">{loading ? 'Criando...' : 'Criar Equipamento'}</button>
        </div>
      </form>

      <div className="space-y-2">
        {equipamentos.map(eq => (
          <div key={eq.id} className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="font-medium">{eq.nome} <span className="text-sm text-muted-foreground">({eq.tag})</span></div>
              <div className="text-sm text-muted-foreground">Área: {eq.area?.nome ?? '—'}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>edit(eq)} className="rounded-md border px-3 py-1">Editar</button>
              <button onClick={()=>remove(eq.id)} className="rounded-md border px-3 py-1 text-red-600">Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
