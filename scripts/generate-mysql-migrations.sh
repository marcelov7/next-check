#!/usr/bin/env bash
set -euo pipefail

# Script para gerar migrations compatíveis com MySQL a partir do schema.prisma
# Uso: rode este script na raiz do projeto (local dev), onde existe prisma/schema.prisma
# Antes de rodar: confirme que seu DATABASE_URL local aponta para um banco MySQL de teste
# (ex.: export DATABASE_URL="mysql://user:pass@host:3306/dbname").

echo "== Gerar migrations MySQL para o projeto next-checklist =="

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# checar se há mudanças não comitadas
if [[ -n "$(git status --porcelain)" ]]; then
  echo "ATENÇÃO: Há mudanças não comitadas no repositório. É recomendado commitar ou stasher antes de prosseguir."
  git status --porcelain
  read -p "Continuar mesmo assim? (s/N) " CONF
n  if [[ "$CONF" != "s" && "$CONF" != "S" ]]; then
    echo "Abortando. Commit ou stash suas mudanças e rode novamente.";
    exit 1;
  fi
fi

# backup das migrations existentes (se houver)
if [ -d prisma/migrations ]; then
  echo "Movendo migrations existentes para prisma/migrations-sqlite-backup..."
  mkdir -p prisma/migrations-sqlite-backup
  # movendo apenas se houver arquivos dentro
  if [ "$(ls -A prisma/migrations)" ]; then
    timestamp=$(date +%Y%m%d%H%M%S)
    dest="prisma/migrations-sqlite-backup/migrations-backup-$timestamp"
    mkdir -p "$dest"
    mv prisma/migrations/* "$dest/" || true
    echo "Backups movidos para: $dest"
  else
    echo "pasta prisma/migrations existe mas está vazia. Pulando mv."
  fi
else
  echo "Não foi encontrada pasta prisma/migrations — nada a mover."
fi

# confirmar provider no prisma/schema.prisma
if grep -q "provider\s*=\s*\"mysql\"" prisma/schema.prisma; then
  echo "schema.prisma com provider = \"mysql\" confirmado."
else
  echo "ERRO: prisma/schema.prisma não parece usar provider = \"mysql\".\nAbra prisma/schema.prisma e ajuste provider para \"mysql\" antes de prosseguir." >&2
  exit 1
fi

# verificar DATABASE_URL
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERRO: a variável DATABASE_URL não está definida nesta sessão. Exporte-a antes de rodar o script, por exemplo:" >&2
  echo "  export DATABASE_URL=\"mysql://user:senha@host:3306/dbname\"" >&2
  exit 1
fi

echo "DATABASE_URL detectada (ocultada para segurança). Gerando migration MySQL..."

# rodar migrate dev para gerar e aplicar migration no banco de teste
npx prisma migrate dev --name init

# adicionar as migrations geradas ao git
if [ -d prisma/migrations ]; then
  git add prisma/migrations
  git commit -m "chore(prisma): gerar migrations MySQL (init)" || echo "Não houve alterações a commitar (talvez já exista commit)."
  echo "Migrations geradas e commitadas localmente (prisma/migrations). Revise e abra PR para merge." 
else
  echo "ERRO: pasta prisma/migrations não encontrada após executar migrate dev." >&2
  exit 1
fi

cat <<'EOF'
Próximos passos (local -> remoto):
1) Push sua branch com as migrations: git push origin HEAD
2) Abra PR e faça merge para main (ou merge direto se for apropriado).
3) No servidor de produção: git pull origin main
4) No servidor: export DATABASE_URL para apontar para o DB de produção
5) No servidor: npx prisma migrate deploy
6) Build e start: npm run build && pm2 restart next-checklist || pm2 start npm --name "next-checklist" -- start
EOF

exit 0
