#!/bin/bash

root=$(readlink -f $(dirname -- "$0"))

rm -rf $root/build

./build-server.sh all build

. env.sh
kernel=$(uname)
if [ ! -d release ]; then
    mkdir release
fi
if [ $kernel == "Darwin" ]; then
    cargo tauri build --bundles dmg
    cp -f desktop/target/release/bundle/dmg/*.dmg release/
elif [ $kernel == "Linux" ]; then
    # TODO: support rpm
    cargo tauri build --bundles deb
    cp -f desktop/target/release/bundle/deb/*.deb release/
fi
