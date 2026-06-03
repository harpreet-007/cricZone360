@echo off
setlocal

set "ROOT=%~dp0"
set "CLIENT_DIR=%ROOT%client"

echo Stopping old CricZone processes on ports 3000 and 5001...
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
  if not "%%a"=="0" taskkill /F /PID %%a >nul 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5001"') do (
  if not "%%a"=="0" taskkill /F /PID %%a >nul 2>nul
)

timeout /t 2 /nobreak >nul

if exist "%CLIENT_DIR%\.next" (
  echo Removing old Next.js cache...
  rmdir /s /q "%CLIENT_DIR%\.next"
)

call "%ROOT%run-project.bat"
