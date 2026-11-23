@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=C:\Users\ASUS\AppData\Local\Android\Sdk"
cd /d "d:\buat buat\motocare_app"
call "C:\Users\ASUS\.gradle\wrapper\dists\gradle-8.9-bin\90cnw93cvbtalezasaz0blq0a\gradle-8.9\bin\gradle.bat" assembleDebug --stacktrace
