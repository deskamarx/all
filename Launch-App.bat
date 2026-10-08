@echo off
title AMAYA Executive Intelligence Hub - Windows Launcher
color 0B
echo ====================================================================
echo        AMAYA INDUSTRIES - EXECUTIVE INTELLIGENCE HUB
echo                  Windows Full-Stack Edition
echo ====================================================================
echo.
echo [*] Checking runtime environment...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js was not detected on this system.
    echo Please install Node.js from https://nodejs.org to run AMAYA Hub.
    pause
    exit /b 1
)

echo [*] Environment verified.
echo [*] Ensuring dependencies are installed...
if not exist "node_modules\" (
    echo [*] Installing required packages (first time run)...
    call npm install
)

echo [*] Synchronizing live Google Apps Script + Google Sheets pipeline...
call node scripts/build-data.js

echo [*] Building production bundle...
call npm run build

echo.
echo ====================================================================
echo  AMAYA Intelligence Hub is starting on http://localhost:3000
echo ====================================================================
echo.
start http://localhost:3000
call npm run start

pause
