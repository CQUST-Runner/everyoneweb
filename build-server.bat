
cd %~dp0\backend
go build -o offliner-server -ldflags -H=windowsgui

cd %~dp0\frontend
call npm install
call ng build

cd %~dp0\third-party\single-file-cli
call npm install

cd %~dp0
robocopy backend\ build\server\ offliner-server
if exist build\server\app (
    rmdir /Q /S build\server\app\
)
robocopy frontend\dist\frontend build\server\app\ /E
if exist build\server\single-file-cli (
    rmdir /Q /S build\server\single-file-cli
)
robocopy third-party\single-file-cli build\server\single-file-cli\ /E

call download_node.bat
