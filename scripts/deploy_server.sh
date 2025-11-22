#!/usr/bin/env bash
set -euo pipefail

# Deploy seguro para execução no servidor dentro do diretório do projeto
# Uso:
#   cd /path/to/project && bash scripts/deploy_server.sh
# O script faz backup de package files, sincroniza com origin/main,
# instala dependências, gera Prisma, aplica migrations, build e reinicia com PM2.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "[deploy] Iniciando deploy no diretório: $ROOT_DIR"

# Backup de arquivos importantes
echo "[deploy] Fazendo backup de package.json e package-lock.json (se existirem)"
cp package.json package.json.bak 2>/dev/null || true
cp package-lock.json package-lock.json.bak 2>/dev/null || true

# Verifica existência de .env
if [ ! -f .env ] && [ ! -f .env.production ]; then
  echo "[warning] Nenhum arquivo .env encontrado. Certifique-se de que variáveis de ambiente (DATABASE_URL, NEXTAUTH_URL etc.) estão definidas no ambiente."
fi

# Buscar e resetar para o remoto
echo "[deploy] Buscando alterações no remoto..."
git fetch origin

LOCAL_CHANGES="$(git status --porcelain)"
if [ -n "$LOCAL_CHANGES" ]; then
  echo "[warning] Existem alterações locais no repositório que serão sobrescritas pelo reset."
  echo "Mostrando alterações locais:" 
  git status --porcelain
  echo "Se você quer preservar essas alterações, saia e faça commit/stash antes de rodar este script."
  read -p "Deseja continuar e sobrescrever as alterações locais? (yes/no) " yn
  case $yn in
    [Yy][Ee][Ss]|[Yy]) echo "[deploy] Prosseguindo e sobrescrevendo alterações locais..." ;;
    *) echo "[deploy] Abortando. Faça commit ou stash das mudanças locais e rode o script novamente." ; exit 1 ;;
  esac
fi

echo "[deploy] Resetando para origin/main"
git reset --hard origin/main
git clean -fd

# Escolher instalador de pacotes
if command -v pnpm >/dev/null 2>&1; then
  PKG_MANAGER="pnpm"
  INSTALL_CMD=(pnpm install --frozen-lockfile)
  BUILD_CMD=(pnpm build)
  PRISMA_CMD=(pnpm prisma)
else
  PKG_MANAGER="npm"
  INSTALL_CMD=(npm ci)
  BUILD_CMD=(npm run build)
  PRISMA_CMD=(npx prisma)
fi

echo "[deploy] Usando gerenciador: $PKG_MANAGER"

echo "[deploy] Instalando dependências..."
"${INSTALL_CMD[@]}"

# Prisma generate
echo "[deploy] Gerando Prisma client..."
"${PRISMA_CMD[@]}" generate

# Rodar migrations (se tiver)
if [ -d prisma/migrations ] || grep -q "migrate" package.json 2>/dev/null; then
  echo "[deploy] Aplicando migrations (prisma migrate deploy)..."
  set +e
  "${PRISMA_CMD[@]}" migrate deploy
  MIGRATE_EXIT=$?
  set -e
  if [ $MIGRATE_EXIT -ne 0 ]; then
    echo "[warning] prisma migrate deploy retornou erro (código: $MIGRATE_EXIT). Verifique migrations e banco de dados. Continuando..."
  fi
else
  echo "[deploy] Sem migrations detectadas (pulando prisma migrate deploy)."
fi

# Build
echo "[deploy] Executando build..."
"${BUILD_CMD[@]}"

# Reiniciar com PM2 (prefere pm2 global quando disponível)
echo "[deploy] Reiniciando aplicação com PM2 (nome: next-checklist)"
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart next-checklist 2>/dev/null || pm2 start --name next-checklist "${PKG_MANAGER} start"
elif command -v npx >/dev/null 2>&1; then
  npx pm2 restart next-checklist 2>/dev/null || npx pm2 start --name next-checklist "${PKG_MANAGER} start"
else
  echo "[warning] pm2 não encontrado. Você pode iniciar a aplicação manualmente: ${PKG_MANAGER} start"
fi

echo "[deploy] Deploy concluído. Verifique logs e status do PM2 (npx pm2 status)."
exit 0
