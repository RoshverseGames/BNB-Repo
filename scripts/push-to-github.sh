#!/bin/bash
set -e

REPO_URL="https://github.com/RoshverseGames/BNB-Repo.git"

echo "==============================================="
echo "  B&B CRM → GitHub Push"
echo "==============================================="
echo ""

if ! command -v git &> /dev/null; then
    echo "❌ git is not installed."
    exit 1
fi

echo "✓ git is installed: $(git --version)"
echo ""

if [ ! -d .git ]; then
    git init -q
    git branch -M main
    echo "✓ Initialized new git repo on 'main' branch"
else
    echo "✓ Existing git repo found"
fi

git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"
echo "✓ Remote set to $REPO_URL"
echo ""

git add -A
echo "✓ Staged $(git diff --cached --numstat | wc -l | tr -d ' ') files"

if git log --has-commit HEAD 2>/dev/null; then
    git commit --amend -m "B&B CRM v1.0.0 — Bridges and Blueprints CRM" -q
    echo "✓ Amended commit"
else
    git commit -m "B&B CRM v1.0.0 — Bridges and Blueprints CRM" -q
    echo "✓ Created initial commit"
fi
echo ""

echo "-----------------------------------------------"
echo "Pushing to GitHub…"
echo "  • Username: RoshverseGames"
echo "  • Password: your Personal Access Token (ghp_xxx)"
echo "    Create at: https://github.com/settings/tokens/new"
echo "    (select 'repo' scope, expiration 7 days)"
echo "-----------------------------------------------"
echo ""

git push -u origin main --force

echo ""
echo "==============================================="
echo "  ✅ Push successful!"
echo "==============================================="
echo ""
echo "Your code is now at: https://github.com/RoshverseGames/BNB-Repo"
echo ""
echo "NEXT STEP — Build the installers:"
echo "  1. Go to: https://github.com/RoshverseGames/BNB-Repo/actions"
echo "  2. Click 'Build Desktop Installers' on the left"
echo "  3. Click 'Run workflow' (top-right)"
echo "  4. Enter version: 1.0.0"
echo "  5. Click green 'Run workflow' button"
echo "  6. Wait ~6 minutes, then download installers"