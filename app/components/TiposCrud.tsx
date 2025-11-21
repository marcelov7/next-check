"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";

type Tipo = { id: number; nome: string; descricao?: string | null; ativo: boolean };

export default function TiposCrud() {
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTipos = async () => {
    const res = await fetch('/api/tipos');
    const data = await res.json();
    setTipos(data);
  };

  useEffect(() => { fetchTipos(); }, []);

  const createTipo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) return alert('Nome é obrigatório');
    setLoading(true);
    const res = await fetch('/api/tipos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome, descricao }) });
    if (res.ok) { setNome(''); setDescricao(''); await fetchTipos(); } else alert('Erro ao criar tipo');
    setLoading(false);
  };

  const remove = async (id: number) => {
    if (!confirm('Confirmar exclusão do tipo?')) return;
    const res = await fetch(`/api/tipos/${id}`, { method: 'DELETE' });
    if (res.ok) fetchTipos(); else alert('Erro ao deletar');
  };

  // Modal de edição de tipo
  const [editing, setEditing] = useState<Tipo | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const openEdit = (t: Tipo) => {
    setEditing(t);
    setEditNome(t.nome);
    setEditDescricao(t.descricao ?? "");
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/tipos/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: editNome,
          descricao: editDescricao,
        }),
      });
      if (res.ok) {
        setEditing(null);
        await fetchTipos();
      } else {
        alert("Erro ao atualizar tipo");
      }
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Tipos de Equipamento</h2>
      <form onSubmit={createTipo} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        <input required value={nome} onChange={(e)=>setNome(e.target.value)} placeholder="Nome" className="w-full rounded-md border px-3 py-2" />
        <input value={descricao} onChange={(e)=>setDescricao(e.target.value)} placeholder="Descrição" className="w-full rounded-md border px-3 py-2" />
        <div>
          <button type="submit" disabled={loading} className="w-full md:w-auto rounded-md bg-primary px-4 py-2 text-white">{loading ? 'Criando...' : 'Criar Tipo'}</button>
        </div>
      </form>

      <div className="space-y-2">
        {tipos.map(t => (
          <div key={t.id} className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-md border p-3 gap-2">
            <div>
              <div className="font-medium">{t.nome}</div>
              <div className="text-sm text-muted-foreground">{t.descricao}</div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEdit(t)}
              >
                Editar
              </Button>
              <button onClick={()=>remove(t.id)} className="rounded-md border px-3 py-1 text-red-600 text-sm md:text-base">Excluir</button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tipo de Equipamento</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 mt-2">
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
