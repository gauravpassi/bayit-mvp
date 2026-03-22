#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Bayit – One-command GitHub + Vercel deploy
# Run this once from inside the RealEstaetMVP folder on your Mac:
#   chmod +x deploy.sh && ./deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

REPO_NAME="bayit-mvp"
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo -e "${GREEN}=== Bayit Deploy Script ===${NC}"
echo ""

# ── 1. Check prerequisites ────────────────────────────────────────────────────
for cmd in git node npm; do
  if ! command -v $cmd &>/dev/null; then
    echo "ERROR: $cmd is not installed. Please install it first."
    exit 1
  fi
done

# ── 2. Install gh CLI if missing ──────────────────────────────────────────────
if ! command -v gh &>/dev/null; then
  echo -e "${YELLOW}Installing GitHub CLI...${NC}"
  if command -v brew &>/dev/null; then
    brew install gh
  else
    echo "Please install GitHub CLI from https://cli.github.com/ then re-run."
    exit 1
  fi
fi

# ── 3. Install Vercel CLI if missing ──────────────────────────────────────────
if ! command -v vercel &>/dev/null; then
  echo -e "${YELLOW}Installing Vercel CLI...${NC}"
  npm install -g vercel
fi

# ── 4. GitHub login ───────────────────────────────────────────────────────────
echo -e "${YELLOW}Logging into GitHub...${NC}"
gh auth login

# ── 5. Init git + create repo ─────────────────────────────────────────────────
echo -e "${YELLOW}Setting up Git repository...${NC}"
git init
git add -A
git commit -m "Initial Bayit MVP commit" --allow-empty

echo -e "${YELLOW}Creating GitHub repository: ${REPO_NAME}...${NC}"
gh repo create "$REPO_NAME" --public --source=. --remote=origin --push

echo -e "${GREEN}Code pushed to GitHub!${NC}"

# ── 6. Deploy to Vercel ───────────────────────────────────────────────────────
echo -e "${YELLOW}Deploying to Vercel...${NC}"
vercel --yes

echo ""
echo -e "${YELLOW}Setting environment variables on Vercel...${NC}"

# Load from .env.local and set on Vercel
if [ -f .env.local ]; then
  while IFS='=' read -r key value; do
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue
    echo "  Setting $key..."
    echo "$value" | vercel env add "$key" production --force 2>/dev/null || true
  done < .env.local
else
  echo "No .env.local found — you will need to set env vars manually in Vercel dashboard."
fi

# ── 7. Final production deploy ────────────────────────────────────────────────
echo -e "${YELLOW}Running production deployment...${NC}"
vercel --prod --yes

echo ""
echo -e "${GREEN}=== Deployment complete! ===${NC}"
echo -e "Your Bayit app is live. Check the URL above."
echo -e "You can also find it at: https://vercel.com/dashboard"
