@echo off
REM Script de rebuild APK Donia — double-clique sur ce fichier pour rebuilder.
REM Cree le 05/06/2026.

echo.
echo =================================================
echo  Donia — Rebuild APK (EAS preview profile)
echo =================================================
echo.

cd /d "%~dp0"

echo [1/3] Git pull...
git pull
if errorlevel 1 (
    echo Erreur lors du git pull.
    pause
    exit /b 1
)

echo.
echo [2/3] Lancement du build EAS...
echo.
call npx eas build --profile preview --platform android
if errorlevel 1 (
    echo.
    echo Le build a echoue. Verifie le message d'erreur ci-dessus.
    pause
    exit /b 1
)

echo.
echo =================================================
echo  Build lance ! Suis le progres sur le lien affiche.
echo =================================================
echo.
pause
