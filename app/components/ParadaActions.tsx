"use client";

import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ParadaActions({ paradaId }: { paradaId: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta parada?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/paradas/${paradaId}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Erro ao excluir parada");
        setDeleting(false);
        return;
      }
      router.push("/paradas-ativas");
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir parada");
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        onClick={() => router.push(`/paradas/${paradaId}/editar`)}
      >
        Editar parada
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.push(`/paradas/${paradaId}/configurar`)}
      >
        Configurar áreas e equipamentos
      </Button>
      <Button
        variant="outline"
        className="w-full text-red-600 border-red-300 hover:bg-red-50"
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? "Excluindo..." : "Excluir parada"}
      </Button>
    </div>
  );
}

