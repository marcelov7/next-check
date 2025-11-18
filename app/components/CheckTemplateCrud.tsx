"use client";

import { useEffect, useState } from "react";

type Tipo = { id: number; nome: string };
type Template = { id: number; nome: string; descricao?: string | null; ordem?: number | null; obrigatorio: boolean; tipoId: number; tipo?: Tipo };

export default function CheckTemplateCrud() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipoId, setTipoId] = useState<number | string>('');
  const [ordem, setOrdem] = useState<number | ''>('');
  const [obrigatorio, setObrigatorio] = useState(true);

  const fetchTipos = async () => {
    const res = await fetch('/api/tipos');
    const data = await res.json();
    setTipos(data);
    if (!tipoId && data.length) setTipoId(data[0].id);
  };

  const fetchTemplates = async () => {
    const res = await fetch('/api/check-templates');
    const data = await res.json();
    setTemplates(data);
  };

  useEffect(() => { fetchTipos(); fetchTemplates(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !tipoId) return alert('Nome e Tipo são obrigatórios');
    const res = await fetch('/api/check-templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome, descricao, tipoId: Number(tipoId), ordem: ordem === '' ? null : Number(ordem), obrigatorio }) });
    if (res.ok) { setNome(''); setDescricao(''); setOrdem(''); setObrigatorio(true); await fetchTemplates(); } else alert('Erro ao criar template');
  };

  const remove = async (id: number) => {
    if (!confirm('Confirmar exclusão do template?')) return;
    const res = await fetch(`/api/check-templates/${id}`, { method: 'DELETE' });
    if (res.ok) fetchTemplates(); else alert('Erro ao deletar');
  };

  const edit = async (tpl: Template) => {
    const newName = prompt('Nome', tpl.nome) ?? tpl.nome;
    const newDesc = prompt('Descrição', tpl.descricao ?? '') ?? tpl.descricao ?? '';
    const newOrdem = prompt('Ordem', String(tpl.ordem ?? '')) ?? String(tpl.ordem ?? '');
    const newObrig = confirm('Obrigatório? (OK = Sim, Cancel = Não)') ? true : false;
    const res = await fetch(`/api/check-templates/${tpl.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: newName, descricao: newDesc, ordem: newOrdem === '' ? null : Number(newOrdem), obrigatorio: newObrig }) });
    if (res.ok) fetchTemplates(); else alert('Erro ao atualizar');
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Check Templates</h2>
      <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        <input required value={nome} onChange={(e)=>setNome(e.target.value)} placeholder="Nome do check" className="rounded-md border px-3 py-2" />
        <select value={String(tipoId)} onChange={(e)=>setTipoId(e.target.value)} className="rounded-md border px-3 py-2">
          <option value="">Selecione o tipo</option>
          {tipos.map(t=> <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
        <input value={String(ordem)} onChange={(e)=>setOrdem(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ordem (opcional)" className="rounded-md border px-3 py-2" />
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2"><input type="checkbox" checked={obrigatorio} onChange={(e)=>setObrigatorio(e.target.checked)} /> Obrigatório</label>
        </div>
        <input value={descricao} onChange={(e)=>setDescricao(e.target.value)} placeholder="Descrição" className="col-span-1 md:col-span-4 rounded-md border px-3 py-2" />
        <div className="md:col-span-4">
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-white">Criar Template</button>
        </div>
      </form>

      <div className="space-y-2">
        {templates.map(tpl => (
          <div key={tpl.id} className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="font-medium">{tpl.nome} <span className="text-sm text-muted-foreground">{tpl.tipo?.nome ? ` — ${tpl.tipo.nome}` : ''}</span></div>
              <div className="text-sm text-muted-foreground">{tpl.descricao}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>edit(tpl)} className="rounded-md border px-3 py-1">Editar</button>
              <button onClick={()=>remove(tpl.id)} className="rounded-md border px-3 py-1 text-red-600">Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
