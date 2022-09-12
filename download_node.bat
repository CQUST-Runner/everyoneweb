set node_dir=%~dp0\build\server\node\bin
if exist %node_dir% (
    exit
)
if not exist node.exe (
    @REM https://stackoverflow.com/a/20476904
    powershell -Command "Invoke-WebRequest https://nodejs.org/dist/v18.9.0/win-x64/node.exe -OutFile node.exe"
)
mkdir %node_dir%
move /Y node.exe %node_dir%
