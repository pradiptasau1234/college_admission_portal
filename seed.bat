@echo off
title Seed Database - College Admission Portal
color 0B
echo =====================================================================
echo       College Admission Portal - Database Seeder
echo =====================================================================
echo.

set "PATH=C:\Program Files\nodejs;%PATH%"

echo Ensuring MongoDB service is running...
net start MongoDB >nul 2>&1

cd /d "%~dp0server"
echo Seeding admin account, academic programs, and sample applicants...
node src/seed.js
echo.
pause
