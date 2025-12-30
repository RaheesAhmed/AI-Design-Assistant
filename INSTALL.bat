@echo off
:: AI Design Assistant for Illustrator - Auto-Installer
:: Run this as Administrator

echo.
echo ============================================
echo   AI Design Assistant for Illustrator
echo          Auto-Installer
echo ============================================
echo.

:: Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script requires Administrator privileges!
    echo.
    echo Right-click on INSTALL_AI_ASSISTANT.bat and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo [1/4] Creating CEP extensions directory...
set "TARGET_DIR=%APPDATA%\Adobe\CEP\extensions\AIAssistantPanel"

if not exist "%APPDATA%\Adobe\CEP\extensions\" (
    mkdir "%APPDATA%\Adobe\CEP\extensions" 2>nul
)

if exist "%TARGET_DIR%" (
    echo     Removing old version...
    rmdir /s /q "%TARGET_DIR%"
)

echo [2/4] Copying extension files...
xcopy /E /I /Y "%~dp0AIAssistantPanel" "%TARGET_DIR%" >nul
if errorlevel 1 (
    echo     ERROR: Failed to copy files!
    pause
    exit /b 1
)
echo     Files copied successfully!

echo [3/4] Enabling CEP debug mode...
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.7" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.8" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.9" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.10" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
echo     Debug mode enabled!

echo [4/4] Verifying installation...
if exist "%TARGET_DIR%\CSXS\manifest.xml" (
    echo     Extension verified successfully!
) else (
    echo     ERROR: Extension files not found!
    pause
    exit /b 1
)

echo.
echo ============================================
echo     INSTALLATION COMPLETE!
echo ============================================
echo.
echo Extension installed to:
echo %TARGET_DIR%
echo.
echo NEXT STEPS:
echo 1. Get your FREE Gemini API key from:
echo    https://aistudio.google.com/app/apikey
echo.
echo 2. Close Adobe Illustrator if running
echo.
echo 3. Restart Adobe Illustrator
echo.
echo 4. Go to: Window ^> Extensions ^> AI Design Assistant
echo.
echo 5. Enter your API key in the extension panel
echo.
echo 6. Start designing with AI assistance!
echo.
echo Press any key to exit...
pause >nul
