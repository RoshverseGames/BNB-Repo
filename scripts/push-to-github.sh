#!/bin/bash
# B&B CRM — Push to GitHub
# Run this from inside the extracted bnb-crm-source folder.
#
# What it does:
#   1. Initializes a git repo (if not already)
#   2. Stages all the source files
#   3. Commits them with version 1.0.0
#   4. Pushes to https://github.com/RoshverseGames/BNB-Repo
#
# You will be asked for your GitHub username + a Personal Access Token (NOT your password).
# Create a PAT here:  https://github.com/settings/tokens/new
#   - Note: "B&B CRM push"
#   - Expiration: 7 days (or shorter — you only need it once)
#   - Select scope: ☑ repo
#   - Click "Generate token" → copy the resulting ghp_xxxxxxxx string

set -e

REPO_URL="https://github.com/RoshverseGames/BNB-Repo.git"

echo "==============================================="
echo "  B&B CRM → GitHub Push"
echo "==============================================="
echo ""

# Check git is installed
if ! command -v git &> /dev/null; then
    echo "❌ git is not installed."
    echo ""
    echo "Install it from: https://git-scm.com/downloads"
    echo "  • Windows: download the installer, click Next → Next → Finish"
    echo "  • Mac: brew install git   (or install Xcode Command Line Tools)"
    echo "  • Linux: sudo apt install git"
    exit 1
fi

echo "✓ git is installed: $(git --version)"
echo ""

# Initialize git if needed
if [ ! -d .git ]; then
    git init -q
    git branch -M main
    echo "✓ Initialized new git repo on 'main' branch"
else
    echo "✓ Existing git repo found"
fi

# Set remote (idempotent)
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"
echo "✓ Remote set to $REPO_URL"
echo ""

# Stage everything
git add -A
echo "✓ Staged $(git diff --cached --numstat | wc -l | tr -d ' ') files"

# Commit (idempotent — amends if commit already exists)
if git log --has-commit HEAD 2>/dev/null; then
    git commit --amend -m "B&B CRM v1.0.0 — Bridges and Blueprints CRM" -q
    echo "✓ Amended commit"
else
    git commit -m "B&B CRM v1.0.0 — Bridges and Blueprints CRM" -q
    echo "✓ Created initial commit"
fi
echo ""

# Push
echo "-----------------------------------------------"
echo "Pushing to GitHub…"
echo ""
echo "If prompted:"
echo "  • Username: your GitHub username (RoshverseGames)"
echo "  • Password: paste your Personal Access Token (starts with ghp_)"
echo "    Create one at: https://github.com/settings/tokens/new"
echo "    (select the 'repo' scope, expiration 7 days is fine)"
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
echo "  3. Click the 'Run workflow' button (top-right)"
echo "  4. Enter version: 1.0.0"
echo "  5. Click the green 'Run workflow' button"
echo "  6. Wait ~6 minutes, then download your .exe and .dmg from the run page"
echo ""
echo "(Full instructions are in DESKTOP_SETUP.md)"
