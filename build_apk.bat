@echo off
:: ============================================================
:: AgroSmartHub 3.0 — Build Android APK
:: Double-click this file to compile the app into an APK file
:: ============================================================

title AgroSmartHub 3.0 - Building APK

echo.
echo  ============================================
echo    AgroSmartHub 3.0 - Building Android APK
echo  ============================================
echo.

:: Change to the android directory
cd /d "%~dp0android"

echo [1/3] Checking Java installation...
java -version
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH.
    echo Please install JDK 17 to build Android apps.
    pause
    exit /b 1
)

echo.
echo [2/3] Compiling and Building the APK (This may take a few minutes)...
call gradlew.bat assembleDebug

if %errorlevel% neq 0 (
    echo.
    echo  ============================================
    echo    BUILD FAILED! Check the errors above.
    echo  ============================================
    pause
    exit /b 1
)

echo.
echo [3/3] Build Successful! Opening the folder...

:: Navigate to the output directory and open File Explorer
cd app\build\outputs\apk\debug
explorer .

echo.
echo  ============================================
echo    SUCCESS! Your APK is ready.
echo    You can now copy app-debug.apk to your phone.
echo  ============================================
echo.
pause
