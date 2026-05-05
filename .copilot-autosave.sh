#!/bin/bash
# Session Autosave & Memory Management
# Automatically saves session state every interval

set -e

AUTOSAVE_INTERVAL=${AUTOSAVE_INTERVAL:-300}  # 5 minutes default
SESSION_DB="${PWD}/.copilot/session.db"
AUTOSAVE_LOG="${PWD}/logs/autosave.log"

# Ensure logs directory exists
mkdir -p logs

# Function: Save session state to memory
autosave_session() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  local branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
  local commit=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
  local token_used=$(grep -oP 'Used: \K[0-9]+' logs/token_usage.log 2>/dev/null || echo "0")
  
  echo "[$timestamp] Autosave: branch=$branch, commit=$commit, tokens=$token_used" >> "$AUTOSAVE_LOG"
  
  # Log to session memory (if sqlite available)
  if command -v sqlite3 &> /dev/null && [ -f "$SESSION_DB" ]; then
    sqlite3 "$SESSION_DB" <<SQL
    INSERT OR REPLACE INTO session_memory (key, value, updated_at) VALUES
      ('last_autosave', datetime('now')),
      ('current_branch', '$branch'),
      ('current_commit', '$commit'),
      ('token_used_session', '$token_used');
SQL
  fi
}

# Function: Monitor git changes and auto-commit
autosave_changes() {
  if ! git diff-index --quiet HEAD --; then
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] Uncommitted changes detected, creating autosave commit..." >> "$AUTOSAVE_LOG"
    git add -A
    git commit -m "autosave: Session state [$timestamp]

- Automatic session checkpoint
- Token usage: $(grep -oP 'Used: \K[0-9]+' logs/token_usage.log 2>/dev/null || echo "0") tokens
- Changes auto-saved to memory

Co-authored-by: Lakshay Dhawan <lakshya@example.com>" 2>/dev/null || true
  fi
}

# Function: Sync with remote (optional)
autosave_sync_remote() {
  if [ "$AUTOSAVE_SYNC_REMOTE" = "true" ]; then
    git push -q origin main 2>/dev/null || echo "Push skipped (offline/permissions)" >> "$AUTOSAVE_LOG"
  fi
}

# Main autosave loop (background)
autosave_daemon() {
  while true; do
    autosave_session
    autosave_changes
    autosave_sync_remote
    sleep "$AUTOSAVE_INTERVAL"
  done
}

# Check current status
autosave_status() {
  echo "=== Session Autosave Status ==="
  echo "Interval: $AUTOSAVE_INTERVAL seconds"
  echo "Database: $SESSION_DB"
  echo "Log: $AUTOSAVE_LOG"
  if [ -f "$AUTOSAVE_LOG" ]; then
    echo "Recent saves:"
    tail -3 "$AUTOSAVE_LOG"
  fi
  echo "================================"
}

# Start background daemon
autosave_start() {
  echo "Starting autosave daemon (interval: ${AUTOSAVE_INTERVAL}s)..."
  autosave_daemon &
  echo $! > .copilot/autosave.pid
  echo "✓ Autosave PID: $(cat .copilot/autosave.pid)"
}

# Stop daemon
autosave_stop() {
  if [ -f .copilot/autosave.pid ]; then
    kill $(cat .copilot/autosave.pid) 2>/dev/null || true
    rm -f .copilot/autosave.pid
    echo "✓ Autosave stopped"
  fi
}

# Main
case "${1:-status}" in
  start)  autosave_start ;;
  stop)   autosave_stop ;;
  status) autosave_status ;;
  *)      autosave_daemon ;;
esac
