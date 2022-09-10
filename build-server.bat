rmdir /Q /S %~dp0\build

cd %~dp0\backend
go build -o offliner-server -ldflags -H=windowsgui

cd %~dp0\frontend
call npm install
call ng build

cd %~dp0\third-party\single-file-cli
call npm install

cd %~dp0
robocopy backend\ build\server\ offliner-server
robocopy frontend\dist\frontend build\server\app\ /E
robocopy third-party\single-file-cli build\server\single-file-cli\ /E
