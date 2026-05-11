#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONFIG_FILE="${ROOT_DIR}/publish-online.config"

if [[ ! -f "${CONFIG_FILE}" ]]; then
  echo "缺少配置文件：${CONFIG_FILE}" >&2
  exit 1
fi

# 从配置文件读取目标仓库路径、Vercel 成功地址和提交信息。
source "${CONFIG_FILE}"

: "${APP_CLMM_DIR:?${CONFIG_FILE} 中必须配置 APP_CLMM_DIR}"
: "${VERCEL_SUCCESS_URL:=https://project-3joyt.vercel.app}"
: "${COMMIT_MESSAGE:=chore: publish clmm dist}"

SOURCE_DIST="${ROOT_DIR}/dist"
TARGET_DIST="${APP_CLMM_DIR}/dist"

current_branch() {
  git -C "$1" rev-parse --abbrev-ref HEAD
}

require_git_repo() {
  local repo_dir="$1"
  if ! git -C "${repo_dir}" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "不是 Git 仓库：${repo_dir}" >&2
    exit 1
  fi
}

require_main_branch() {
  local repo_dir="$1"
  local repo_name="$2"
  local branch
  branch="$(current_branch "${repo_dir}")"
  if [[ "${branch}" != "main" ]]; then
    echo "${repo_name} 必须在 main 分支，当前分支是：${branch}" >&2
    exit 1
  fi
}

require_command() {
  local command_name="$1"
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "缺少必要命令：${command_name}" >&2
    exit 1
  fi
}

if [[ ! -d "${SOURCE_DIST}" ]]; then
  echo "源 dist 目录不存在：${SOURCE_DIST}" >&2
  exit 1
fi

if [[ ! -d "${APP_CLMM_DIR}" ]]; then
  echo "APP_CLMM_DIR 配置的目录不存在：${APP_CLMM_DIR}" >&2
  exit 1
fi

require_command git
require_command rsync
require_command vercel
require_git_repo "${ROOT_DIR}"
require_git_repo "${APP_CLMM_DIR}"
require_main_branch "${ROOT_DIR}" "cc-test"
require_main_branch "${APP_CLMM_DIR}" "app-clmm"

cat <<EOF
准备执行发布上线流程。

源仓库：     ${ROOT_DIR}
源分支：     $(current_branch "${ROOT_DIR}")
源 dist：    ${SOURCE_DIST}

目标仓库：   ${APP_CLMM_DIR}
目标分支：   $(current_branch "${APP_CLMM_DIR}")
目标 dist：  ${TARGET_DIST}

即将执行：
1. 使用当前 cc-test/dist 覆盖 app-clmm/dist。
2. 在 app-clmm 中提交 dist 变更。
3. 在 app-clmm 中执行 git push --force。
4. 在 app-clmm 中执行 vercel deploy --prod。

EOF

read -r -p "确认两个仓库都在 main 分支并继续执行，请输入 YES：" CONFIRM
if [[ "${CONFIRM}" != "YES" ]]; then
  echo "已取消发布。"
  exit 1
fi

echo "正在同步 dist 到 app-clmm..."
mkdir -p "${TARGET_DIST}"
rsync -a --delete "${SOURCE_DIST}/" "${TARGET_DIST}/"

echo "正在提交 app-clmm 变更..."
git -C "${APP_CLMM_DIR}" add dist
if git -C "${APP_CLMM_DIR}" diff --cached --quiet; then
  echo "app-clmm 没有 dist 变更需要提交。"
else
  git -C "${APP_CLMM_DIR}" commit -m "${COMMIT_MESSAGE}"
fi

echo "正在强制推送 app-clmm main 分支..."
git -C "${APP_CLMM_DIR}" push --force origin main

echo "app-clmm 推送成功。Netlify 仍需手动发布。"

echo "正在执行 Vercel 生产环境部署..."
(
  cd "${APP_CLMM_DIR}"
  vercel deploy --prod
)

echo "Vercel 生产环境部署成功："
echo "${VERCEL_SUCCESS_URL}"
