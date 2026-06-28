@echo off
title SIPINJAM - Sistem Peminjaman SMAN 1 Sentolo
color 0B
cls

echo ==========================================================
echo   SIPINJAM - SMAN 1 Sentolo (Dev Server)
echo ==========================================================
echo.

:: Pindah ke folder tempat file batch ini berada
cd /d "%~dp0"

:: Cek apakah 'npm' ada di PATH
where npm >nul 2>nul
if %errorlevel% equ 0 goto check_node_modules

echo [INFO] Perintah 'npm' tidak terdeteksi di PATH sistem.
echo Mencoba mencari lokasi instalasi Node.js default...

if exist "C:\Program Files\nodejs\node.exe" (
    echo [INFO] Node.js ditemukan di Program Files.
    set "PATH=%PATH%;C:\Program Files\nodejs"
    goto check_node_modules
)

if exist "C:\Program Files (x86)\nodejs\node.exe" (
    echo [INFO] Node.js ditemukan di Program Files x86.
    set "PATH=%PATH%;C:\Program Files (x86)\nodejs"
    goto check_node_modules
)

if exist "%APPDATA%\npm\npm.cmd" (
    echo [INFO] Folder npm ditemukan di AppData.
    set "PATH=%PATH%;%APPDATA%\npm"
    goto check_node_modules
)

echo.
echo [ERROR] Node.js / npm tidak ditemukan di komputer Anda!
echo Silakan unduh dan pasang Node.js terlebih dahulu di:
echo https://nodejs.org/
echo.
pause
exit /b

:check_node_modules
echo Memeriksa folder node_modules...
if exist "node_modules" goto run_server

echo [WARNING] Folder node_modules tidak ditemukan!
echo Menjalankan 'npm install' untuk memasang library...
echo.
call npm install
if %errorlevel% equ 0 goto run_server

echo.
echo [ERROR] Gagal melakukan 'npm install' secara otomatis.
echo Silakan jalankan 'npm install' secara manual terlebih dahulu.
pause
exit /b

:run_server
echo.
echo Memeriksa modul Backend...
if not exist "backend\node_modules" (
    echo [INFO] Memasang library untuk Backend pertama kali...
    cd backend
    call npm install
    cd ..
)

echo.
echo Memulai SIPINJAM API Backend Server (Jendela Terpisah)...
start "SIPINJAM Backend API Server" cmd /c "cd backend && title SIPINJAM API Backend Server && color 0A && echo Memulai Server Backend di Port 5000... && npm start"

echo.
echo Menjalankan Frontend Vite Development Server...
echo Halaman SIPINJAM akan otomatis terbuka di browser Anda.
echo Tekan Ctrl+C di jendela ini untuk menghentikan Frontend. 
echo (Tutup jendela hitam yang satu lagi untuk mematikan Backend).
echo.

:: Menjalankan server frontend dan otomatis membuka browser
call npm run dev -- --open

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Terjadi kesalahan saat menjalankan server.
    pause
)
