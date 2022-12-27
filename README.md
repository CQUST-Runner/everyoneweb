# EveryoneWeb

Be worried of internet content invalidation? EveryoneWeb saves web page in various formats and lets you access across multiple devices

<p>EveryoneWeb是一款：</p>
<ul>
    <li><strong>网页离线软件</strong>——将互联网有价值的内容“离线”到本地，这些内容将在所有设备可用，助力构建个人知识库；</li>
    <li><strong>“稍后阅读”软件</strong>——待阅读的文章太多？加入待读列表，规划“计划阅读”时间，还不用担心内容过期！</li>
    <li><strong>跨浏览器的书签管理软件</strong>——同时使用多个浏览器，书签却无法共享？使用EveryoneWeb，在一个地方管理所有书签。</li>
</ul>
        
## Contributing
 
frontend: [angular](https://angular.io/), in typescript

backend: golang with [chromedp](https://github.com/chromedp/chromedp) and [datacross](https://github.com/CQUST-Runner/datacross) library

desktop: [tauri](https://tauri.app/), in rust

### Setting up dev environment

On MacOS:

install nodejs and npm from https://nodejs.org/en/

then `npm install -g @angular/cli`

and `npm install -g pkg`

install golang from https://go.dev/dl/

then `go install github.com/gogo/protobuf/protoc-gen-gofast@latest`

install rust via https://rustup.rs/, might require `xcode-select --install`

then `cargo install tauri-cli`

then `rustup target add x86_64-apple-darwin`

install wget via `brew instal wget` (require homebrew https://brew.sh/)

finally, install https://pandoc.org/installing.html for documentation generation.

Linux and Windows:

the same as Mac except that wget is omitted and the omission of xcode/apple staff

### Build

shipping bundle to a specific system can only be built on the corresponding system

## Plan

