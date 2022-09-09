https://github.com/maximegris/angular-tauri


xcode-select --install

curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh

cargo install tauri-cli



 // when setting tauri.conf.json > build > devPath to http://localhost:4200/app, `window.__TAURI__` will be unavailable, why?
 