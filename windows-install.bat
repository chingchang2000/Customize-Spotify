@echo off
title Customify Installer
cd /d "%~dp0"
where node >nul 2>nul || (
  echo Node.js is required. Install Node.js 20+ from https://nodejs.org/
  pause
  exit /b 1
)
echo Installing Customify...
call npm install
if errorlevel 1 pause & exit /b 1
echo.
echo Done. Starting Customify...
call npm start
