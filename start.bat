@echo off
title College Admission Portal - Launcher
color 0A
echo =====================================================================
echo          College Admission Portal - SWE Project Launcher
echo =====================================================================
echo.

:: Ensure Node.js and MongoDB paths are in PATH
set "PATH=C:\Program Files\nodejs;C:\Program Files\MongoDB\Server\9.0\bin;%PATH%"

:: Ensure MongoDB service is running
echo [1/3] Checking MongoDB service...
net start MongoDB >nul 2>&1

:: Verify Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not found in C:\Program Files\nodejs or system PATH!
    echo Please install Node.js from https://nodejs.org/
    echo =====================================================================
    pause
    exit /b 1
)

echo [2/3] Starting Backend API Server on Port 5000...
start "Admission Portal - Backend Server" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && cd /d ""%~dp0server"" && npm start"

echo [3/3] Starting Frontend Client on Port 5173...
start "Admission Portal - Frontend Client" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && cd /d ""%~dp0client"" && npm run dev"

echo.
echo =====================================================================
echo  Success! Both services are launching in their own windows:
echo.
echo  - Frontend Web UI:  http://localhost:5173
echo  - Backend REST API: http://localhost:5000
echo.
echo  Demo Credentials:
echo  - Admin Officer:   admin@iem.edu / Admin@123
echo  - Applicant Demo:  rohan.sharma@example.com / User@123
echo =====================================================================
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul 2>&1
start http://localhost:5173
pause
