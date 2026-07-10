@echo off
:: ============================================================
:: AgroSmartHub 3.0 — One-Click Startup Script
:: Double-click this file to start the project
:: ============================================================

title AgroSmartHub 3.0 - Startup

echo.
echo  ============================================
echo    AgroSmartHub 3.0 - Starting Up
echo  ============================================
echo.

:: Check if node_modules exist
if not exist "backend\node_modules" (
  echo [1/3] Installing backend dependencies...
  cd backend
  call npm install
  cd ..
  echo     Done!
) else (
  echo [1/3] Backend dependencies OK
)

:: Seed demo users (run once)
echo.
echo [2/3] Seeding demo users into Supabase...
cd backend
node database/seed-supabase.js
cd ..

echo.
echo [3/3] Starting backend server on http://localhost:5000
echo.
echo  ============================================
echo    Server is starting...
echo    Open: http://localhost:5000
echo    Press Ctrl+C to stop
echo  ============================================
echo.

cd backend
node server.js
