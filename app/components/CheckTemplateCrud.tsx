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
import { Edit3, List, Hash, Thermometer, FileText, CheckSquare } from "lucide-react";

type Tipo = { id: number; nome: string };
type Template = {
  id: number;
  nome: string;
  descricao?: string | null;
  ordem?: number | null;
  obrigatorio: boolean;
  tipoId: number;
  tipoCampo?: "status" | "texto" | "numero" | "temperatura";
  unidade?: string | null;
  valorMinimo?: number | null;
  valorMaximo?: number | null;
  tipo?: Tipo;
};

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

  const [tipoCampo, setTipoCampo] = useState<Template["tipoCampo"]>("status");
  const [unidade, setUnidade] = useState("");
  const [valorMinimo, setValorMinimo] = useState<string>("");
  const [valorMaximo, setValorMaximo] = useState<string>("");

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !tipoId) return alert('Nome e Tipo são obrigatórios');
    const body: any = {
      nome,
      descricao,
      tipoId: Number(tipoId),
      ordem: ordem === '' ? null : Number(ordem),
      obrigatorio,
      tipoCampo,
      unidade: unidade || null,
      valorMinimo: valorMinimo !== "" ? Number(valorMinimo) : null,
      valorMaximo: valorMaximo !== "" ? Number(valorMaximo) : null,
    };
    const res = await fetch('/api/check-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setNome('');
      setDescricao('');
      setOrdem('');
      setObrigatorio(true);
      setTipoCampo("status");
      setUnidade("");
      setValorMinimo("");
      setValorMaximo("");
      await fetchTemplates();
    } else {
      alert('Erro ao criar template');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Confirmar exclusão do template?')) return;
    const res = await fetch(`/api/check-templates/${id}`, { method: 'DELETE' });
    if (res.ok) fetchTemplates(); else alert('Erro ao deletar');
  };

  // Estado para modal de edição bonita
  const [editing, setEditing] = useState<Template | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editOrdem, setEditOrdem] = useState<string>("");
  const [editObrigatorio, setEditObrigatorio] = useState(true);
  const [editTipoCampo, setEditTipoCampo] =
    useState<Template["tipoCampo"]>("status");
  const [editUnidade, setEditUnidade] = useState("");
  const [editValorMinimo, setEditValorMinimo] = useState<string>("");
  const [editValorMaximo, setEditValorMaximo] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState(false);

  const openEdit = (tpl: Template) => {
    setEditing(tpl);
    setEditNome(tpl.nome);
    setEditDescricao(tpl.descricao ?? "");
    setEditOrdem(tpl.ordem != null ? String(tpl.ordem) : "");
    setEditObrigatorio(tpl.obrigatorio);
    setEditTipoCampo(tpl.tipoCampo ?? "status");
    setEditUnidade(tpl.unidade ?? "");
    setEditValorMinimo(
      tpl.valorMinimo != null ? String(tpl.valorMinimo) : ""
    );
    setEditValorMaximo(
      tpl.valorMaximo != null ? String(tpl.valorMaximo) : ""
    );
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSavingEdit(true);
    try {
      const body: any = {
        nome: editNome,
        descricao: editDescricao,
        ordem: editOrdem === "" ? null : Number(editOrdem),
        obrigatorio: editObrigatorio,
        tipoCampo: editTipoCampo,
        unidade: editUnidade || null,
        valorMinimo:
          editValorMinimo !== "" ? Number(editValorMinimo) : null,
        valorMaximo:
          editValorMaximo !== "" ? Number(editValorMaximo) : null,
      };
      const res = await fetch(`/api/check-templates/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditing(null);
        await fetchTemplates();
      } else {
        alert("Erro ao atualizar template");
      }
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Check Templates</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Crie listas de checagem por <strong>Tipo de Equipamento</strong> (Motor, Válvula, Filtro, etc.).{" "}
        Os equipamentos herdam os checks do seu tipo automaticamente.
      </p>
      <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        <input
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do check"
          className="w-full rounded-md border px-3 py-2"
        />
        <select
          value={String(tipoId)}
          onChange={(e) => setTipoId(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="">Selecione o tipo (grupo)</option>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
        <select
          value={tipoCampo}
          onChange={(e) =>
            setTipoCampo(
              e.target.value as Template["tipoCampo"]
            )
          }
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="status">Status (OK / Problema / N/A)</option>
          <option value="texto">Texto livre</option>
          <option value="numero">Número</option>
          <option value="temperatura">Temperatura (°C)</option>
        </select>
        <input
          value={String(ordem)}
          onChange={(e) =>
            setOrdem(e.target.value === "" ? "" : Number(e.target.value))
          }
          placeholder="Ordem (opcional)"
          className="w-full rounded-md border px-3 py-2"
        />
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={obrigatorio}
              onChange={(e) => setObrigatorio(e.target.checked)}
            />{" "}
            Obrigatório
          </label>
        </div>
        {(tipoCampo === "numero" || tipoCampo === "temperatura") && (
          <>
            <input
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              placeholder={
                tipoCampo === "temperatura" ? "Unidade (ex: °C)" : "Unidade (ex: bar)"
              }
              className="w-full rounded-md border px-3 py-2"
            />
            <input
              value={valorMinimo}
              onChange={(e) => setValorMinimo(e.target.value)}
              placeholder="Valor mínimo (opcional)"
              className="w-full rounded-md border px-3 py-2"
            />
            <input
              value={valorMaximo}
              onChange={(e) => setValorMaximo(e.target.value)}
              placeholder="Valor máximo (opcional)"
              className="w-full rounded-md border px-3 py-2"
            />
          </>
        )}
        <input
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição (o que será feito)"
          className="col-span-1 md:col-span-4 w-full rounded-md border px-3 py-2"
        />
        <div className="md:col-span-4">
          <button
            type="submit"
            className="w-full md:w-auto rounded-md bg-primary px-4 py-2 text-white"
          >
            Criar Template
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {tipos.map((tipo) => {
          const doTipo = templates.filter((tpl) => tpl.tipoId === tipo.id);
          if (!doTipo.length) return null;
          return (
            <div key={tipo.id} className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">
                {tipo.nome}
              </h3>
              <div className="space-y-2">
                {doTipo.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-md border p-3 gap-2"
                  >
                    <div>
                      <div className="font-medium">
                        {tpl.nome}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px]">
                          {tpl.tipoCampo === "status" && "Status (OK/Problema/N/A)"}
                          {tpl.tipoCampo === "texto" && "Texto"}
                          {tpl.tipoCampo === "numero" && "Número"}
                          {tpl.tipoCampo === "temperatura" && "Temperatura"}
                        </span>
                        {(tpl.tipoCampo === "numero" || tpl.tipoCampo === "temperatura") &&
                          (tpl.unidade || tpl.valorMinimo != null || tpl.valorMaximo != null) && (
                            <span className="text-[11px] text-muted-foreground">
                              {tpl.unidade ? `Unidade: ${tpl.unidade}` : ""}
                              {tpl.valorMinimo != null ? ` · Mín: ${tpl.valorMinimo}` : ""}
                              {tpl.valorMaximo != null ? ` · Máx: ${tpl.valorMaximo}` : ""}
                            </span>
                          )}
                      </div>
                      {tpl.descricao && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {tpl.descricao}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(tpl)}
                      >
                        Editar
                      </Button>
                      <button
                        onClick={() => remove(tpl.id)}
                        className="rounded-md border px-3 py-1 text-red-600 text-sm md:text-base"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {templates.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum check template criado ainda. Crie checks para um tipo de equipamento acima.
          </p>
        )}
      </div>

      {/* Modal de edição de template */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Check</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4 text-muted-foreground" />
                      <span>Nome do check</span>
                    </span>
                  </label>
                  <input
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <List className="h-4 w-4 text-muted-foreground" />
                      <span>Tipo do campo</span>
                    </span>
                  </label>
                  <select
                    value={editTipoCampo}
                    onChange={(e) =>
                      setEditTipoCampo(
                        e.target.value as Template["tipoCampo"]
                      )
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="status">
                      Status (OK / Problema / N/A)
                    </option>
                    <option value="texto">Texto livre</option>
                    <option value="numero">Número</option>
                    <option value="temperatura">Temperatura</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span>Ordem</span>
                    </span>
                  </label>
                  <input
                    value={editOrdem}
                    onChange={(e) => setEditOrdem(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Opcional"
                  />
                </div>
                {(editTipoCampo === "numero" ||
                  editTipoCampo === "temperatura") && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-muted-foreground" />
                          <span>Unidade</span>
                        </span>
                      </label>
                      <input
                        value={editUnidade}
                        onChange={(e) => setEditUnidade(e.target.value)}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        placeholder={
                          editTipoCampo === "temperatura"
                            ? "°C"
                            : "bar, A, m/s..."
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={editValorMinimo}
                        onChange={(e) =>
                          setEditValorMinimo(e.target.value)
                        }
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="Mín"
                      />
                      <input
                        value={editValorMaximo}
                        onChange={(e) =>
                          setEditValorMaximo(e.target.value)
                        }
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="Máx"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editObrigatorio}
                    onChange={(e) => setEditObrigatorio(e.target.checked)}
                    className="accent-primary"
                  />
                  <span className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    <span>Obrigatório</span>
                  </span>
                </label>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Descrição</span>
                  </span>
                </label>
                <textarea
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[80px] shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
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
            <Button type="button" onClick={handleSaveEdit} disabled={savingEdit}>
              {savingEdit ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
