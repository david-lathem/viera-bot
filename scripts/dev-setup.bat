copy %~dp0..\.env.example %~dp0..\.env
call npm i
echo Setup complete
echo Building JS files from TS
npm run build
pause