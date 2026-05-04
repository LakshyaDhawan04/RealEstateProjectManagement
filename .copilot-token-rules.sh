#!/bin/bash
# Global Token Management Rules - Load on session startup
# Source this file in your shell config to apply rules globally

# Colors for output
export COPILOT_COLOR_GREEN='\033[0;32m'
export COPILOT_COLOR_YELLOW='\033[1;33m'
export COPILOT_COLOR_RED='\033[0;31m'
export COPILOT_COLOR_BLUE='\033[0;34m'
export COPILOT_COLOR_NC='\033[0m'

# Token Management Settings (Global)
export COPILOT_TOKEN_BUDGET=18000
export COPILOT_CHECKPOINT_THRESHOLD=75
export COPILOT_MODEL="claude-haiku-4.5"
export COPILOT_TRACKING_TOOL="tokalator"

# Auto-load dashboard on session start (optional)
# Uncomment to enable:
# copilot_show_token_dashboard() {
#   if [ -f "./logs/token_dashboard.sh" ]; then
#     ./logs/token_dashboard.sh
#   fi
# }

# Show token rules reminder
copilot_show_rules() {
  echo -e "${COPILOT_COLOR_BLUE}═══ COPILOT TOKEN MANAGEMENT RULES ACTIVE ═══${COPILOT_COLOR_NC}"
  echo "Budget: $COPILOT_TOKEN_BUDGET tokens"
  echo "Model: $COPILOT_MODEL"
  echo "Checkpoint: >$COPILOT_CHECKPOINT_THRESHOLD%"
  echo ""
  echo "Key rules:"
  echo "  ✓ Batch independent tool calls (view, grep, bash &&)"
  echo "  ✓ Keep responses ≤100 words for routine work"
  echo "  ✓ Reference prior context, avoid repetition"
  echo "  ✓ Cache parsed data, avoid re-parsing"
  echo "  ✓ Log token usage after each phase"
  echo ""
  echo "Quick commands:"
  echo "  • ./logs/token_dashboard.sh — View budget status"
  echo "  • tokalator scan . — Check Haiku context"
  echo "  • cat logs/token_usage.log — View activity"
  echo ""
}

# Check token budget
copilot_check_budget() {
  if [ -f "./logs/token_usage.log" ]; then
    USED=$(grep -oP 'Used \K[0-9.]+K' ./logs/token_usage.log | \
      sed 's/K/000/' | awk '{sum += $1} END {print int(sum)}')
    REMAINING=$((COPILOT_TOKEN_BUDGET - USED))
    PERCENTAGE=$((USED * 100 / COPILOT_TOKEN_BUDGET))
    
    if [ $PERCENTAGE -gt $COPILOT_CHECKPOINT_THRESHOLD ]; then
      echo -e "${COPILOT_COLOR_RED}⚠️  WARNING: Token budget at $PERCENTAGE% ($USED/$COPILOT_TOKEN_BUDGET)${COPILOT_COLOR_NC}"
    else
      echo -e "${COPILOT_COLOR_GREEN}✓ Budget: $USED/$COPILOT_TOKEN_BUDGET tokens ($PERCENTAGE%)${COPILOT_COLOR_NC}"
    fi
  fi
}

# Load token usage to memory (call this before starting work)
copilot_load_session() {
  echo "Loading Copilot token management rules..."
  copilot_check_budget
  copilot_show_rules
}

# Export functions globally
export -f copilot_show_rules
export -f copilot_check_budget
export -f copilot_load_session

# Optional: Auto-load on shell startup
# Uncomment these lines to auto-load rules every time you open a terminal:
# if [ -f "./.copilot-token-rules.sh" ]; then
#   copilot_load_session
# fi
