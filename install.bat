@echo off
echo =========================================
echo Network Monitor Installation Script
echo =========================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed.
    echo Please install Node.js 20 or higher from https://nodejs.org/
    pause
    exit /b 1
)

echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Building application...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to build application
    pause
    exit /b 1
)

echo.
echo =========================================
echo Installation Complete!
echo =========================================
echo.
echo To start the application:
echo   npm start
echo.
echo The application will be available at:
echo   http://localhost:3001
echo.
echo Data will be stored in: ./data/monitor.db
echo.
pause
