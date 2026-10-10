#!/usr/bin/env bash
# Publish the current checkout to GitHub Pages (https://romeo-04.github.io/kislap/).
# Use when Vercel cannot deploy (free plan: 100 deploys a day). Run from the repo root on main.
set -euo pipefail
MSYS_NO_PATHCONV=1 BASE_PATH=/kislap/ npm run build   # MSYS_NO_PATHCONV stops Git Bash rewriting /kislap/
sha=$(git rev-parse --short HEAD)
tmp=$(mktemp -d)
cp -r dist/. "$tmp"/ && touch "$tmp/.nojekyll"
cd "$tmp"
git init -q -b gh-pages && git add -A
git commit -q -m "chore: publish $sha to GitHub Pages"
git push -q --force https://github.com/Romeo-04/kislap.git gh-pages   # gh-pages holds build output only
echo "Published $sha. Pages rebuilds in about a minute."
