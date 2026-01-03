@echo off
title Jakarta Semantic Harmony Server
echo ==================================================
echo   M E N J A L A N K A N   A P L I K A S I
echo   JAKARTA SEMANTIC HARMONY
echo ==================================================
echo.

:: 1. Pindah ke Drive dan Folder Proyek (Otomatis mendeteksi lokasi file bat ini)
cd /d "%~dp0"

:: 2. Menjalankan App.py
echo Sedang memulai server Python...
python app.py

:: 3. Agar jendela tidak langsung tertutup jika ada error
echo.
echo Server berhenti. Tekan tombol apa saja untuk keluar...
pause