@echo off
rem Avvio di My Pickle Pete: legge .env, compila il frontend (se serve), avvia il backend e apre il browser
setlocal
cd /d "%~dp0"

rem Variabili locali da .env (KEY=VALUE, righe con # ignorate): valgono solo per questo avvio
if exist ".env" (
  for /f "usebackq eol=# tokens=1,* delims==" %%A in (".env") do set "%%A=%%B"
)
if not defined MPP_PORT set "MPP_PORT=8080"
if not defined MPP_BROWSER set "MPP_BROWSER=brave"

rem JDK 25: quello indicato in .env se valido, altrimenti si cerca nelle cartelle di installazione piu' comuni
if defined JAVA_HOME if not exist "%JAVA_HOME%\bin\java.exe" goto :invalidjava
goto :checkjava
:invalidjava
echo JAVA_HOME non valido: "%JAVA_HOME%" non contiene bin\java.exe. Cerco un JDK 25 installato...
set "JAVA_HOME="
:checkjava
if not defined JAVA_HOME call :findjdk
if not defined JAVA_HOME goto :nojava
echo JDK: %JAVA_HOME%
set "PATH=%JAVA_HOME%\bin;%PATH%"

rem Il frontend si ricompila se manca o se e' stato compilato da un'altra versione del codice
set "MPP_COMMIT="
set "MPP_BUILT="
for /f %%C in ('git rev-parse HEAD 2^>nul') do set "MPP_COMMIT=%%C"
if exist "frontend\dist\build-commit.txt" set /p MPP_BUILT=<"frontend\dist\build-commit.txt"
if not exist "frontend\dist\index.html" goto :build
if defined MPP_COMMIT if not "%MPP_COMMIT%"=="%MPP_BUILT%" goto :build
goto :run

:build
echo Build del frontend...
pushd frontend
call npm install || goto :error
call npm run build || goto :error
popd
if defined MPP_COMMIT >"frontend\dist\build-commit.txt" echo %MPP_COMMIT%

:run
echo Avvio del backend in una nuova finestra...
start "My Pickle Pete - backend" cmd /k "cd /d "%~dp0backend" && mvnw.cmd spring-boot:run"

echo Attendo che l'app risponda su http://localhost:%MPP_PORT%/my-pickle-pete/ ...
:wait
timeout /t 3 /nobreak >nul
powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing http://localhost:%MPP_PORT%/my-pickle-pete/api/constants/game -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 goto :wait

start "" %MPP_BROWSER% "http://localhost:%MPP_PORT%/my-pickle-pete/"
exit /b 0

:findjdk
for %%B in ("C:\Development\Java" "%ProgramFiles%\Java" "%ProgramFiles%\Eclipse Adoptium" "%ProgramFiles%\Microsoft" "%ProgramFiles%\Zulu" "%ProgramFiles%\Amazon Corretto" "%ProgramFiles%\BellSoft" "%USERPROFILE%\.jdks") do (
  for /d %%D in ("%%~B\*-25*") do if exist "%%~D\bin\java.exe" set "JAVA_HOME=%%~D"
)
exit /b 0

:nojava
echo Nessun JDK 25 trovato. Indica in .env la cartella del JDK 25, ad esempio:
echo JAVA_HOME=C:\Development\Java\jdk-25.0.2
pause
exit /b 1

:error
echo Errore durante la build del frontend.
pause
exit /b 1
