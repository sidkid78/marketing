@echo off
:: Start the Next.js dev server in a new terminal window
:: The server will keep running even if you close the IDE

:: Get the directory where this script is located
set SCRIPT_DIR=%~dp0

:: Start a new terminal window and run npm dev from the frontend folder
start "Next.js Dev Server" cmd /k "cd /d %SCRIPT_DIR% && echo Starting Next.js dev server from: %SCRIPT_DIR% && echo. && npm run dev"

echo Server started in a new terminal window!
