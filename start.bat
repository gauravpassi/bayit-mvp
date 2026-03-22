@echo off
echo.
echo Starting Bayit Real Estate App...
echo.

:: Install dependencies if needed
if not exist "node_modules" (
  echo Installing dependencies...
  npm install
)

echo Starting Karim AI Advisor on port 3001...
start "Bayit Chat" cmd /k "node scripts/chat-server.mjs"

timeout /t 3 /nobreak >nul

echo Starting Bayit UI on port 3000...
start "Bayit UI" cmd /k "npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ======================================
echo   Bayit is running!
echo   Open: http://localhost:3000
echo ======================================
echo.
start http://localhost:3000
