@echo off
setlocal
title Customify
cd /d "%~dp0"
set "PATH=%PATH%;C:\Program Files\nodejs;%LOCALAPPDATA%\Microsoft\WinGet\Links;%USERPROFILE%\AppData\Roaming\npm"
where npm >nul 2>nul
if errorlevel 1 (
  echo Customify is not installed yet.
  echo Run INSTALL-CUSTOMIFY.bat first.
  pause
  exit /b 1
)
call npm start
endlocal
