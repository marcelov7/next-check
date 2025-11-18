"use client";

import { useState } from "react";

export default function UsersAdmin() {
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("usuario");

  return (
    <div className="mx-auto max-w-5xl">
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Novo usuário</h2>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input placeholder="Nome completo" value={nome} onChange={(e)=>setNome(e.target.value)} className="rounded-md border px-3 py-2" />
          <input placeholder="username" value={username} onChange={(e)=>setUsername(e.target.value)} className="rounded-md border px-3 py-2" />
          <input placeholder="E-mail" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="rounded-md border px-3 py-2" />
          <input placeholder="Senha" type="password" value={senha} onChange={(e)=>setSenha(e.target.value)} className="rounded-md border px-3 py-2" />
          <select value={perfil} onChange={(e)=>setPerfil(e.target.value)} className="rounded-md border px-3 py-2">
            <option value="usuario">usuario</option>
            <option value="admin">admin</option>
            <option value="superadmin">superadmin</option>
          </select>
          <div className="md:col-span-3 flex gap-2">
            <button type="button" disabled className="rounded-md bg-muted text-muted-foreground px-4 py-2" title="Em breve">Salvar (em breve)</button>
            <button type="button" className="rounded-md border px-4 py-2" onClick={()=>{setNome("");setUsername("");setEmail("");setSenha("");setPerfil("usuario");}}>Limpar</button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Usuários existentes</h2>
        <div className="rounded-md border p-4 text-sm text-muted-foreground">Listagem e edição em breve.</div>
      </section>
    </div>
  );
}
