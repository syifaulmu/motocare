@echo off
title Unggah MotoCare ke GitHub - syifaulmu/motocare
color 0A
echo ===================================================================
echo     MENGUNGGAH MOTOCARE v2.0 KE GITHUB @syifaulmu
echo ===================================================================
echo.
echo Repositori Tujuan: https://github.com/syifaulmu/motocare
echo Status Lokal     : 33 files, 18.976 baris kode sudah di-commit (main)
echo.
echo Sedang melakukan push ke GitHub...
echo (Jika jendela browser muncul, klik 'Sign in with your browser' / 'Authorize')
echo.

cd /d "D:\buat buat\motocare_v2"
"C:\Program Files\Git\cmd\git.exe" remote set-url origin https://github.com/syifaulmu/motocare.git
"C:\Program Files\Git\cmd\git.exe" push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================================
    echo   BERHASIL! Repositori MotoCare v2.0 telah online di GitHub:
    echo   👉 https://github.com/syifaulmu/motocare
    echo ===================================================================
) else (
    echo.
    echo ===================================================================
    echo   Push belum berhasil. Pastikan Anda sudah login saat jendela
    echo   browser otorisasi Git Credential Manager muncul.
    echo ===================================================================
)

echo.
pause
