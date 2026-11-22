#!/bin/zsh -l
# Launched by ~/Library/LaunchAgents/com.rahul-lt.social-posts.review.plist (Mondays 09:00 IST).
cd "$HOME/Documents/GitHub/social-posts" || exit 1
eval "$(/opt/homebrew/bin/fnm env)"
git pull -q --rebase --autostash
log="$HOME/Library/Logs/social-posts-review.log"
echo "=== $(date)" >> "$log"
/Users/rahulm/.local/bin/claude -p "$(sd -F '{{DATE}}' "$(date +%Y-%m-%d)" < scripts/review/prompt.md)" --chrome --dangerously-skip-permissions >> "$log" 2>&1
