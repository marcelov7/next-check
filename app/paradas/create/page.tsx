import React from "react";
import ParadaCreateForm from "@/app/components/ParadaCreateForm";

export const metadata = {
  title: "Criar Parada",
};

export default function ParadasCreatePage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Nova Parada</h1>
      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <ParadaCreateForm />
      </div>
    </div>
  );
}
