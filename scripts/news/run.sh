#!/bin/zsh -l
# Launched by ~/Library/LaunchAgents/com.rahul-lt.social-posts.news.plist.
# 10:00 -> batch for 14/15/16, 16:30 -> batch for 23/00/01, otherwise freshness check for the next slot.
cd "$HOME/Documents/GitHub/social-posts" || exit 1
[[ $(date +%Y%m%d) -gt 20261027 ]] && exit 0  # trial ends after Monday 26 Oct (the 00:00/01:00 slots spill into the 27th)
git pull -q --rebase --autostash

hm=${NEWS_HM:-$(date +%H%M)}  # NEWS_HM=1600 forces a branch for a manual run
[[ $hm == 16* ]] && rg -q "$(date +%Y-%m-%d)T23:00" -g draft.json decks && exit 0  # evening batch already built
case $hm in
  10*) prompt=$(sd -F '{{SLOTS}}' '14:00, 15:00, 16:00' < scripts/news/prompts/batch.md) ;;
  16*) prompt=$(sd -F '{{SLOTS}}' '23:00, 00:00, 01:00' < scripts/news/prompts/batch.md) ;;
  *)   next=$(date -v+1H +%Y-%m-%dT%H:00:00+05:30)
       prompt=$(sd -F '{{SLOT}}' "$next" < scripts/news/prompts/fresh.md) ;;
esac

log="$HOME/Library/Logs/social-posts-news.log"
echo "=== $(date) $hm" >> "$log"
/Users/rahulm/.local/bin/claude -p "$prompt" --dangerously-skip-permissions >> "$log" 2>&1
