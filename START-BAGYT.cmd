@echo off
cd /d "%~dp0"
if not exist node_modules (
  call npm ci
  if errorlevel 1 goto failed
)
if not exist .next\BUILD_ID (
  call npm run build
  if errorlevel 1 goto failed
)
echo Open http://127.0.0.1:3000 in your browser.
call npm run start
if errorlevel 1 goto failed
exit /b 0
:failed
echo Check the error above. If port 3000 is already in use, BAGYT may already be running.
pause
exit /b 1
