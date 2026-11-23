@echo off
echo ========================================================
echo   MotoCare v2.0 - Publikasi Repositori ke GitHub
echo ========================================================
echo.
echo Pastikan Git sudah terpasang di komputer Anda.
echo Jika belum, unduh dari https://git-scm.com/downloads
echo.
set /p REPO_URL="Masukkan URL Repositori GitHub Anda (contoh: https://github.com/username/motocare.git): "

if "%REPO_URL%"=="" (
    echo URL repositori tidak boleh kosong!
    pause
    exit /b 1
)

echo.
echo [1/5] Inisialisasi git repository...
git init

echo [2/5] Menambahkan seluruh file proyek...
git add .

echo [3/5] Melakukan commit pertama...
git commit -m "feat: MotoCare v2.0 Public Release (Multi-Motor, Retro UI, 34 Presets, Notifications)"

echo [4/5] Menghubungkan remote GitHub...
git branch -M main
git remote add origin %REPO_URL%

echo [5/5] Mengunggah source code ke GitHub...
git push -u origin main

echo.
echo ========================================================
echo   Selesai! Repositori MotoCare berhasil diunggah ke GitHub.
echo ========================================================
pause
