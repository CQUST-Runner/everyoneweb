
cd %~dp0\backend
go build -o webook-server.exe

cd %~dp0\frontend
call npm install --legacy-peer-deps
call ng build

cd %~dp0\third-party\single-file-cli
call npm install

cd %~dp0
robocopy backend\ build\server\ webook-server.exe
if exist build\server\app (
    rmdir /Q /S build\server\app\
)
robocopy frontend\dist\frontend build\server\app\ /E
if exist build\server\single-file-cli (
    rmdir /Q /S build\server\single-file-cli
)
robocopy third-party\single-file-cli build\server\single-file-cli\ /E > nul
if %ERRORLEVEL% neq 1 (
    echo "copy single-file-cli failed"
    exit /b %ERRORLEVEL%
)

call download_node.bat
