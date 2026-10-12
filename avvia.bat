@echo off
rem Avvio di My Pickle Pete: legge .env, compila il frontend (se manca), avvia il backend e apre il browser
setlocal
cd /d "%~dp0"

rem Variabili locali da .env (KEY=VALUE, righe con # ignorate): valgono solo per questo avvio
if exist ".env" (
  for /f "usebackq eol=# tokens=1,* delims==" %%A in (".env") do set "%%A=%%B"
)
if defined JAVA_HOME set "PATH=%JAVA_HOME%\bin;%PATH%"
if not defined MPP_PORT set "MPP_PORT=8080"
if not defined MPP_BROWSER set "MPP_BROWSER=brave"

if not exist "frontend\dist\index.html" (
  echo Build del frontend...
  pushd frontend
  call npm install || goto :error
  call npm run build || goto :error
  popd
)

echo Avvio del backend in una nuova finestra...
start "My Pickle Pete - backend" cmd /k "cd /d "%~dp0backend" && mvnw.cmd spring-boot:run"

echo Attendo che l'app risponda su http://localhost:%MPP_PORT%/my-pickle-pete/ ...
:wait
timeout /t 3 /nobreak >nul
powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing http://localhost:%MPP_PORT%/my-pickle-pete/api/constants/game -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 goto :wait

start "" %MPP_BROWSER% "http://localhost:%MPP_PORT%/my-pickle-pete/"
exit /b 0

:error
echo Errore durante la build del frontend.
pause
exit /b 1
