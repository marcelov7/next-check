"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";

type Area = { id: number; nome: string };
type Tipo = { id: number; nome: string };
type Equip = { id: number; nome: string; tag: string; descricao?: string | null; ativo: boolean; area: Area; tipo?: Tipo | null };

export default function EquipamentoCrud() {
  const [equipamentos, setEquipamentos] = useState<Equip[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [nome, setNome] = useState("");
  const [tag, setTag] = useState("");
  const [descricao, setDescricao] = useState("");
  const searchParams = useSearchParams();
  const paramAreaId = searchParams ? (searchParams.get('areaId') ?? '') : '';
  const [areaId, setAreaId] = useState<string | number>(paramAreaId || '');
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
    const q = paramAreaId ? `?areaId=${paramAreaId}` : '';
    const res = await fetch(`/api/equipamentos${q}`);
    const data = await res.json();
    setEquipamentos(data);
  };

  useEffect(() => { fetchAreas(); fetchTipos(); fetchEquip(); }, [paramAreaId]);

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

  // Modal de edição de equipamento
  const [editing, setEditing] = useState<Equip | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editTag, setEditTag] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editAreaId, setEditAreaId] = useState<number | ''>('');
  const [editTipoId, setEditTipoId] = useState<number | ''>('');
  const [savingEdit, setSavingEdit] = useState(false);

  const openEdit = (equip: Equip) => {
    setEditing(equip);
    setEditNome(equip.nome);
    setEditTag(equip.tag);
    setEditDescricao(equip.descricao ?? "");
    setEditAreaId(equip.area?.id ?? '');
    setEditTipoId(equip.tipo?.id ?? '');
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    if (!editAreaId) {
      alert("Selecione a área do equipamento");
      return;
    }
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/equipamentos/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: editNome,
          tag: editTag,
          descricao: editDescricao,
          areaId: Number(editAreaId),
          tipoId: editTipoId ? Number(editTipoId) : null,
        }),
      });
      if (res.ok) {
        setEditing(null);
        await fetchEquip();
      } else {
        alert("Erro ao atualizar equipamento");
      }
    } finally {
      setSavingEdit(false);
    }
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
          <button type="submit" disabled={loading} className="w-full md:w-auto rounded-md bg-primary px-4 py-2 text-white">{loading ? 'Criando...' : 'Criar Equipamento'}</button>
        </div>
      </form>

      <div className="space-y-2">
        {equipamentos.map(eq => (
          <div key={eq.id} className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-md border p-3 gap-2">
            <div>
              <div className="font-medium">{eq.nome} <span className="text-sm text-muted-foreground">({eq.tag})</span></div>
              <div className="text-sm text-muted-foreground">Área: {eq.area?.nome ?? '—'}</div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEdit(eq)}
              >
                Editar
              </Button>
              <button onClick={()=>remove(eq.id)} className="rounded-md border px-3 py-1 text-red-600 text-sm md:text-base">Excluir</button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Equipamento</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Nome
                  </label>
                  <input
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Tag
                  </label>
                  <input
                    value={editTag}
                    onChange={(e) => setEditTag(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Área
                  </label>
                  <select
                    value={editAreaId === '' ? '' : String(editAreaId)}
                    onChange={(e) => setEditAreaId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  >
                    <option value="">Selecione a área</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Tipo (grupo)
                  </label>
                  <select
                    value={editTipoId === '' ? '' : String(editTipoId)}
                    onChange={(e) => setEditTipoId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  >
                    <option value="">Nenhum</option>
                    {tipos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Descrição
                </label>
                <textarea
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px]"
                />
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdit}
              disabled={savingEdit}
            >
              {savingEdit ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
