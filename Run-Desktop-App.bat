@echo off
title AMAYA Intelligence Hub - Desktop App
color 0A
echo ====================================================================
echo      AMAYA Executive Intelligence Hub - Windows Desktop Window
echo ====================================================================
echo.
if not exist "node_modules\" (
    echo [*] Installing dependencies...
    call npm install
)

echo [*] Synchronizing live data streams...
call node scripts/build-data.js

echo [*] Launching Native Windows Desktop App...
call npm run electron

