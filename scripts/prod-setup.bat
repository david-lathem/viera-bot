@echo off
copy %~dp0..\.env.example %~dp0..\.env
echo Downloading dependencies [prod only]
call npm install --omit=dev
echo Setup complete
pause