@echo off
echo ========================================
echo DMILLION - Fixing Installation
echo ========================================
echo.

echo Step 1: Removing old files...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f /q package-lock.json
echo Done!
echo.

echo Step 2: Cleaning npm cache...
call npm cache clean --force
echo Done!
echo.

echo Step 3: Installing dependencies...
call npm install
echo Done!
echo.

echo ========================================
echo Installation complete!
echo ========================================
echo.
echo To start the development server, run:
echo npm run dev
echo.
pause
