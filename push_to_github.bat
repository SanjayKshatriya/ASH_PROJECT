@echo off
:: ============================================================
:: AgroSmartHub 3.0 — Push All Fixes to GitHub
:: Double-click this file to commit and push everything
:: ============================================================

title AgroSmartHub 3.0 - Pushing to GitHub

echo.
echo  ============================================
echo    AgroSmartHub 3.0 - Push to GitHub
echo  ============================================
echo.

:: Change to this batch file's directory
cd /d "%~dp0"

echo [1/6] Checking Git installation...
git --version
if %errorlevel% neq 0 (
    echo ERROR: Git not found. Install Git from https://git-scm.com/
    pause
    exit /b 1
)

echo.
echo [2/6] Configuring remote origin...
git remote remove origin 2>nul
git remote add origin https://github.com/SanjayKshatriya/ASH_PROJECT.git
echo Remote set to: https://github.com/SanjayKshatriya/ASH_PROJECT.git

echo.
echo [3/6] Staging all files...
git add -A

echo.
echo [4/6] Committing all fixes...
git commit -m "Fix: All GitHub Actions errors - YAML syntax, Android files, scripts, permissions"

echo.
echo [5/6] Setting branch to main...
git branch -M main

echo.
echo [6/6] Pushing to GitHub...
git push -u origin main

echo.
echo  ============================================
echo    SUCCESS! All files pushed to GitHub.
echo.
echo    Check GitHub Actions (workflows running):
echo    https://github.com/SanjayKshatriya/ASH_PROJECT/actions
echo.
echo    GitHub Pages (live site):
echo    https://SanjayKshatriya.github.io/ASH_PROJECT/
echo  ============================================
echo.
pause
