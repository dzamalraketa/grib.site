#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# scripts/deploy.sh — локальный деплой сайта «Мир грибов».
#
# Использование:
#   ./scripts/deploy.sh                       — интерактивное меню
#   ./scripts/deploy.sh verify                — проверка без деплоя
#   ./scripts/deploy.sh build                 — только сборка
#   ./scripts/deploy.sh deploy                — проверка → commit → push
#   ./scripts/deploy.sh deploy "сообщение"    — то же, но с готовым сообщением
#   ./scripts/deploy.sh preview               — локальный сервер
#
# Коды выхода:
#   0  — успех
#   1  — ошибка проверки / сборки
#   2  — нечего коммитить
#   3  — push не прошёл
# ----------------------------------------------------------------------------

set -euo pipefail

# ——— цвета ———
if [[ -t 1 ]]; then
  C_RED=$'\033[0;31m' C_GREEN=$'\033[0;32m' C_YELLOW=$'\033[0;33m'
  C_BLUE=$'\033[0;34m' C_BOLD=$'\033[1m' C_RESET=$'\033[0m'
else
  C_RED="" C_GREEN="" C_YELLOW="" C_BLUE="" C_BOLD="" C_RESET=""
fi

log()  { printf "%s[deploy]%s %s\n" "$C_BLUE" "$C_RESET" "$*"; }
ok()   { printf "%s[ ok  ]%s %s\n" "$C_GREEN" "$C_RESET" "$*"; }
warn() { printf "%s[warn ]%s %s\n" "$C_YELLOW" "$C_RESET" "$*"; }
err()  { printf "%s[fail ]%s %s\n" "$C_RED" "$C_RESET" "$*" >&2; }
head() { printf "\n%s%s%s\n" "$C_BOLD" "$*" "$C_RESET"; }

# ——— пути ———
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SITE_DIR="$ROOT_DIR/_site"
cd "$ROOT_DIR"

# ——— утилиты ———
preflight() {
  command -v node >/dev/null 2>&1 || { err "node не найден"; exit 1; }
  command -v git  >/dev/null 2>&1 || { err "git не найден";  exit 1; }
  [[ -d node_modules ]] || { warn "ставлю зависимости…"; npm ci; }
}

# Проверяет, что во всех .md в src/griby/ и src/stati/ выставлен verified: true.
check_verified_flag() {
  log "Проверка флага verified…"
  if ! node scripts/check-verified.js; then
    err "Есть неподтверждённые материалы — поставь verified: true или допиши"
    exit 1
  fi
  ok "verified: true у всех материалов"
}

# Сборка сайта и проверка артефактов.
build_and_verify() {
  log "Сборка сайта…"
  npm run build
  log "Проверка артефактов…"
  local missing=0
  for f in index.html 404.html feed.xml sitemap.xml robots.txt CNAME; do
    [[ -f "$SITE_DIR/$f" ]] || { err "нет _site/$f"; missing=1; }
  done
  [[ -d "$SITE_DIR/pagefind" ]] || { err "нет _site/pagefind/"; missing=1; }
  [[ -d "$SITE_DIR/assets"   ]] || { err "нет _site/assets/";   missing=1; }
  (( missing )) && { err "сборка не прошла проверку"; exit 1; }
  local pages size
  pages=$(find "$SITE_DIR" -name "*.html" | wc -l | tr -d ' ')
  size=$(du -sh "$SITE_DIR" | cut -f1)
  ok "сборка ок: $pages страниц, $size"
}

# Полная проверка — то, что запускается перед каждым деплоем.
verify() {
  preflight
  head "▸ Проверка перед деплоем"
  check_verified_flag
  build_and_verify
  ok "Все проверки пройдены"
}

# Что изменилось в рабочей копии относительно HEAD.
status_summary() {
  if git diff --quiet HEAD 2>/dev/null && [[ -z "$(git ls-files --others --exclude-standard)" ]]; then
    return 1
  fi
  echo
  warn "Изменения в рабочей копии:"
  git status --short
  echo
  git diff --stat HEAD | tail -n 20 || true
  return 0
}

git_commit() {
  local msg="${1:-}"
  if ! status_summary; then
    err "Нечего коммитить — рабочая копия чистая"
    exit 2
  fi
  if [[ -z "$msg" ]]; then
    printf "%sСообщение коммита:%s " "$C_BOLD" "$C_RESET"
    read -r msg
    [[ -z "$msg" ]] && { err "пустое сообщение — отмена"; exit 1; }
  fi
  git add -A
  git commit -m "$msg"
  ok "коммит создан: $(git log -1 --oneline)"
}

git_push() {
  log "git push origin main…"
  if ! git push origin main; then
    err "push не прошёл"
    exit 3
  fi
  ok "залито в origin/main — сервер подхватит автоматически"
}

# ——— команды ———

cmd_verify() {
  verify
}

cmd_build() {
  preflight
  build_and_verify
}

cmd_deploy() {
  local msg="${1:-}"
  verify
  git_commit "$msg"
  git_push
  echo
  ok "Готово. $(git log -1 --oneline)"
}

cmd_preview() {
  preflight
  build_and_verify
  command -v python3 >/dev/null 2>&1 || { err "python3 не найден"; exit 1; }
  local port="${PREVIEW_PORT:-4173}"
  log "локальный превью: http://localhost:$port/  (Ctrl+C для остановки)"
  cd "$SITE_DIR"
  exec python3 -m http.server "$port"
}

# ——— интерактивное меню ———

menu() {
  head "▸ Деплой сайта «Мир грибов»"
  printf "  %s1)%s Проверить (verified + сборка)\n" "$C_BOLD" "$C_RESET"
  printf "  %s2)%s Собрать\n"                         "$C_BOLD" "$C_RESET"
  printf "  %s3)%s Закоммитить и запушить\n"         "$C_BOLD" "$C_RESET"
  printf "  %s4)%s Только запушить (уже есть коммит)\n" "$C_BOLD" "$C_RESET"
  printf "  %s5)%s Локальный превью\n"                "$C_BOLD" "$C_RESET"
  printf "  %s0)%s Выход\n"                          "$C_BOLD" "$C_RESET"
  printf "\nВыбор: "
  local choice
  read -r choice
  case "$choice" in
    1) verify ;;
    2) preflight; build_and_verify ;;
    3) cmd_deploy ;;
    4) git_push ;;
    5) cmd_preview ;;
    0) exit 0 ;;
    *) err "неизвестный пункт: $choice"; exit 1 ;;
  esac
}

# ——— точка входа ———

cmd="${1:-menu}"
case "$cmd" in
  -h|--help|help) sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
  menu|'')        menu ;;
  verify)         shift; cmd_verify "$@" ;;
  build)          shift; cmd_build "$@" ;;
  deploy)         shift; cmd_deploy "$@" ;;
  preview)        shift; cmd_preview "$@" ;;
  *) err "неизвестная команда: $cmd"; sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
