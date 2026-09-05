@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Customify - One Click Installer
color 0F
cd /d "%~dp0"

echo.
echo  ==========================================================
echo                  CUSTOMIFY FOR SPOTIFY
echo                    ONE-CLICK INSTALLER
echo  ==========================================================
echo.
echo  This installer will set up everything Customify needs:
echo    - Node.js
echo    - Spotify desktop app (non-Microsoft-Store build)
echo    - Spicetify
echo    - Customify dependencies
echo.
echo  Nothing is removed unless an incompatible Microsoft Store
echo  Spotify install is detected. You will be asked before that.
echo.
pause

set "FAILED=0"
set "WINGET=0"

where winget >nul 2>nul
if %errorlevel%==0 set "WINGET=1"

echo.
echo [1/5] Checking Node.js...
where node >nul 2>nul
if %errorlevel%==0 (
    for /f "delims=" %%V in ('node --version 2^>nul') do echo       Node.js %%V found.
) else (
    echo       Node.js not found. Installing...
    if "%WINGET%"=="1" (
        winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements
        if errorlevel 1 (
            echo       ERROR: Node.js installation failed.
            set "FAILED=1"
        )
    ) else (
        echo       winget is not available on this PC.
        echo       Opening the official Node.js download page...
        start "" "https://nodejs.org/en/download"
        echo.
        echo       Install Node.js LTS, then press any key here.
        pause >nul
    )
)

set "PATH=%PATH%;C:\Program Files\nodejs;%LOCALAPPDATA%\Microsoft\WinGet\Links;%USERPROFILE%\AppData\Roaming\npm"

where node >nul 2>nul
if errorlevel 1 (
    echo       ERROR: Node.js still cannot be found.
    set "FAILED=1"
)

echo.
echo [2/5] Checking Spotify desktop...
set "SPOTIFY_EXE="
if exist "%APPDATA%\Spotify\Spotify.exe" set "SPOTIFY_EXE=%APPDATA%\Spotify\Spotify.exe"
if exist "%LOCALAPPDATA%\Spotify\Spotify.exe" set "SPOTIFY_EXE=%LOCALAPPDATA%\Spotify\Spotify.exe"

powershell -NoProfile -ExecutionPolicy Bypass -Command "if (Get-AppxPackage -Name SpotifyAB.SpotifyMusic -ErrorAction SilentlyContinue) { exit 10 } else { exit 0 }"
if %errorlevel%==10 (
    echo       Microsoft Store Spotify was detected.
    echo       Spicetify officially recommends the normal Spotify desktop build.
    echo.
    choice /C YN /N /M "       Remove Microsoft Store Spotify and install the desktop version? [Y/N]: "
    if errorlevel 2 (
        echo       Keeping Microsoft Store Spotify. Customify may not work correctly.
    ) else (
        echo       Removing Microsoft Store Spotify...
        powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-AppxPackage -Name SpotifyAB.SpotifyMusic | Remove-AppxPackage"
        set "SPOTIFY_EXE="
    )
)

if defined SPOTIFY_EXE (
    echo       Spotify desktop found.
) else (
    echo       Installing Spotify directly from Spotify...
    set "SPOTIFY_SETUP=%TEMP%\Customify-SpotifySetup.exe"
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -UseBasicParsing 'https://download.scdn.co/SpotifySetup.exe' -OutFile '%TEMP%\Customify-SpotifySetup.exe'"
    if errorlevel 1 (
        echo       ERROR: Could not download Spotify.
        echo       Opening Spotify's official download page instead...
        start "" "https://www.spotify.com/download/windows/"
        set "FAILED=1"
    ) else (
        start /wait "" "%TEMP%\Customify-SpotifySetup.exe"
        del /q "%TEMP%\Customify-SpotifySetup.exe" >nul 2>nul
    )
)

if exist "%APPDATA%\Spotify\Spotify.exe" set "SPOTIFY_EXE=%APPDATA%\Spotify\Spotify.exe"
if exist "%LOCALAPPDATA%\Spotify\Spotify.exe" set "SPOTIFY_EXE=%LOCALAPPDATA%\Spotify\Spotify.exe"

echo.
echo [3/5] Checking Spicetify...
where spicetify >nul 2>nul
if %errorlevel%==0 (
    for /f "delims=" %%V in ('spicetify -v 2^>nul') do echo       Spicetify %%V found.
) else (
    echo       Spicetify not found. Installing...
    if "%WINGET%"=="1" (
        winget install --id Spicetify.Spicetify -e --accept-package-agreements --accept-source-agreements
    )

    set "PATH=%PATH%;%LOCALAPPDATA%\Microsoft\WinGet\Links;%USERPROFILE%\.spicetify"

    where spicetify >nul 2>nul
    if errorlevel 1 (
        echo       winget install did not expose Spicetify. Using official installer...
        powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-RestMethod -UseBasicParsing 'https://raw.githubusercontent.com/spicetify/cli/main/install.ps1' | Invoke-Expression"
    )
)

set "PATH=%PATH%;%USERPROFILE%\.spicetify;%LOCALAPPDATA%\Microsoft\WinGet\Links"
where spicetify >nul 2>nul
if errorlevel 1 (
    echo       ERROR: Spicetify could not be installed.
    set "FAILED=1"
) else (
    echo       Spicetify is ready.
)

echo.
echo [4/5] Installing Customify...
if not exist "package.json" (
    echo       ERROR: package.json is missing. Run this installer from the
    echo       downloaded Customize-Spotify folder.
    set "FAILED=1"
) else (
    where npm >nul 2>nul
    if errorlevel 1 (
        echo       ERROR: npm could not be found.
        set "FAILED=1"
    ) else (
        call npm install
        if errorlevel 1 (
            echo       ERROR: Customify dependencies failed to install.
            set "FAILED=1"
        ) else (
            echo       Customify dependencies installed.
        )
    )
)

echo.
echo [5/5] Preparing Spotify for Spicetify...
if defined SPOTIFY_EXE (
    echo       Spotify must be opened and logged in at least once before
    echo       Spicetify can modify it.
    echo.
    echo       Spotify will open now.
    start "" "%SPOTIFY_EXE%"
    echo.
    echo       If this is your first Spotify install:
    echo       1. Log in to Spotify.
    echo       2. Leave Spotify open for about one minute.
    echo       3. Come back here and press any key.
    echo.
    pause >nul
) else (
    echo       Spotify executable was not detected automatically.
    echo       Open Spotify once and log in before applying your first theme.
)

where spicetify >nul 2>nul
if %errorlevel%==0 (
    spicetify >nul 2>nul
    spicetify backup >nul 2>nul
)

echo.
echo  ==========================================================
if "%FAILED%"=="1" (
    echo      INSTALLATION FINISHED WITH ONE OR MORE WARNINGS
    echo.
    echo      Customify will still be started if Node.js is ready.
) else (
    echo                  INSTALLATION COMPLETE
)
echo  ==========================================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
    echo  Customify cannot start because npm is unavailable.
    echo  Fix the errors above and run INSTALL-CUSTOMIFY.bat again.
    echo.
    pause
    exit /b 1
)

echo  Starting Customify...
call npm start

if errorlevel 1 (
    echo.
    echo  Customify closed with an error.
    echo  You can run START-CUSTOMIFY.bat later.
    pause
)
endlocal
