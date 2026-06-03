@echo off
setlocal

set "ROOT=%~dp0"
set "SERVER_DIR=%ROOT%server"
set "CLIENT_DIR=%ROOT%client"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js, then run this file again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Install Node.js/npm, then run this file again.
  pause
  exit /b 1
)

if not exist "%SERVER_DIR%\node_modules" (
  echo Installing server dependencies...
  pushd "%SERVER_DIR%"
  call npm install
  if errorlevel 1 (
    popd
    echo Server dependency installation failed.
    pause
    exit /b 1
  )
  popd
)

if not exist "%CLIENT_DIR%\node_modules" (
  echo Installing client dependencies...
  pushd "%CLIENT_DIR%"
  call npm install
  if errorlevel 1 (
    popd
    echo Client dependency installation failed.
    pause
    exit /b 1
  )
  popd
)

netstat -ano | findstr ":5001" >nul 2>nul
if not errorlevel 1 (
  echo.
  echo Warning: port 5001 is already in use.
  echo Close the old CricZone API terminal before starting a fresh backend.
)

netstat -ano | findstr ":3000" >nul 2>nul
if not errorlevel 1 (
  echo.
  echo Warning: port 3000 is already in use.
  echo Close the old CricZone Web terminal before starting a fresh frontend.
)

echo Starting CricZone 360 API on http://localhost:5001
start "CricZone 360 API" cmd /k "cd /d ""%SERVER_DIR%"" && npm run dev"

echo Starting CricZone 360 Web App on http://localhost:3000
start "CricZone 360 Web" cmd /k "cd /d ""%CLIENT_DIR%"" && npm run dev"

echo.
echo Project is starting.
echo Backend:  http://localhost:5001
echo Frontend: http://localhost:3000
echo.
echo Keep the two opened terminal windows running while using the app.
pause
