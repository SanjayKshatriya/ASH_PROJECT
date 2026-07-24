@echo off
echo Starting local APK build with JDK 17...
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

cd android
call gradlew.bat assembleDebug

if %errorlevel% neq 0 (
    echo Gradle build failed!
    exit /b 1
)

echo Build finished! Uploading to file.io...
cd app\build\outputs\apk\debug
C:\Windows\System32\curl.exe -s -F "file=@app-debug.apk" https://file.io > fileio_response.txt

echo File.io Response:
type fileio_response.txt
exit /b 0
