#!/bin/zsh
# Notifies when the LinkedIn token (60-day max) has under 10 days left. Called by the daily x-news and weekly review jobs.
exp=$(rg -o '^LINKEDIN_TOKEN_EXPIRES=(.*)' -r '$1' "$HOME/Documents/GitHub/social-posts/.env.local") || exit 0
left=$(( ($(date -j -f %Y-%m-%d "$exp" +%s) - $(date +%s)) / 86400 ))
(( left < 10 )) && osascript -e "display notification \"LinkedIn token expires in $left days ($exp). Run: node --env-file=.env.local scripts/linkedin-auth.mjs, then ask Claude to push it.\" with title \"allahabadi.dev: renew LinkedIn token\""
exit 0
