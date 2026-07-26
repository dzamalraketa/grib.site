#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# scripts/deploy.sh — локальный деплой сайта «Мир грибов».
#
# Использование:
#   ./scripts/deploy.sh                — сборка + проверка (по умолчанию)
#   ./scripts/deploy.sh build          — только сборка + проверка
#   ./scripts/deploy.sh verify         — только проверка _site/
#   ./scripts/deploy.sh package        — упаковать _site/ в tar.gz
#   ./scripts/deploy.sh rsync          — залить на сервер через rsync
#   ./scripts/deploy.sh vercel         — задеплоить в Vercel (нужен vercel CLI)
#   ./scripts/deploy.sh preview        — локально поднять _site/ (python3 -m http.server)
#
# Переменные окружения (для rsync):
#   DEPLOY_HOST      — ssh-хост, например user@grib.site
#   DEPLOY_PATH      — путь на сервере, по умолчанию /var/www/grib.site
#   DEPLOY_PORT      — порт SSH, по умолчанию 22
#
# Коды выхода:
#   0  — успех
#   1  — ошибка сборки или проверки
#   2  — не настроены переменные окружения
# ----------------------------------------------------------------------------

set -euo pipefail

# ——— цвета и утилиты ———
if [[ -t 1 ]]; then
  C_RED=$'\033[0;31m'
  C_GREEN=$'\033[0;32m'
  C_YELLOW=$'\033[0;33m'
  C_BLUE=$'\033[0;34m'
  C_RESET=$'\033[0m'
else
  C_RED="" C_GREEN="" C_YELLOW="" C_BLUE="" C_RESET=""
fi

log()    { printf "%s[deploy]%s %s\n" "$C_BLUE" "$C_RESET" "$*"; }
ok()     { printf "%s[ ok  ]%s %s\n" "$C_GREEN" "$C_RESET" "$*"; }
warn()   { printf "%s[warn ]%s %s\n" "$C_YELLOW" "$C_RESET" "$*"; }
err()    { printf "%s[fail ]%s %s\n" "$C_RED" "$C_RESET" "$*" >&2; }

# ——— пути ———
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SITE_DIR="$ROOT_DIR/_site"
PACKAGE_NAME="griby-site-$(date -u +%Y%m%dT%H%M%SZ).tar.gz"
DIST_DIR="$ROOT_DIR/dist"

cd "$ROOT_DIR"

# ——— подкоманды ———
cmd="${1:-all}"

usage() {
  sed -n '2,18p' "$0" | sed 's/^# \{0,1\}//'
  exit 0
}

# ——— шаги ———

preflight() {
  log "Префлайт: проверка окружения"
  command -v node >/dev/null 2>&1 || { err "node не найден"; exit 1; }
  command -v npm  >/dev/null 2>&1 || { err "npm не найден";  exit 1; }
  if [[ ! -d node_modules ]]; then
    warn "node_modules/ отсутствует — устанавливаю зависимости"
    npm ci
  fi
  ok "Окружение готово (node $(node -v), npm $(npm -v))"
}

build() {
  preflight
  log "Сборка сайта (npm run build)…"
  npm run build
  verify_site
  ok "Сборка завершена: $SITE_DIR"
}

verify_site() {
  log "Проверка артефактов сборки…"
  local missing=0
  for f in index.html 404.html feed.xml sitemap.xml robots.txt CNAME; do
    if [[ ! -f "$SITE_DIR/$f" ]]; then
      err "отсутствует _site/$f"
      missing=1
    fi
  done
  if [[ ! -d "$SITE_DIR/pagefind" ]]; then
    err "отсутствует _site/pagefind/ (поиск не проиндексирован)"
    missing=1
  fi
  if [[ ! -d "$SITE_DIR/assets" ]]; then
    err "отсутствует _site/assets/"
    missing=1
  fi
  if (( missing )); then
    err "Сборка не прошла проверку"
    exit 1
  fi
  # Считаем базовые метрики
  local pages
  pages=$(find "$SITE_DIR" -name "*.html" | wc -l | tr -d ' ')
  local size
  size=$(du -sh "$SITE_DIR" | cut -f1)
  ok "Проверка пройдена: $pages HTML-страниц, размер $size"
}

package() {
  build
  log "Упаковка _site/ → dist/$PACKAGE_NAME"
  mkdir -p "$DIST_DIR"
  # --exclude нужен, чтобы в архив не попал мусор
  tar -C "$ROOT_DIR" -czf "$DIST_DIR/$PACKAGE_NAME" \
    --exclude='_site/pagefind/*.pf_meta' \
    --exclude='_site/pagefind/fragment' \
    _site
  local size
  size=$(du -h "$DIST_DIR/$PACKAGE_NAME" | cut -f1)
  ok "Архив готов: dist/$PACKAGE_NAME ($size)"
}

rsync_deploy() {
  build
  if [[ -z "${DEPLOY_HOST:-}" ]]; then
    err "DEPLOY_HOST не задан. Пример: export DEPLOY_HOST=user@grib.site"
    exit 2
  fi
  : "${DEPLOY_PATH:=/var/www/grib.site}"
  : "${DEPLOY_PORT:=22}"
  command -v rsync >/dev/null 2>&1 || { err "rsync не установлен"; exit 1; }

  log "rsync → $DEPLOY_HOST:$DEPLOY_PATH (port $DEPLOY_PORT)"
  # Используем --delete, чтобы зеркалить состояние;
  # --delay-updates для атомарного обновления;
  # --exclude — не трогаем .well-known/ (часто ACME-challenge) и т.п.
  rsync -avz \
    --delete \
    --delay-updates \
    --exclude='.well-known' \
    --exclude='.htaccess' \
    -e "ssh -p $DEPLOY_PORT -o StrictHostKeyChecking=accept-new" \
    "$SITE_DIR"/ \
    "$DEPLOY_HOST:$DEPLOY_PATH/"

  ok "rsync завершён"
  warn "Не забудьте: на сервере должен быть .nojekyll и корректный CNAME."
}

vercel_deploy() {
  command -v vercel >/dev/null 2>&1 || {
    err "vercel CLI не найден. Установите: npm i -g vercel"
    exit 1
  }
  if [[ ! -f "$ROOT_DIR/vercel.json" ]]; then
    err "vercel.json не найден в корне проекта"
    exit 1
  fi
  build
  log "vercel --prod…"
  vercel --prod --yes
  ok "Vercel-деплой завершён"
}

preview() {
  build
  if ! command -v python3 >/dev/null 2>&1; then
    err "python3 не найден — нечем поднять локальный сервер"
    exit 1
  fi
  local port="${PREVIEW_PORT:-4173}"
  log "Локальный превью: http://localhost:$port/ (Ctrl+C для остановки)"
  cd "$SITE_DIR"
  exec python3 -m http.server "$port"
}

case "$cmd" in
  -h|--help|help) usage ;;
  all)        build ;;
  build)      build ;;
  verify)     verify_site ;;
  package)    package ;;
  rsync)      rsync_deploy ;;
  vercel)     vercel_deploy ;;
  preview)    preview ;;
  *)
    err "Неизвестная подкоманда: $cmd"
    usage
    exit 1
    ;;
esac
