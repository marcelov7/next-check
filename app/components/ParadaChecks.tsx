"use client";

import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent } from "@/app/components/ui/dialog";

type CheckTemplateTipoCampo = "status" | "texto" | "numero" | "temperatura";

type CheckTemplate = {
  id: number;
  nome: string;
  descricao: string | null;
  tipoCampo: CheckTemplateTipoCampo;
  unidade: string | null;
  valorMinimo: number | null;
  valorMaximo: number | null;
};

type Area = {
  id: number;
  nome: string;
};

type TipoEquipamento = {
  id: number;
  nome: string;
};

type Equipamento = {
  id: number;
  nome: string;
  tag: string;
  area: Area | null;
  tipo: TipoEquipamento | null;
};

type TesteStatus = "pendente" | "ok" | "problema" | "nao_aplica";

type Teste = {
  id: number;
  status: TesteStatus;
  observacoes: string | null;
  problemaDescricao: string | null;
  evidenciaImagem: string | null;
  resolucaoTexto: string | null;
  resolucaoImagem: string | null;
  equipamento: Equipamento;
  checkTemplate: CheckTemplate | null;
};

type Props = {
  paradaId: number;
  testes: Teste[];
  paradaAreas?: any[];
  areasConfig?: any[];
};

type LocalTesteState = Teste & {
  saving?: boolean;
  error?: string | null;
};

const DEFAULT_PAGE_SIZE = 5;

const isResolved = (teste: LocalTesteState) =>
  teste.status === "ok" ||
  (teste.status === "problema" &&
    (!!teste.resolucaoTexto || !!teste.resolucaoImagem));

export default function ParadaChecks({ testes, paradaAreas, areasConfig }: Props) {
  const [localTestes, setLocalTestes] = useState<LocalTesteState[]>(
    () => testes as LocalTesteState[]
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [filterResponsavel, setFilterResponsavel] = useState<string>("");
  const [filterAreaId, setFilterAreaId] = useState<number | "all">("all");
  const [filterEquipQuery, setFilterEquipQuery] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const updateLocalTeste = (id: number, patch: Partial<LocalTesteState>) => {
    setLocalTestes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  };

  const salvarTeste = async (
    id: number,
    patch: Partial<
      Pick<
        LocalTesteState,
        | "status"
        | "observacoes"
        | "problemaDescricao"
        | "evidenciaImagem"
        | "resolucaoTexto"
        | "resolucaoImagem"
      >
    >
  ) => {
    updateLocalTeste(id, { ...patch, saving: true, error: null });
    try {
      const res = await fetch(`/api/testes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Erro ao salvar teste");
      }
      const updated = (await res.json()) as Teste;
      updateLocalTeste(id, {
        status: updated.status,
        observacoes: updated.observacoes,
        problemaDescricao: updated.problemaDescricao,
        evidenciaImagem: updated.evidenciaImagem,
        resolucaoTexto: updated.resolucaoTexto,
        resolucaoImagem: updated.resolucaoImagem,
        saving: false,
      });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Erro ao salvar";
      updateLocalTeste(id, {
        saving: false,
        error: message,
      });
    }
  };

  const handleChangeStatus = (teste: LocalTesteState, status: TesteStatus) => {
    const novoStatus: TesteStatus =
      teste.status === status ? "pendente" : status;
    updateLocalTeste(teste.id, { status: novoStatus });
    salvarTeste(teste.id, { status: novoStatus });
  };

  const handleBlurObservacoes = (teste: LocalTesteState) => {
    salvarTeste(teste.id, {
      observacoes: teste.observacoes ?? "",
    });
  };

  const handleBlurProblema = (teste: LocalTesteState) => {
    salvarTeste(teste.id, {
      problemaDescricao: teste.problemaDescricao ?? "",
    });
  };

  const handleBlurResolucao = (teste: LocalTesteState) => {
    salvarTeste(teste.id, {
      resolucaoTexto: teste.resolucaoTexto ?? "",
    });
  };

  const handleBlurValorMedido = (id: number, rawValue: string) => {
    const teste = localTestes.find((t) => t.id === id);
    if (!teste) return;

    const value =
      rawValue.trim() === "" ? null : Number(rawValue.replace(",", "."));

    // sempre salvar o texto digitado em observacoes
    const patch: Partial<LocalTesteState> = {
      observacoes: rawValue,
    };

    let status: TesteStatus | undefined;

    if (value != null && !Number.isNaN(value) && teste.checkTemplate) {
      const { valorMinimo, valorMaximo } = teste.checkTemplate;
      const dentroFaixa =
        (valorMinimo == null || value >= valorMinimo) &&
        (valorMaximo == null || value <= valorMaximo);

      // dentro da faixa => OK, fora da faixa => Problema
      status = dentroFaixa ? "ok" : "problema";
      patch.status = status;
    }

    updateLocalTeste(id, patch);

    const apiPatch: Partial<LocalTesteState> = { observacoes: rawValue };
    if (status) apiPatch.status = status;

    salvarTeste(id, apiPatch);
  };

  const handleUploadImage = (
    teste: LocalTesteState,
    field: "evidenciaImagem" | "resolucaoImagem",
    file?: File
  ) => {
    if (!file) return;

    // limitar tamanho da imagem (por exemplo, 3 MB)
    const maxSizeBytes = 3 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      updateLocalTeste(teste.id, {
        error: "Imagem muito grande (máx. 3 MB)",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      updateLocalTeste(teste.id, { [field]: dataUrl } as unknown as LocalTesteState);
      salvarTeste(teste.id, { [field]: dataUrl } as Partial<LocalTesteState>);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = (
    teste: LocalTesteState,
    field: "evidenciaImagem" | "resolucaoImagem"
  ) => {
    updateLocalTeste(teste.id, { [field]: null } as unknown as LocalTesteState);
    salvarTeste(teste.id, { [field]: null } as Partial<LocalTesteState>);
  };

  // refs para criar handlers estáveis e evitar re-renderings desnecessários
  const localTestesRef = useRef(localTestes);
  useEffect(() => {
    localTestesRef.current = localTestes;
  }, [localTestes]);

  const salvarTesteRef = useRef(salvarTeste);
  useEffect(() => {
    salvarTesteRef.current = salvarTeste;
  }, [salvarTeste]);

  // Handlers estáveis que operam por id e usam refs para pegar estado/funcões atuais
  const handleChangeStatusStable = useCallback((id: number, status: TesteStatus) => {
    const cur = localTestesRef.current.find((t) => t.id === id);
    if (!cur) return;
    const novoStatus: TesteStatus = cur.status === status ? "pendente" : status;
    setLocalTestes((prev) => prev.map((t) => (t.id === id ? { ...t, status: novoStatus } : t)));
    salvarTesteRef.current?.(id, { status: novoStatus } as Partial<LocalTesteState>);
  }, []);

  const updateLocalObservacoes = useCallback((id: number, value: string) => {
    setLocalTestes((prev) => prev.map((t) => (t.id === id ? { ...t, observacoes: value } : t)));
  }, []);

  const handleBlurObservacoesStable = useCallback((id: number) => {
    const cur = localTestesRef.current.find((t) => t.id === id);
    if (!cur) return;
    salvarTesteRef.current?.(id, { observacoes: cur.observacoes ?? "" });
  }, []);

  const updateLocalProblema = useCallback((id: number, value: string) => {
    setLocalTestes((prev) => prev.map((t) => (t.id === id ? { ...t, problemaDescricao: value } : t)));
  }, []);

  const handleBlurProblemaStable = useCallback((id: number) => {
    const cur = localTestesRef.current.find((t) => t.id === id);
    if (!cur) return;
    salvarTesteRef.current?.(id, { problemaDescricao: cur.problemaDescricao ?? "" });
  }, []);

  const updateLocalResolucao = useCallback((id: number, value: string) => {
    setLocalTestes((prev) => prev.map((t) => (t.id === id ? { ...t, resolucaoTexto: value } : t)));
  }, []);

  const handleBlurResolucaoStable = useCallback((id: number) => {
    const cur = localTestesRef.current.find((t) => t.id === id);
    if (!cur) return;
    salvarTesteRef.current?.(id, { resolucaoTexto: cur.resolucaoTexto ?? "" });
  }, []);

  const handleBlurValorMedidoStable = useCallback((id: number, rawValue: string) => {
    const teste = localTestesRef.current.find((t) => t.id === id);
    if (!teste) return;

    const value = rawValue.trim() === "" ? null : Number(rawValue.replace(",", "."));
    const patch: Partial<LocalTesteState> = { observacoes: rawValue };

    let status: TesteStatus | undefined;
    if (value != null && !Number.isNaN(value) && teste.checkTemplate) {
      const { valorMinimo, valorMaximo } = teste.checkTemplate;
      const dentroFaixa = (valorMinimo == null || value >= valorMinimo) && (valorMaximo == null || value <= valorMaximo);
      status = dentroFaixa ? "ok" : "problema";
      patch.status = status;
    }

    setLocalTestes((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    const apiPatch: Partial<LocalTesteState> = { observacoes: rawValue };
    if (status) apiPatch.status = status;
    salvarTesteRef.current?.(id, apiPatch);
  }, []);

  const handleUploadImageStable = useCallback((id: number, field: "evidenciaImagem" | "resolucaoImagem", file?: File) => {
    if (!file) return;
    const maxSizeBytes = 3 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setLocalTestes((prev) => prev.map((t) => (t.id === id ? { ...t, error: "Imagem muito grande (máx. 3 MB)" } : t)));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setLocalTestes((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: dataUrl } as LocalTesteState : t)));
      salvarTesteRef.current?.(id, { [field]: dataUrl } as Partial<LocalTesteState>);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleClearImageStable = useCallback((id: number, field: "evidenciaImagem" | "resolucaoImagem") => {
    setLocalTestes((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: null } as LocalTesteState : t)));
    salvarTesteRef.current?.(id, { [field]: null } as Partial<LocalTesteState>);
  }, []);

  // estado para áreas colapsadas
  const [collapsedAreas, setCollapsedAreas] = useState<Record<string, boolean>>({});
  const toggleAreaCollapsed = (areaKey: string) => {
    setCollapsedAreas((prev) => ({ ...prev, [areaKey]: !prev[areaKey] }));
  };

  // componente memoizado para cada teste (reduz rerenders que quebram digitação)
  const TesteCard = useCallback(
    React.memo(function TesteCardInner({ teste }: { teste: LocalTesteState }) {
      return (
        <li key={teste.id} className="flex flex-col gap-2 rounded-md border bg-card px-3 py-2 text-xs">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-medium">
                {teste.checkTemplate?.nome ?? `Check #${teste.id}`}
              </div>
              {teste.checkTemplate?.descricao && (
                <div className="text-[11px] text-muted-foreground">
                  {teste.checkTemplate.descricao}
                </div>
              )}
              {teste.checkTemplate && (
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {teste.checkTemplate.tipoCampo === "status" &&
                    "Tipo: Status (OK / Problema / N/A)"}
                  {teste.checkTemplate.tipoCampo === "texto" &&
                    "Tipo: Texto livre"}
                  {teste.checkTemplate.tipoCampo === "numero" && (
                    <>
                      Tipo: Número
                      {teste.checkTemplate.unidade
                        ? ` · Unidade: ${teste.checkTemplate.unidade}`
                        : ""}
                      {teste.checkTemplate.valorMinimo != null
                        ? ` · Mín: ${teste.checkTemplate.valorMinimo}`
                        : ""}
                      {teste.checkTemplate.valorMaximo != null
                        ? ` · Máx: ${teste.checkTemplate.valorMaximo}`
                        : ""}
                    </>
                  )}
                  {teste.checkTemplate.tipoCampo === "temperatura" && (
                    <>
                      Tipo: Temperatura
                      {teste.checkTemplate.unidade
                        ? ` · Unidade: ${teste.checkTemplate.unidade}`
                        : ""}
                      {teste.checkTemplate.valorMinimo != null
                        ? ` · Mín: ${teste.checkTemplate.valorMinimo}`
                        : ""}
                      {teste.checkTemplate.valorMaximo != null
                        ? ` · Máx: ${teste.checkTemplate.valorMaximo}`
                        : ""}
                    </>
                  )}
                </div>
              )}
            </div>
            {(!teste.checkTemplate || teste.checkTemplate?.tipoCampo === "status") && (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  {(["ok", "problema", "nao_aplica"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleChangeStatusStable(teste.id, st)}
                      className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold border ${(() => {
                        const resolved = isResolved(teste);
                        if (st === "ok") {
                          return resolved
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-muted text-muted-foreground border-transparent";
                        }
                        if (st === "problema") {
                          return teste.status === "problema" && !resolved
                            ? "bg-red-50 text-red-700 border-red-300"
                            : "bg-muted text-muted-foreground border-transparent";
                        }
                        return teste.status === "nao_aplica"
                          ? "bg-slate-50 text-slate-700 border-slate-300"
                          : "bg-muted text-muted-foreground border-transparent";
                      })()}`}
                    >
                      {st === "ok" ? "OK" : st === "problema" ? "Problema" : "N/A"}
                    </button>
                  ))}
                </div>
                {teste.status !== "pendente" && (
                  <button
                    type="button"
                    onClick={() => handleChangeStatusStable(teste.id, "pendente")}
                    className="text-[10px] text-muted-foreground hover:underline"
                  >
                    Voltar para pendente
                  </button>
                )}
              </div>
            )}
          </div>

          {teste.checkTemplate?.tipoCampo === "texto" && (
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Observações / resultado</label>
              <textarea
                className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                rows={2}
                value={teste.observacoes ?? ""}
                onChange={(e) => updateLocalObservacoes(teste.id, e.target.value)}
                onBlur={() => handleBlurObservacoesStable(teste.id)}
              />
            </div>
          )}

          {teste.checkTemplate && (teste.checkTemplate.tipoCampo === "numero" || teste.checkTemplate.tipoCampo === "temperatura") && (
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span>Valor medido</span>
                {teste.checkTemplate.unidade && (
                  <span className="text-[10px] text-muted-foreground">({teste.checkTemplate.unidade})</span>
                )}
              </label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                placeholder="Informe o valor (salvo em observações)"
                value={teste.observacoes ?? ""}
                onChange={(e) => updateLocalObservacoes(teste.id, e.target.value)}
                onBlur={(e) => handleBlurValorMedidoStable(teste.id, e.target.value)}
              />
            </div>
          )}

          {teste.status === "problema" && (
            <>
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <span>Descrição do problema</span>
                </label>
                <textarea
                  className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                  rows={2}
                  value={teste.problemaDescricao ?? ""}
                  onChange={(e) => updateLocalProblema(teste.id, e.target.value)}
                  onBlur={() => handleBlurProblemaStable(teste.id)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">Resolução do problema</label>
                <textarea
                  className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                  rows={2}
                  value={teste.resolucaoTexto ?? ""}
                  onChange={(e) => updateLocalResolucao(teste.id, e.target.value)}
                  onBlur={() => handleBlurResolucaoStable(teste.id)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">Imagem da resolução (opcional)</label>
                <div className="flex items-center gap-2 flex-wrap">
                  <input type="file" accept="image/*" className="text-[11px]" onChange={(e) => handleUploadImageStable(teste.id, "resolucaoImagem", e.target.files?.[0])} />
                  {teste.resolucaoImagem && (
                    <button type="button" className="text-[11px] text-red-600 hover:underline" onClick={() => handleClearImageStable(teste.id, "resolucaoImagem")}>Remover imagem</button>
                  )}
                </div>
                {teste.resolucaoImagem && (
                  <div className="mt-1">
                    <button type="button" onClick={() => setPreviewImage({ src: teste.resolucaoImagem as string, alt: "Imagem da resolução" })}>
                      <img src={teste.resolucaoImagem} alt="Imagem da resolução" className="h-20 rounded-md border object-cover" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">Imagem do problema (opcional)</label>
                <div className="flex items-center gap-2 flex-wrap">
                  <input type="file" accept="image/*" className="text-[11px]" onChange={(e) => handleUploadImageStable(teste.id, "evidenciaImagem", e.target.files?.[0])} />
                  {teste.evidenciaImagem && (
                    <button type="button" className="text-[11px] text-red-600 hover:underline" onClick={() => handleClearImageStable(teste.id, "evidenciaImagem")}>Remover imagem</button>
                  )}
                </div>
                {teste.evidenciaImagem && (
                  <div className="mt-1">
                    <button type="button" onClick={() => setPreviewImage({ src: teste.evidenciaImagem as string, alt: "Imagem do problema" })}>
                      <img src={teste.evidenciaImagem} alt="Imagem do problema" className="h-20 rounded-md border object-cover" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {teste.error && <div className="text-[11px] text-red-500">{teste.error}</div>}
          {teste.saving && <div className="text-[11px] text-muted-foreground">Salvando...</div>}
        </li>
      );
    }),
    []
  );

  // mapa de configuração das areas (usado também para filtrar por responsável)
  const paradaAreasMap = useMemo(() => {
    const map: Record<number, any> = {};
    if (!paradaAreas || !Array.isArray(paradaAreas)) return map;
    paradaAreas.forEach((p) => {
      if (p && typeof p.areaId === "number") map[p.areaId] = p;
    });
    return map;
  }, [paradaAreas]);

  const pagination = useMemo(() => {
    if (!localTestes.length) {
      return {
        grupos: [] as {
          areaId: number | null;
          areaNome: string;
          equipamentos: {
            equipamento: Equipamento;
            testes: LocalTesteState[];
          }[];
        }[],
        totalEquipamentos: 0,
        totalPages: 1,
        currentPage: 1,
        start: 0,
        countVisible: 0,
        statsByArea: {} as Record<
          string,
          { total: number; resolved: number; equipamentosIds: Set<number> }
        >,
      };
    }

    const porArea: Record<
      string,
      {
        areaId: number | null;
        areaNome: string;
        porEquip: Record<
          number,
          { equipamento: Equipamento; testes: LocalTesteState[] }
        >;
      }
    > = {};

    // aplicar filtros antes de agrupar
    const filteredTestes = localTestes.filter((teste) => {
      // filtro por área (select)
      if (filterAreaId !== "all") {
        const aid = teste.equipamento.area?.id ?? null;
        if (aid !== filterAreaId) return false;
      }
      // filtro por equipamento (nome ou tag)
      if (filterEquipQuery && filterEquipQuery.trim() !== "") {
        const q = filterEquipQuery.toLowerCase();
        const nome = (teste.equipamento.nome || "").toLowerCase();
        const tag = (teste.equipamento.tag || "").toLowerCase();
        if (!nome.includes(q) && !tag.includes(q)) return false;
      }
      // filtro por responsável de área (substring)
      if (filterResponsavel && filterResponsavel.trim() !== "") {
        const areaId = teste.equipamento.area?.id ?? null;
        const cfg = areaId != null ? paradaAreasMap[areaId] : undefined;
        const resp = (cfg?.responsavelNome || cfg?.responsavel || "").toLowerCase();
        if (!resp.includes(filterResponsavel.toLowerCase())) return false;
      }
      return true;
    });

    filteredTestes.forEach((teste) => {
      const areaNome = teste.equipamento.area?.nome ?? "Sem área";
      const areaId = teste.equipamento.area?.id ?? null;
      const key = `${areaId ?? 'no-area'}_${areaNome}`;
      if (!porArea[key]) {
        porArea[key] = {
          areaId,
          areaNome,
          porEquip: {},
        };
      }
      const equipId = teste.equipamento.id;
      if (!porArea[key].porEquip[equipId]) {
        porArea[key].porEquip[equipId] = {
          equipamento: teste.equipamento,
          testes: [],
        };
      }
      porArea[key].porEquip[equipId].testes.push(teste);
    });

    const statsByArea: Record<
      string,
      {
        total: number;
        resolved: number;
        equipamentosIds: Set<number>;
      }
    > = {};

    const rows: {
      areaNome: string;
      equipamento: Equipamento;
      testes: LocalTesteState[];
    }[] = [];

    Object.values(porArea).forEach((area) => {
      Object.values(area.porEquip).forEach((e) => {
        const statKey = area.areaNome;
        if (!statsByArea[statKey]) {
          statsByArea[statKey] = {
            total: 0,
            resolved: 0,
            equipamentosIds: new Set<number>(),
          };
        }
        statsByArea[statKey].equipamentosIds.add(e.equipamento.id);
        e.testes.forEach((t) => {
          statsByArea[statKey].total += 1;
          if (isResolved(t)) {
            statsByArea[statKey].resolved += 1;
          }
        });

        rows.push({
          areaNome: area.areaNome,
          equipamento: e.equipamento,
          testes: e.testes,
        });
      });
    });

    const totalEquipamentos = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalEquipamentos / pageSize));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * pageSize;
    const visibleRows = rows.slice(start, start + pageSize);

    const areaGroup: Record<
      string,
      {
        areaId: number | null;
        areaNome: string;
        equipamentos: {
          equipamento: Equipamento;
          testes: LocalTesteState[];
        }[];
      }
    > = {};

    visibleRows.forEach((row) => {
      if (!areaGroup[row.areaNome]) {
        // Encontrar o ID da área correspondente ao nome
        const foundArea = Object.values(porArea).find(a => a.areaNome === row.areaNome);
        areaGroup[row.areaNome] = {
          areaId: foundArea?.areaId ?? null,
          areaNome: row.areaNome,
          equipamentos: [],
        };
      }
      areaGroup[row.areaNome].equipamentos.push({
        equipamento: row.equipamento,
        testes: row.testes,
      });
    });
      return {
        grupos: Object.values(areaGroup).map((g) => ({ areaId: g.areaId, areaNome: g.areaNome, equipamentos: g.equipamentos })),
      totalEquipamentos,
      totalPages,
      currentPage,
      start,
      countVisible: visibleRows.length,
      statsByArea,
    };
  }, [localTestes, page, pageSize, filterResponsavel, filterAreaId, filterEquipQuery, paradaAreasMap]);
  
  // lista de areas disponível (para o select)
  const areaOptions = useMemo(() => {
    const map = new Map<number | null, string>();
    localTestes.forEach((t) => {
      const id = t.equipamento.area?.id ?? null;
      const name = t.equipamento.area?.nome ?? "Sem área";
      if (!map.has(id)) map.set(id, name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [localTestes]);

  // debug: log pagination values to console for troubleshooting
  useMemo(() => {
    // only log in development or when dbg param is set in URL
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("dbg") === "1") setShowDebug(true);
      }
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line no-console
    console.debug && console.debug("[ParadaChecks] pagination:", {
      totalEquipamentos: pagination?.totalEquipamentos,
      totalPages: pagination?.totalPages,
      currentPage: pagination?.currentPage,
      start: pagination?.start,
      countVisible: pagination?.countVisible,
      pageSize,
      localTestesLength: localTestes.length,
    });
  }, [pagination, pageSize, localTestes.length]);

    

  const areasConfigMap = useMemo(() => {
    const map: Record<string, any> = {};
    if (!areasConfig || !Array.isArray(areasConfig)) return map;
    areasConfig.forEach((a) => {
      const key = a.areaNome ?? String(a.areaId ?? a.areaId);
      map[key] = a;
    });
    return map;
  }, [areasConfig]);

  // resetar pagina quando filtros mudam
  const onFilterChange = () => setPage(1);

  if (!localTestes.length) {
    return (
      <p className="text-muted-foreground text-sm">
        Nenhum check configurado ainda.
      </p>
    );
  }

  // filtro UI
  const FiltersBar = () => (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <input
        placeholder="Filtrar por responsável da área"
        className="rounded-md border bg-background px-2 py-1 text-xs"
        value={filterResponsavel}
        onChange={(e) => {
          setFilterResponsavel(e.target.value);
          onFilterChange();
        }}
      />

      <select
        className="rounded-md border bg-background px-2 py-1 text-xs"
        value={filterAreaId === "all" ? "all" : String(filterAreaId)}
        onChange={(e) => {
          const v = e.target.value;
          setFilterAreaId(v === "all" ? "all" : Number(v));
          onFilterChange();
        }}
      >
        <option value="all">Todas as áreas</option>
        {areaOptions.map((a) => (
          <option key={String(a.id)} value={a.id === null ? "null" : String(a.id)}>
            {a.name}
          </option>
        ))}
      </select>

      <input
        placeholder="Filtrar por equipamento (nome ou tag)"
        className="rounded-md border bg-background px-2 py-1 text-xs"
        value={filterEquipQuery}
        onChange={(e) => {
          setFilterEquipQuery(e.target.value);
          onFilterChange();
        }}
      />

      <button
        type="button"
        className="text-[12px] text-muted-foreground hover:underline"
        onClick={() => {
          setFilterResponsavel("");
          setFilterAreaId("all");
          setFilterEquipQuery("");
          onFilterChange();
        }}
      >
        Limpar filtros
      </button>
    </div>
  );

  // Debug panel: visible when ?dbg=1 is present in URL
  const DebugPanel = () => {
    if (!showDebug) return null;
    return (
      <div className="fixed right-4 bottom-4 z-50 w-[360px] max-h-[50vh] overflow-auto rounded border bg-white/95 p-3 text-xs shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <strong>ParadaChecks Debug</strong>
          <button className="text-[11px] text-muted-foreground" onClick={() => setShowDebug(false)}>Fechar</button>
        </div>
        <pre className="whitespace-pre-wrap break-words text-[11px] text-slate-700">{JSON.stringify({
          totalEquipamentos: pagination.totalEquipamentos,
          totalPages: pagination.totalPages,
          currentPage: pagination.currentPage,
          start: pagination.start,
          countVisible: pagination.countVisible,
          pageSize,
          localTestesLength: localTestes.length,
        }, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <FiltersBar />
      {pagination.grupos.map(({ areaId, areaNome, equipamentos }) => {
        const stats = pagination.statsByArea?.[areaNome];
        const totalChecks = stats?.total ?? 0;
        const resolvedChecks = stats?.resolved ?? 0;
        const equipamentosCount = stats
          ? stats.equipamentosIds.size
          : equipamentos.length;
        const percent =
          totalChecks > 0
            ? Math.round((resolvedChecks / totalChecks) * 100)
            : 0;

        return (
        <div
          key={areaNome}
          className={`space-y-2 rounded-xl border bg-muted/40 p-3 ${
            !collapsedAreas[areaNome] ? "border-emerald-200 bg-emerald-50/10" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleAreaCollapsed(areaNome)}
                aria-label={collapsedAreas[areaNome] ? "Abrir área" : "Fechar área"}
                className={`rounded-full p-1 flex items-center justify-center transition-colors ${
                  !collapsedAreas[areaNome]
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "bg-muted text-muted-foreground hover:bg-slate-100"
                }`}
              >
                {!collapsedAreas[areaNome] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {areaNome}
              </h3>
            </div>
            {totalChecks > 0 && (
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span>
                  {equipamentosCount} equip. · {totalChecks} checks
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-emerald-700">
                    {resolvedChecks}/{totalChecks} OK
                  </span>
                  <div className="h-1.5 w-20 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {!collapsedAreas[areaNome] && equipamentos.map(({ equipamento, testes }) => (
              <div key={equipamento.id} className="rounded-lg border bg-background p-3 space-y-2 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm">{equipamento.nome} {" "}<span className="text-xs text-muted-foreground">({equipamento.tag})</span></div>
                    <div className="text-[11px] text-muted-foreground">Tipo: {equipamento.tipo?.nome ?? "—"}</div>
                  </div>
                </div>
                <ul className="space-y-1">
                  {testes.map((teste) => (
                    <TesteCard key={teste.id} teste={teste} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {/* rodapé: responsável e equipe para a área, se disponível */}
          <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
            {(() => {
              const cfg = areaId != null ? paradaAreasMap[areaId] : undefined;
              if (!cfg) return <div>Responsável: -</div>;
              return (
                <div className="space-y-1">
                  <div>
                    <span className="font-medium">Responsável: </span>
                    <span>{cfg.responsavelNome || cfg.responsavel || '-'}</span>
                  </div>
                  {cfg.membros && cfg.membros.length > 0 && (
                    <div>
                      <span className="font-medium">Equipe: </span>
                      <span>{cfg.membros.map((m: any) => m.nome).filter(Boolean).join(', ') || '-'}</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      );
      })}

      <div className="flex items-center justify-between pt-2 border-t mt-2 text-xs">
        <span className="text-muted-foreground">
          Mostrando equipamentos {pagination.start + 1}-
          {pagination.start + pagination.countVisible} de{" "}
          {pagination.totalEquipamentos}
        </span>
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-muted-foreground">Mostrar</label>
          <select
            className="rounded-md border bg-background px-2 py-1 text-xs"
            value={pageSize}
            onChange={(e) => {
              const v = Number(e.target.value) || DEFAULT_PAGE_SIZE;
              setPageSize(v);
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          {pagination.totalPages > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span className="text-muted-foreground">
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                Próxima
              </Button>
            </>
          )}
        </div>
      </div>

      <Dialog
        open={!!previewImage}
        onOpenChange={(open) => {
          if (!open) setPreviewImage(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          {previewImage && (
            <img
              src={previewImage.src}
              alt={previewImage.alt}
              className="max-h-[70vh] w-full object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
