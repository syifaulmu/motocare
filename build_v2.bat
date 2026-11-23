@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=C:\Users\ASUS\AppData\Local\Android\Sdk"
set "GRADLE_BIN=C:\Users\ASUS\.gradle\wrapper\dists\gradle-8.9-bin\90cnw93cvbtalezasaz0blq0a\gradle-8.9\bin\gradle.bat"
cd /d "d:\buat buat\motocare_v2"
echo Building MotoCare v2.0...
call "%GRADLE_BIN%" assembleDebug --stacktrace
if %ERRORLEVEL%==0 (
    echo BUILD SUCCESS
    copy /Y "app\build\outputs\apk\debug\app-debug.apk" "d:\buat buat\MotoCare_v2.0.apk"
    echo APK copied to d:\buat buat\MotoCare_v2.0.apk
) else (
    echo BUILD FAILED
    exit /b %ERRORLEVEL%
)
