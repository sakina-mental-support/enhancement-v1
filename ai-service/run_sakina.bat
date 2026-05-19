@echo off
TITLE Sakina — Emotional Intelligence System
color 0A
echo.
echo  ============================================================
echo   SAKINA — Emotional Intelligence System v6.0
echo   Powered by MiniMax 2.7 via NVIDIA API + MongoDB Atlas
echo  ============================================================
echo.

:: ── Kill any leftover processes on our ports ──
echo [1/4] Clearing ports 5000, 5001, 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 " 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5001 " 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 " 2^>nul') do taskkill /F /PID %%a >nul 2>&1
timeout /t 1 /nobreak >nul

:: ── 1. Python AI Microservice (MiniMax 2.7 + NVIDIA API) ──
echo [2/4] Starting AI Microservice on port 5001...
start "Sakina — AI Microservice (MiniMax 2.7)" /D "d:\rahmaed\new-model-intt-main" cmd /k ^
  "echo AI Microservice starting... && python flask_api.py"

timeout /t 2 /nobreak >nul

:: ── 2. Express Backend (MongoDB Atlas connected) ──
echo [3/4] Starting Express Backend on port 5000...
start "Sakina — Backend (MongoDB Atlas)" /D "d:\front-back-integration-2-main\front-back-integration-2-main\sakina-backend" cmd /k ^
  "echo Backend starting... && node server.js"

timeout /t 2 /nobreak >nul

:: ── 3. React Frontend (Vite) ──
echo [4/4] Starting Frontend on port 5173...
start "Sakina — Frontend (Vite)" /D "d:\front-back-integration-2-main\front-back-integration-2-main\sakina-frontend\sakina-frontend-main" cmd /k ^
  "echo Frontend starting... && npm run dev"

timeout /t 4 /nobreak >nul

:: ── Summary ──
echo.
echo  ============================================================
echo   ALL SERVICES LAUNCHED
echo  ============================================================
echo.
echo   Frontend   :  http://localhost:5173
echo   Backend    :  http://localhost:5000
echo   AI Service :  http://localhost:5001
echo   DevKit     :  http://localhost:5173/devkit
echo   MongoDB    :  ClusterSakina (Atlas connected)
echo.
echo   Close individual windows to stop each service.
echo  ============================================================
echo.
pause
