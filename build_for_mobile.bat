@echo off
title AgroSmartHub - Mobile APK Builder
echo ==============================================
echo Building AgroSmartHub APK for Android...
echo ==============================================
echo.

:: Override broken JAVA_HOME with Android Studio's bundled JDK
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%

echo Syncing latest web application assets...
call node scripts\sync_web_assets.js

cd android
call gradlew.bat assembleDebug

if %errorlevel% neq 0 (
    echo.
    echo ==============================================
    echo BUILD FAILED! Please check the errors above.
    echo ==============================================
    pause
    exit /b 1
)

echo.
echo ==============================================
echo SUCCESS! Your APK has been built successfully.
echo ==============================================
echo.
echo Opening the folder containing the APK...
cd app\build\outputs\apk\debug
explorer .

echo.
echo You can now transfer "app-debug.apk" to your Android mobile and install it.
pause
