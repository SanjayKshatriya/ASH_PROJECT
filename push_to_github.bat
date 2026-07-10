@echo off
echo ========================================================
echo Pushing AgroSmartHub 3.0 to GitHub
echo ========================================================
echo.

echo 1. Initializing Git...
git init
git config core.autocrlf false

echo 2. Adding all files (including .github workflows)...
git add .

echo 3. Committing files...
git commit -m "Added AgroSmartHub files, GitHub workflows, and Test Reports"

echo 4. Setting main branch...
git branch -M main

echo 5. Setting up GitHub URL...
git remote remove origin 2>nul
git remote add origin https://github.com/SanjayKshatriya/ASH_PROJECT.git

echo 6. Pushing everything to GitHub...
git push -u origin main

echo.
echo ========================================================
echo Done! 
echo If it asks for a login, please sign in to GitHub in the popup window.
echo If you see any red errors, take a screenshot or copy them.
echo ========================================================
pause
