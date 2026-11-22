#!/bin/zsh -l
# Launched by ~/Library/LaunchAgents/com.rahul-lt.social-posts.xnews.plist (10:00 IST daily).
# Picks yesterday's top X story and queues it as a LinkedIn card for 12:00 IST today.
# Manual run posting right away: XNEWS_SLOT=now scripts/xnews/run.sh
cd "$HOME/Documents/GitHub/social-posts" || exit 1
eval "$(/opt/homebrew/bin/fnm env)"
git pull -q --rebase --autostash

today=$(date +%Y-%m-%d)
since=$(date -j -f "%Y-%m-%d %H:%M:%S" "$(date -v-1d +%Y-%m-%d) 00:00:00" +%s)
slot=${XNEWS_SLOT:-${today}T12:00:00+05:30}
[[ $slot == now ]] && slot=$(date +%Y-%m-%dT%H:%M:00+05:30)
id=x$(date +%y%m%d)
[[ -d posts/nugget-$id ]] && exit 0  # already queued today

prompt=$(sd -F '{{SINCE}}' "$since" < scripts/xnews/prompt.md | sd -F '{{UNTIL}}' "$((since + 86400))" \
  | sd -F '{{SLOT}}' "$slot" | sd -F '{{ID}}' "$id" | sd -F '{{DATE}}' "$today")

log="$HOME/Library/Logs/social-posts-xnews.log"
echo "=== $(date) $id $slot" >> "$log"
/Users/rahulm/.local/bin/claude -p "$prompt" --chrome --dangerously-skip-permissions >> "$log" 2>&1
# Manual "now" runs publish immediately; scheduled runs are picked up by the 12:01 publish trigger.
[[ $XNEWS_SLOT == now && -d posts/nugget-$id ]] && /opt/homebrew/bin/gh workflow run "Publish scheduled posts" -R rahul-lt/social-posts -f only_post=nugget-$id >> "$log" 2>&1
