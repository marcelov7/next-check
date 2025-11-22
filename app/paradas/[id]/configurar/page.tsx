"use client";

import PageLayout from "@/app/components/PageLayout";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Plus,
  Users,
} from "lucide-react";

type Parada = {
  id: number;
  nome: string;
  macro: string | null;
  testes?: Teste[];
};

type Area = {
  id: number;
  nome: string;
};

type Equipamento = {
  id: number;
  nome: string;
  tag: string;
  ativo: boolean;
  areaId: number;
  tipoId: number | null;
  area: { id: number; nome: string };
  tipo?: { id: number; nome: string } | null;
};

type Teste = {
  id: number;
  equipamentoId: number;
  checkTemplateId: number | null;
};

type CheckTemplate = {
  id: number;
  nome: string;
  descricao: string | null;
  ordem: number | null;
  obrigatorio: boolean;
  tipoId: number;
};

type MembroEquipe = {
  nome: string;
  setor: string;
};

type AreaConfig = {
  areaId: number;
  aberta: boolean;
  selecionada: boolean;
  selecionarTodosEquip: boolean;
  equipamentosSelecionados: number[];
  responsavel: string;
  equipeHabilitada: boolean;
  membros: MembroEquipe[];
};

export default function ParadaConfigurarPage() {
  const params = useParams();
  const paradaId = Number(params?.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parada, setParada] = useState<Parada | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [templates, setTemplates] = useState<CheckTemplate[]>([]);
  const [configPorArea, setConfigPorArea] = useState<Record<number, AreaConfig>>(
    {}
  );
  const [showTemplates, setShowTemplates] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paradaId || Number.isNaN(paradaId)) return;

    const carregar = async () => {
      setLoading(true);
      setError(null);
      try {
        const [paradaRes, areasRes, equipsRes, templatesRes] = await Promise.all([
          fetch(`/api/paradas/${paradaId}`),
          fetch("/api/areas"),
          fetch("/api/equipamentos"),
          fetch("/api/check-templates"),
        ]);

        if (!paradaRes.ok) {
          throw new Error("Erro ao carregar dados da parada");
        }

        const paradaData = await paradaRes.json();
        const areasData = await areasRes.json();
        const equipsData = await equipsRes.json();
        const templatesData = await templatesRes.json();

        setParada({
          id: paradaData.id,
          nome: paradaData.nome,
          macro: paradaData.macro ?? null,
          testes: paradaData.testes ?? [],
        });
        setAreas(areasData);
        setEquipamentos(equipsData);
        setTemplates(templatesData);

        const initialConfig: Record<number, AreaConfig> = {};

        const testes: Teste[] = paradaData.testes ?? [];
        const equipamentosSelecionadosIds = new Set(
          testes.map((t: Teste) => t.equipamentoId)
        );
        (areasData as Area[]).forEach((area) => {
          const equipsDaArea = (equipsData as Equipamento[]).filter(
            (eq) => eq.areaId === area.id && eq.ativo
          );
          const selecionadosNaArea = equipsDaArea.filter((eq) =>
            equipamentosSelecionadosIds.has(eq.id)
          );

          initialConfig[area.id] = {
            areaId: area.id,
            aberta: false,
            selecionada: selecionadosNaArea.length > 0,
            selecionarTodosEquip:
              selecionadosNaArea.length > 0 &&
              selecionadosNaArea.length === equipsDaArea.length,
            equipamentosSelecionados: selecionadosNaArea.map((e) => e.id),
            responsavel: "",
            equipeHabilitada: false,
            membros: [],
          };
        });
        // aplicar configuração salva (se existir) para preencher responsáveis e membros
        const savedAreas = paradaData.areasConfig ?? [];
        if (Array.isArray(savedAreas) && savedAreas.length) {
          (savedAreas as any[]).forEach((saved) => {
            const areaId = Number(saved.areaId);
            if (!initialConfig[areaId]) return;
            const equipsDaArea = (equipsData as Equipamento[]).filter(
              (eq) => eq.areaId === areaId && eq.ativo
            );
            const selecionadosFromSaved: number[] = Array.isArray(saved.equipamentosSelecionados)
              ? saved.equipamentosSelecionados.map((v: any) => Number(v)).filter((n: number) => !Number.isNaN(n))
              : initialConfig[areaId].equipamentosSelecionados;

            const selecionarTodosEquip =
              selecionadosFromSaved.length > 0 && selecionadosFromSaved.length === equipsDaArea.length;

            initialConfig[areaId] = {
              ...initialConfig[areaId],
              equipamentosSelecionados: selecionadosFromSaved,
              selecionarTodosEquip,
              selecionada: selecionadosFromSaved.length > 0,
              responsavel: saved.responsavel ?? initialConfig[areaId].responsavel,
              membros: Array.isArray(saved.membros) ? saved.membros : initialConfig[areaId].membros,
              equipeHabilitada: Array.isArray(saved.membros) ? saved.membros.length > 0 : initialConfig[areaId].equipeHabilitada,
            };
          });
        }

        setConfigPorArea(initialConfig);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os dados para configuração.");
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [paradaId]);

  const groupedEquipamentosPorArea = useMemo(() => {
    const map: Record<number, Equipamento[]> = {};
    equipamentos.forEach((eq) => {
      if (!map[eq.areaId]) map[eq.areaId] = [];
      if (eq.ativo) map[eq.areaId].push(eq);
    });
    return map;
  }, [equipamentos]);

  const templatesPorTipo = useMemo(() => {
    const map: Record<number, CheckTemplate[]> = {};
    templates.forEach((tpl) => {
      if (!map[tpl.tipoId]) map[tpl.tipoId] = [];
      map[tpl.tipoId].push(tpl);
    });
    // ordenar por ordem se existir
    Object.values(map).forEach((list) =>
      list.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
    );
    return map;
  }, [templates]);

  const toggleAreaAberta = (areaId: number) => {
    setConfigPorArea((prev) => ({
      ...prev,
      [areaId]: {
        ...(prev[areaId] ?? {
          areaId,
          aberta: false,
          selecionada: false,
          selecionarTodosEquip: false,
          equipamentosSelecionados: [],
          responsavel: "",
          equipeHabilitada: false,
          membros: [],
        }),
        aberta: !prev[areaId]?.aberta,
      },
    }));
  };

  const toggleSelecionarArea = (areaId: number) => {
    const equipsDaArea = groupedEquipamentosPorArea[areaId] ?? [];
    setConfigPorArea((prev) => {
      const atual = prev[areaId];
      const selecionada = !atual?.selecionada;
      return {
        ...prev,
        [areaId]: {
          ...(atual ?? {
            areaId,
            aberta: true,
            selecionada: false,
            selecionarTodosEquip: false,
            equipamentosSelecionados: [],
            responsavel: "",
            equipeHabilitada: false,
            membros: [],
          }),
          selecionada,
          selecionarTodosEquip: selecionada && equipsDaArea.length > 0,
          equipamentosSelecionados: selecionada
            ? equipsDaArea.map((e) => e.id)
            : [],
        },
      };
    });
  };

  const toggleSelecionarTodosEquip = (areaId: number) => {
    const equipsDaArea = groupedEquipamentosPorArea[areaId] ?? [];
    setConfigPorArea((prev) => {
      const atual = prev[areaId];
      const selecionarTodos = !atual?.selecionarTodosEquip;
      return {
        ...prev,
        [areaId]: {
          ...(atual as AreaConfig),
          selecionarTodosEquip: selecionarTodos,
          equipamentosSelecionados: selecionarTodos
            ? equipsDaArea.map((e) => e.id)
            : [],
          selecionada: selecionarTodos ? true : atual?.selecionada ?? false,
        },
      };
    });
  };

  const toggleEquipamento = (areaId: number, equipamentoId: number) => {
    setConfigPorArea((prev) => {
      const atual = prev[areaId];
      if (!atual) return prev;
      const jaSelecionado = atual.equipamentosSelecionados.includes(equipamentoId);
      const novosSelecionados = jaSelecionado
        ? atual.equipamentosSelecionados.filter((id) => id !== equipamentoId)
        : [...atual.equipamentosSelecionados, equipamentoId];

      const equipsDaArea = groupedEquipamentosPorArea[areaId] ?? [];
      const selecionarTodos =
        equipsDaArea.length > 0 &&
        novosSelecionados.length === equipsDaArea.length;

      return {
        ...prev,
        [areaId]: {
          ...atual,
          equipamentosSelecionados: novosSelecionados,
          selecionarTodosEquip: selecionarTodos,
          selecionada: novosSelecionados.length > 0 ? true : atual.selecionada,
        },
      };
    });
  };

  const updateResponsavel = (areaId: number, value: string) => {
    setConfigPorArea((prev) => ({
      ...prev,
      [areaId]: {
        ...(prev[areaId] as AreaConfig),
        responsavel: value,
      },
    }));
  };

  const toggleEquipeHabilitada = (areaId: number) => {
    setConfigPorArea((prev) => {
      const atual = prev[areaId] as AreaConfig;
      const habilitar = !atual?.equipeHabilitada;
      return {
        ...prev,
        [areaId]: {
          ...atual,
          equipeHabilitada: habilitar,
          membros: habilitar && atual.membros.length === 0
            ? [{ nome: "", setor: "" }]
            : atual.membros,
        },
      };
    });
  };

  const updateMembro = (
    areaId: number,
    index: number,
    field: keyof MembroEquipe,
    value: string
  ) => {
    setConfigPorArea((prev) => {
      const atual = prev[areaId] as AreaConfig;
      const membros = [...atual.membros];
      membros[index] = { ...membros[index], [field]: value };
      return {
        ...prev,
        [areaId]: {
          ...atual,
          membros,
        },
      };
    });
  };

  const adicionarMembro = (areaId: number) => {
    setConfigPorArea((prev) => {
      const atual = prev[areaId] as AreaConfig;
      return {
        ...prev,
        [areaId]: {
          ...atual,
          membros: [...atual.membros, { nome: "", setor: "" }],
        },
      };
    });
  };

  const removerMembro = (areaId: number, index: number) => {
    setConfigPorArea((prev) => {
      const atual = prev[areaId] as AreaConfig;
      const membros = atual.membros.filter((_, i) => i !== index);
      return {
        ...prev,
        [areaId]: {
          ...atual,
          membros,
        },
      };
    });
  };

  const areasSelecionadas = useMemo(
    () =>
      areas.filter((a) => configPorArea[a.id]?.equipamentosSelecionados.length),
    [areas, configPorArea]
  );

  const equipamentosSelecionados = useMemo(() => {
    const ids = new Set<number>();
    Object.values(configPorArea).forEach((cfg) => {
      cfg.equipamentosSelecionados.forEach((id) => ids.add(id));
    });
    return equipamentos.filter((eq) => ids.has(eq.id));
  }, [configPorArea, equipamentos]);

  const templatesGerados = useMemo(() => {
    const porEquip: {
      equipamento: Equipamento;
      templates: CheckTemplate[];
    }[] = [];

    equipamentosSelecionados.forEach((eq) => {
      if (!eq.tipoId) return;
      const list = templatesPorTipo[eq.tipoId] ?? [];
      if (!list.length) return;
      porEquip.push({
        equipamento: eq,
        templates: list,
      });
    });

    return porEquip;
  }, [equipamentosSelecionados, templatesPorTipo]);

  const handleSalvarConfiguracao = async () => {
    if (!areasSelecionadas.length) {
      setError("Selecione pelo menos uma área/equipamento para continuar.");
      return;
    }
    // validar responsável por área
    const faltandoResponsavel = areasSelecionadas.filter(
      (a) => !(configPorArea[a.id]?.responsavel ?? "").trim()
    );

    if (faltandoResponsavel.length) {
      setError("Defina um responsável para cada área selecionada.");
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setSaving(true);
    try {
      const equipamentosIds = equipamentosSelecionados.map((e) => e.id);

      const areas = areasSelecionadas.map((a) => ({
        areaId: a.id,
        areaNome: a.nome,
        equipamentosSelecionados: configPorArea[a.id]?.equipamentosSelecionados ?? [],
        responsavel: configPorArea[a.id]?.responsavel ?? "",
        membros: configPorArea[a.id]?.membros ?? [],
      }));

      await fetch(`/api/paradas/${paradaId}/configuracao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipamentos: equipamentosIds, areas }),
      });

      setShowTemplates(true);
      setSuccessMessage("Configuração salva com sucesso.");
    } finally {
      setSaving(false);
    }
  };

  if (!paradaId || Number.isNaN(paradaId)) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-4xl py-8">
          <p className="text-sm text-red-500">
            ID da parada inválido na URL.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-6xl py-6 space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">
            Paradas
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold">
            Configurar áreas e equipamentos
          </h1>
          {parada && (
            <p className="text-sm text-muted-foreground">
              Parada{" "}
              <span className="font-medium">
                {parada.macro ? `${parada.macro} - ` : ""}
                {parada.nome}
              </span>
            </p>
          )}
          <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
            <span>Etapa 2: Áreas e equipamentos</span>
          </div>
        </header>

        <div className="flex items-center justify-between gap-3">
          <Link
            href={parada ? `/paradas/${parada.id}` : "/paradas-ativas"}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            &larr; Voltar para detalhes da parada
          </Link>
        </div>

        {successMessage && (
          <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {successMessage}
          </div>
        )}

        {loading ? (
          <div className="py-10 text-center text-muted-foreground">
            Carregando dados da parada...
          </div>
        ) : error ? (
          <div className="py-4 text-sm text-red-500">{error}</div>
        ) : (
          <>
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Selecione as áreas e equipamentos
                </h2>
                <p className="text-sm text-muted-foreground">
                  Escolha uma ou mais áreas, selecione os equipamentos que
                  participarão da parada e defina o colaborador responsável e a
                  equipe de cada área.
                </p>
              </div>

              <div className="space-y-3">
                {areas.map((area) => {
                  const cfg = configPorArea[area.id];
                  const equipsDaArea = groupedEquipamentosPorArea[area.id] ?? [];
                  const algumEquipSelecionado =
                    cfg?.equipamentosSelecionados.length > 0;
                  return (
                    <div
                      key={area.id}
                      className="rounded-xl border bg-card/60 px-4 py-3"
                    >
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-2"
                        onClick={() => toggleAreaAberta(area.id)}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={cfg?.selecionada || algumEquipSelecionado}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelecionarArea(area.id);
                            }}
                            className="h-4 w-4"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="text-left">
                            <div className="font-medium flex items-center gap-2">
                              {cfg?.selecionada || algumEquipSelecionado ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                              )}
                              {area.nome}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {equipsDaArea.length} equipamento
                              {equipsDaArea.length === 1 ? "" : "s"} cadastrado
                            </p>
                          </div>
                        </div>
                        {cfg?.aberta ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>

                      {cfg?.aberta && (
                        <div className="mt-3 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={cfg.selecionarTodosEquip}
                                onChange={() =>
                                  toggleSelecionarTodosEquip(area.id)
                                }
                              />
                              <span className="text-xs sm:text-sm text-muted-foreground">
                                Selecionar todos os equipamentos da área
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {equipsDaArea.length === 0 ? (
                              <p className="text-xs text-muted-foreground">
                                Nenhum equipamento cadastrado para esta área.
                              </p>
                            ) : (
                              equipsDaArea.map((eq) => (
                                <button
                                  key={eq.id}
                                  type="button"
                                  onClick={() =>
                                    toggleEquipamento(area.id, eq.id)
                                  }
                                  className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs sm:text-sm transition ${
                                    cfg.equipamentosSelecionados.includes(eq.id)
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-background hover:bg-accent"
                                  }`}
                                >
                                  <span className="font-medium">
                                    {eq.nome}
                                  </span>
                                  <span className="opacity-80">
                                    ({eq.tag})
                                  </span>
                                </button>
                              ))
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t pt-3 mt-2">
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">
                                Colaborador responsável pela área
                              </label>
                              <input
                                type="text"
                                value={cfg.responsavel}
                                onChange={(e) =>
                                  updateResponsavel(area.id, e.target.value)
                                }
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                placeholder="Ex: João Silva - Supervisor"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  Equipe (opcional)
                                </label>
                                <button
                                  type="button"
                                  onClick={() => toggleEquipeHabilitada(area.id)}
                                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                  <Plus className="h-3 w-3" />
                                  {cfg.equipeHabilitada
                                    ? "Remover equipe"
                                    : "Adicionar equipe"}
                                </button>
                              </div>

                              {cfg.equipeHabilitada && (
                                <div className="space-y-2 rounded-md border bg-background/50 p-2">
                                  {cfg.membros.map((membro, index) => (
                                    <div
                                      key={index}
                                      className="flex flex-col sm:flex-row gap-2"
                                    >
                                      <input
                                        type="text"
                                        value={membro.nome}
                                        onChange={(e) =>
                                          updateMembro(
                                            area.id,
                                            index,
                                            "nome",
                                            e.target.value
                                          )
                                        }
                                        className="flex-1 rounded-md border bg-background px-2 py-1 text-xs"
                                        placeholder="Nome"
                                      />
                                      <input
                                        type="text"
                                        value={membro.setor}
                                        onChange={(e) =>
                                          updateMembro(
                                            area.id,
                                            index,
                                            "setor",
                                            e.target.value
                                          )
                                        }
                                        className="flex-1 rounded-md border bg-background px-2 py-1 text-xs"
                                        placeholder="Setor"
                                      />
                                      <button
                                        type="button"
                                        className="text-xs text-red-500 px-1"
                                        onClick={() =>
                                          removerMembro(area.id, index)
                                        }
                                      >
                                        Remover
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => adicionarMembro(area.id)}
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                  >
                                    <Plus className="h-3 w-3" />
                                    Adicionar membro
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="flex items-center justify-between gap-3 pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Áreas selecionadas:{" "}
                <span className="font-medium">
                  {areasSelecionadas.length}
                </span>
              </p>
              <div className="flex gap-2">
                <Link href={parada ? `/paradas/${parada.id}` : "/paradas-ativas"}>
                  <Button variant="outline" size="sm">
                    Voltar
                  </Button>
                </Link>
                <Button
                  size="sm"
                  onClick={handleSalvarConfiguracao}
                  disabled={saving || !areasSelecionadas.length}
                >
                  {saving ? "Processando..." : "Salvar e ver checks"}
                </Button>
              </div>
            </div>

            {showTemplates && (
              <section className="mt-6 space-y-3">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Checks previstos para esta parada
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Abaixo estão os templates de check configurados em{" "}
                    <Link
                      href="/check-templates"
                      className="underline text-primary"
                    >
                      Check Templates
                    </Link>{" "}
                    para os tipos de equipamento selecionados. Eles mostram o
                    nome do check e o que deverá ser feito.
                  </p>
                </div>

                {templatesGerados.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum template de check encontrado para os tipos de
                    equipamento selecionados.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {templatesGerados.map(({ equipamento, templates }) => (
                      <div
                        key={equipamento.id}
                        className="rounded-xl border bg-card/60 p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="font-medium">
                              {equipamento.nome}{" "}
                              <span className="text-xs text-muted-foreground">
                                ({equipamento.tag})
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Tipo: {equipamento.tipo?.nome ?? "—"} · Área:{" "}
                              {equipamento.area?.nome ?? "—"}
                            </div>
                          </div>
                        </div>

                        <ul className="mt-2 space-y-1 text-sm">
                          {templates.map((tpl) => (
                            <li
                              key={tpl.id}
                              className="rounded-md border bg-background/80 px-3 py-2"
                            >
                              <div className="font-medium flex items-center gap-2">
                                {tpl.obrigatorio && (
                                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-600/10">
                                    Obrigatório
                                  </span>
                                )}
                                {tpl.nome}
                              </div>
                              {tpl.descricao && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {tpl.descricao}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
