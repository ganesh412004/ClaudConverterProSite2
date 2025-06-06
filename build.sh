#!/bin/bash

# Simple build script for static site
mkdir -p public
cp index.html public/
cp -r css/ public/
cp -r js/ public/

# Remove submodule reference from Git
git rm --cached ClaudConverterProSite2 -r -f

# Remove submodule files from .git/modules
rm -rf .git/modules/ClaudConverterProSite2

# Remove .gitmodules file if it exists
rm -f .gitmodules

# Commit these changes
git add .
git commit -m "Completely removed submodule references"
git push origin main