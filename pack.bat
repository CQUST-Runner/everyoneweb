rmdir /Q /S %~dp0\build
call %~dp0\build-server.bat
cargo tauri build --bundles msi
if not exist %~dp0\release (
    mkdir %~dp0\release
)
robocopy %~dp0\desktop\target\release\bundle\msi\ %~dp0\release\
