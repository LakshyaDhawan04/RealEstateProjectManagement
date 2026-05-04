#!/bin/bash
# Token Usage Dashboard Script
# Displays real-time token tracking, budget status, and recommendations
# Usage: ./logs/token_dashboard.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOTAL_BUDGETED=18000
LOG_FILE="$PROJECT_ROOT/logs/token_usage.log"
PHASE_FILE="$PROJECT_ROOT/logs/phase_budget.txt"

# Initialize log files if they don't exist
[ ! -f "$LOG_FILE" ] && touch "$LOG_FILE"
[ ! -f "$PHASE_FILE" ] && touch "$PHASE_FILE"

# Print header
clear
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          TOKEN TRACKING DASHBOARD - Real Estate Project         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Branch: $(cd "$PROJECT_ROOT" && git rev-parse --abbrev-ref HEAD)"
echo ""

# Calculate token usage from log file
TOTAL_USED=0
if [ -f "$LOG_FILE" ] && [ -s "$LOG_FILE" ]; then
  # Extract tokens from log (format: "Used X.XK tokens")
  TOTAL_USED=$(grep -oP 'Used \K[0-9.]+K' "$LOG_FILE" 2>/dev/null | \
    sed 's/K/000/' | awk '{sum += $1} END {print int(sum)}' || echo "0")
fi

REMAINING=$((TOTAL_BUDGETED - TOTAL_USED))
PERCENTAGE=$((TOTAL_USED * 100 / TOTAL_BUDGETED))

# Determine status color
if [ $PERCENTAGE -gt 90 ]; then
  STATUS_COLOR=$RED
  STATUS="🛑 CRITICAL"
elif [ $PERCENTAGE -gt 75 ]; then
  STATUS_COLOR=$RED
  STATUS="⚠️  HIGH"
elif [ $PERCENTAGE -gt 50 ]; then
  STATUS_COLOR=$YELLOW
  STATUS="🟡 MEDIUM"
else
  STATUS_COLOR=$GREEN
  STATUS="🟢 GOOD"
fi

# Display budget status
echo -e "${BLUE}═══ BUDGET STATUS ═══${NC}"
echo -e "Budgeted:   ${BLUE}$TOTAL_BUDGETED${NC} tokens"
echo -e "Used:       ${STATUS_COLOR}$TOTAL_USED${NC} tokens ($PERCENTAGE%)"
echo -e "Remaining:  $REMAINING tokens"
echo -e "Status:     ${STATUS_COLOR}$STATUS${NC}"
echo ""

# Draw progress bar
BAR_LENGTH=50
FILLED=$((PERCENTAGE * BAR_LENGTH / 100))
echo -n "Progress: ["
for ((i = 0; i < $FILLED; i++)); do
  echo -n "="
done
for ((i = $FILLED; i < $BAR_LENGTH; i++)); do
  echo -n " "
done
echo "]"
echo ""

# Display phase breakdown
if [ -f "$PHASE_FILE" ] && [ -s "$PHASE_FILE" ]; then
  echo -e "${BLUE}═══ PHASE BREAKDOWN ═══${NC}"
  cat "$PHASE_FILE"
  echo ""
fi

# Display recent activity
echo -e "${BLUE}═══ RECENT ACTIVITY (Last 10 entries) ═══${NC}"
if [ -f "$LOG_FILE" ] && [ -s "$LOG_FILE" ]; then
  tail -10 "$LOG_FILE"
else
  echo "No activity logged yet"
fi
echo ""

# Recommendations
echo -e "${BLUE}═══ RECOMMENDATIONS ═══${NC}"
if [ $PERCENTAGE -gt 90 ]; then
  echo -e "${RED}❌ CRITICAL: Token budget nearly exceeded!${NC}"
  echo "   1. Create checkpoint immediately"
  echo "   2. Commit work-in-progress"
  echo "   3. Start fresh session tomorrow"
  echo "   4. Reference checkpoint in new session"
elif [ $PERCENTAGE -gt 75 ]; then
  echo -e "${YELLOW}⚠️  WARNING: Approaching token limit${NC}"
  echo "   1. Compress context (close unused files)"
  echo "   2. Complete current task"
  echo "   3. Consider checkpoint after this task"
elif [ $PERCENTAGE -gt 50 ]; then
  echo -e "${YELLOW}🟡 CAUTION: Halfway through budget${NC}"
  echo "   1. Monitor usage closely"
  echo "   2. Cache frequently-used data"
  echo "   3. Batch related operations"
else
  echo -e "${GREEN}🟢 GOOD: Well within budget${NC}"
  echo "   1. Continue current work"
  echo "   2. Check back after each phase"
  echo "   3. Document progress in logs"
fi
echo ""

# Display commands for next steps
echo -e "${BLUE}═══ QUICK COMMANDS ═══${NC}"
echo "Add token entry:      echo \"$(date): Task 'xxx' - Used XK tokens\" >> logs/token_usage.log"
echo "Check Haiku budget:   tokalator scan ."
echo "View token breakdown: tokalator breakdown"
echo "Update phase budget:  echo \"Phase: Budget -> Used\" >> logs/phase_budget.txt"
echo ""

# Display file stats
echo -e "${BLUE}═══ PROJECT FILES ═══${NC}"
echo "Code files:"
find "$PROJECT_ROOT/src" -name "*.js" -type f 2>/dev/null | wc -l | xargs echo "  JavaScript files:"
find "$PROJECT_ROOT/src" -name "*.py" -type f 2>/dev/null | wc -l | xargs echo "  Python files:"
echo ""
echo "Data output:"
[ -d "$PROJECT_ROOT/data/gmail" ] && ls -1 "$PROJECT_ROOT/data/gmail" 2>/dev/null | wc -l | xargs echo "  Gmail exports:"
[ -d "$PROJECT_ROOT/data/whatsapp" ] && ls -1 "$PROJECT_ROOT/data/whatsapp" 2>/dev/null | wc -l | xargs echo "  WhatsApp exports:"
echo ""

# Display branch info
echo -e "${BLUE}═══ GIT STATUS ═══${NC}"
cd "$PROJECT_ROOT"
echo "Current branch: $(git rev-parse --abbrev-ref HEAD)"
echo "Last commit: $(git log -1 --pretty=format:"%h - %s (%ar)")"
echo "Uncommitted changes: $(git status --short | wc -l) files"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo "Dashboard updated: $(date '+%H:%M:%S')"
echo "For detailed logs, see: logs/token_usage.log"
echo ""
