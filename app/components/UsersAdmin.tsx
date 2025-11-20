"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";

type User = {
  id: number;
  name: string;
  email: string;
  username: string | null;
  role: string | null;
};

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("usuario");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setNome("");
    setUsername("");
    setEmail("");
    setSenha("");
    setPerfil("usuario");
    setError("");
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setNome(user.name);
    setUsername(user.username || "");
    setEmail(user.email);
    setSenha(""); // Don't show password
    setPerfil(user.role || "usuario");
    setError("");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao excluir");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const url = editingId ? `/api/users/${editingId}` : "/api/users";
      const method = editingId ? "PUT" : "POST";
      
      const body: any = {
        name: nome,
        email,
        username,
        role: perfil,
      };
      
      if (senha) {
        body.password = senha;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        resetForm();
        fetchUsers();
      } else {
        setError(data.error || "Erro ao salvar");
      }
    } catch (err) {
      console.error(err);
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <section className="mb-8 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{editingId ? "Editar usuário" : "Novo usuário"}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Nome completo</label>
            <input 
              required
              placeholder="Ex: João Silva" 
              value={nome} 
              onChange={(e)=>setNome(e.target.value)} 
              className="w-full rounded-md border bg-background px-3 py-2 text-sm" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Username</label>
            <input 
              placeholder="Ex: joaosilva" 
              value={username} 
              onChange={(e)=>setUsername(e.target.value)} 
              className="w-full rounded-md border bg-background px-3 py-2 text-sm" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">E-mail</label>
            <input 
              required
              placeholder="Ex: joao@exemplo.com" 
              type="email" 
              value={email} 
              onChange={(e)=>setEmail(e.target.value)} 
              className="w-full rounded-md border bg-background px-3 py-2 text-sm" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Senha {editingId && "(deixe em branco para manter)"}</label>
            <input 
              required={!editingId}
              placeholder="******" 
              type="password" 
              value={senha} 
              onChange={(e)=>setSenha(e.target.value)} 
              className="w-full rounded-md border bg-background px-3 py-2 text-sm" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Perfil</label>
            <select 
              value={perfil} 
              onChange={(e)=>setPerfil(e.target.value)} 
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="usuario">Usuário</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
          
          <div className="md:col-span-3 flex items-center gap-2 pt-2">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Atualizar" : "Criar Usuário"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar / Limpar
            </Button>
            {error && <span className="text-sm text-red-500 ml-2">{error}</span>}
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Usuários existentes</h2>
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Nenhum usuário encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Username</th>
                    <th className="px-4 py-3 font-medium">E-mail</th>
                    <th className="px-4 py-3 font-medium">Perfil</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.username || "-"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          user.role === 'superadmin' ? 'bg-purple-50 text-purple-700 ring-purple-600/20' :
                          user.role === 'admin' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                          'bg-gray-50 text-gray-600 ring-gray-500/10'
                        }`}>
                          {user.role || 'usuario'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} title="Excluir" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
