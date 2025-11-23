"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
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
  const [localTestes, setLocalTestes] = useState<LocalTesteState[]>(() =>
    testes as LocalTesteState
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

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

    localTestes.forEach((teste) => {
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
  }, [localTestes, page, pageSize]);

    const paradaAreasMap = useMemo(() => {
      const map: Record<number, any> = {};
      if (!paradaAreas || !Array.isArray(paradaAreas)) return map;
      paradaAreas.forEach((p) => {
        if (p && typeof p.areaId === 'number') map[p.areaId] = p;
      });
      return map;
    }, [paradaAreas]);

  const areasConfigMap = useMemo(() => {
    const map: Record<string, any> = {};
    if (!areasConfig || !Array.isArray(areasConfig)) return map;
    areasConfig.forEach((a) => {
      const key = a.areaNome ?? String(a.areaId ?? a.areaId);
      map[key] = a;
    });
    return map;
  }, [areasConfig]);

  if (!localTestes.length) {
    return (
      <p className="text-muted-foreground text-sm">
        Nenhum check configurado ainda.
      </p>
    );
  }

  return (
    <div className="space-y-4">
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
          className="space-y-2 rounded-xl border bg-muted/40 p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {areaNome}
            </h3>
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
            {equipamentos.map(({ equipamento, testes }) => (
              <div
                key={equipamento.id}
                className="rounded-lg border bg-background p-3 space-y-2 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm">
                      {equipamento.nome}{" "}
                      <span className="text-xs text-muted-foreground">
                        ({equipamento.tag})
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Tipo: {equipamento.tipo?.nome ?? "—"}
                    </div>
                  </div>
                </div>
                <ul className="space-y-1">
                  {testes.map((teste) => (
                    <li
                      key={teste.id}
                      className="flex flex-col gap-2 rounded-md border bg-card px-3 py-2 text-xs"
                    >
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
                              {teste.checkTemplate.tipoCampo ===
                                "temperatura" && (
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
                              {(["ok", "problema", "nao_aplica"] as const).map(
                                (st) => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() =>
                                      handleChangeStatus(teste, st)
                                    }
                                    className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold border ${
                                      (() => {
                                        const resolved = isResolved(teste);
                                        if (st === "ok") {
                                          return resolved
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                            : "bg-muted text-muted-foreground border-transparent";
                                        }
                                        if (st === "problema") {
                                          return teste.status === "problema" &&
                                            !resolved
                                            ? "bg-red-50 text-red-700 border-red-300"
                                            : "bg-muted text-muted-foreground border-transparent";
                                        }
                                        // nao_aplica
                                        return teste.status === "nao_aplica"
                                          ? "bg-slate-50 text-slate-700 border-slate-300"
                                          : "bg-muted text-muted-foreground border-transparent";
                                      })()
                                    }`}
                                  >
                                    {st === "ok"
                                      ? "OK"
                                      : st === "problema"
                                      ? "Problema"
                                      : "N/A"}
                                  </button>
                                )
                              )}
                            </div>
                            {teste.status !== "pendente" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleChangeStatus(teste, "pendente")
                                }
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
                          <label className="text-[11px] text-muted-foreground">
                            Observações / resultado
                          </label>
                          <textarea
                            className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                            rows={2}
                            value={teste.observacoes ?? ""}
                            onChange={(e) =>
                              updateLocalTeste(teste.id, {
                                observacoes: e.target.value,
                              })
                            }
                            onBlur={() => handleBlurObservacoes(teste)}
                          />
                        </div>
                      )}

                      {teste.checkTemplate &&
                        (teste.checkTemplate.tipoCampo === "numero" ||
                          teste.checkTemplate.tipoCampo ===
                            "temperatura") && (
                          <div className="space-y-1">
                            <label className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <span>Valor medido</span>
                              {teste.checkTemplate.unidade && (
                                <span className="text-[10px] text-muted-foreground">
                                  ({teste.checkTemplate.unidade})
                                </span>
                              )}
                            </label>
                            <input
                              type="text"
                              className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                              placeholder="Informe o valor (salvo em observações)"
                              value={teste.observacoes ?? ""}
                              onChange={(e) =>
                                updateLocalTeste(teste.id, {
                                  observacoes: e.target.value,
                                })
                              }
                              onBlur={(e) =>
                                handleBlurValorMedido(
                                  teste.id,
                                  e.target.value
                                )
                              }
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
                                onChange={(e) =>
                                  updateLocalTeste(teste.id, {
                                    problemaDescricao: e.target.value,
                                  })
                                }
                                onBlur={() => handleBlurProblema(teste)}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] text-muted-foreground">
                                Resolução do problema
                              </label>
                              <textarea
                                className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                rows={2}
                                value={teste.resolucaoTexto ?? ""}
                                onChange={(e) =>
                                  updateLocalTeste(teste.id, {
                                    resolucaoTexto: e.target.value,
                                  })
                                }
                                onBlur={() => handleBlurResolucao(teste)}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] text-muted-foreground">
                                Imagem da resolução (opcional)
                              </label>
                              <div className="flex items-center gap-2 flex-wrap">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="text-[11px]"
                                  onChange={(e) =>
                                    handleUploadImage(
                                      teste,
                                      "resolucaoImagem",
                                      e.target.files?.[0]
                                    )
                                  }
                                />
                                {teste.resolucaoImagem && (
                                  <button
                                    type="button"
                                    className="text-[11px] text-red-600 hover:underline"
                                    onClick={() =>
                                      handleClearImage(
                                        teste,
                                        "resolucaoImagem"
                                      )
                                    }
                                  >
                                    Remover imagem
                                  </button>
                                )}
                              </div>
                              {teste.resolucaoImagem && (
                                <div className="mt-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPreviewImage({
                                        src: teste.resolucaoImagem as string,
                                        alt: "Imagem da resolução",
                                      })
                                    }
                                  >
                                    <img
                                      src={teste.resolucaoImagem}
                                      alt="Imagem da resolução"
                                      className="h-20 rounded-md border object-cover"
                                    />
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] text-muted-foreground">
                                Imagem do problema (opcional)
                              </label>
                              <div className="flex items-center gap-2 flex-wrap">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="text-[11px]"
                                  onChange={(e) =>
                                    handleUploadImage(
                                      teste,
                                      "evidenciaImagem",
                                      e.target.files?.[0]
                                    )
                                  }
                                />
                                {teste.evidenciaImagem && (
                                  <button
                                    type="button"
                                    className="text-[11px] text-red-600 hover:underline"
                                    onClick={() =>
                                      handleClearImage(teste, "evidenciaImagem")
                                    }
                                  >
                                    Remover imagem
                                  </button>
                                )}
                              </div>
                              {teste.evidenciaImagem && (
                                <div className="mt-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPreviewImage({
                                        src: teste.evidenciaImagem as string,
                                        alt: "Imagem do problema",
                                      })
                                    }
                                  >
                                    <img
                                      src={teste.evidenciaImagem}
                                      alt="Imagem do problema"
                                      className="h-20 rounded-md border object-cover"
                                    />
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}

                      {teste.error && (
                        <div className="text-[11px] text-red-500">
                          {teste.error}
                        </div>
                      )}
                      {teste.saving && (
                        <div className="text-[11px] text-muted-foreground">
                          Salvando...
                        </div>
                      )}
                    </li>
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

      {pagination.totalEquipamentos > pageSize && (
        <div className="flex items-center justify-between pt-2 border-t mt-2 text-xs">
          <span className="text-muted-foreground">
            Mostrando equipamentos {pagination.start + 1}-
            {pagination.start + pagination.countVisible} de{" "}
            {pagination.totalEquipamentos}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-muted-foreground">Mostrar</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  const next = Number(e.target.value) || DEFAULT_PAGE_SIZE;
                  setPageSize(next);
                  setPage(1);
                }}
                className="rounded-md border bg-background px-2 py-1 text-xs"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() =>
                setPage((p) => Math.max(1, p - 1))
              }
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
              onClick={() =>
                setPage((p) =>
                  Math.min(pagination.totalPages, p + 1)
                )
              }
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

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
