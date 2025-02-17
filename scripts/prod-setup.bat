@echo off
copy %~dp0..\.env.example %~dp0..\.env
echo Downloading dependencies [prod only]
call npm install --omit=dev
echo Building JS files from TS
npm run build
echo Setup complete
pause