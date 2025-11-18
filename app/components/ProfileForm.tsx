"use client";

import { useEffect, useState, useRef } from "react";

type User = { id: number; name: string; email: string; username?: string | null; image?: string | null };

export default function ProfileForm() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMe = async () => {
    const res = await fetch('/api/me');
    if (res.ok) {
      const data = await res.json();
      setUser(data);
      setName(data?.name ?? '');
      setUsername(data?.username ?? '');
      setEmail(data?.email ?? '');
      setImagePreview(data?.image ?? '');
      setImageInput(data?.image ?? '');
    }
  };

  useEffect(() => { fetchMe(); }, []);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onFile = (f?: File) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const v = String(reader.result);
      setImagePreview(v);
      // clear the text input so the data URL is not shown
      setImageInput('');
    };
    reader.readAsDataURL(f);
  };

  const triggerFile = () => fileInputRef.current?.click();

  const removeAvatar = () => {
    if (!confirm('Remover avatar? Isso irá usar as iniciais como avatar.')) return;
    setImagePreview('');
    setImageInput('');
  };

  const getInitials = (fullName = '') => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return (parts[0].slice(0,1) + parts[parts.length-1].slice(0,1)).toUpperCase();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload: any = { name, username, email, image: imagePreview || imageInput };
    if (password) payload.password = password;
    const res = await fetch('/api/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) {
      alert('Perfil atualizado');
      setPassword('');
      await fetchMe();
    } else {
      const err = await res.json();
      alert('Erro: ' + (err?.error ?? 'unknown'));
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nome completo</label>
          <input required value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Username</label>
          <input value={username ?? ''} onChange={(e)=>setUsername(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">E-mail</label>
          <input required type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Senha (deixe em branco para manter)</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>

        <div className="flex flex-col items-center md:items-start">
          <label className="block text-sm font-medium">Avatar (URL ou upload)</label>
          <input value={imageInput} onChange={(e)=>setImageInput(e.target.value)} onBlur={() => { if (imageInput) setImagePreview(imageInput); }} placeholder="https://... ou base64" className="mt-1 w-full rounded-md border px-3 py-2" />
          <div className="mt-2">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e)=>onFile(e.target.files?.[0])} className="hidden" />
            <button type="button" onClick={triggerFile} className="mr-2 rounded-md border px-3 py-1 text-sm md:text-base">Procurar...</button>
          </div>

          <div className="mt-3 flex flex-col items-center md:items-start gap-2">
            {(imagePreview || imageInput) ? (
              <div className="flex flex-col items-center md:items-start gap-2">
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden border ring-1 ring-muted/20">
                  <img src={imagePreview || imageInput} alt="avatar" className="h-full w-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={triggerFile} className="rounded-md border px-3 py-1 text-sm">Alterar</button>
                  <button type="button" onClick={removeAvatar} className="rounded-md border px-3 py-1 text-sm text-red-600">Remover</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center md:items-start gap-2">
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden border ring-1 ring-muted/20 flex items-center justify-center bg-muted text-white text-xl font-semibold">
                  {getInitials(name)}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={triggerFile} className="rounded-md border px-3 py-1 text-sm">Adicionar</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <button type="submit" disabled={loading} className="w-full md:w-auto rounded-md bg-primary px-4 py-2 text-white">{loading ? 'Salvando...' : 'Salvar alterações'}</button>
        </div>
      </form>
    </div>
  );
}
