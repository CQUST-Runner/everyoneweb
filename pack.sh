#!/bin/bash
set -e

if [ -z "$1" ]; then
    echo "usage:"
    echo "$(basename -- $0) <target>"
    echo "`target` can be one of the follow:"
    echo "IntelMac, AppleMac, Linux"
    exit 1
fi
target=$1

root=$(readlink -f $(dirname -- "$0"))

rm -rf $root/build

./build-server.sh all build $target

. env.sh
kernel=$(uname)
if [ ! -d release ]; then
    mkdir release
fi
if [ $kernel == "Darwin" ]; then
    if [ "$target" == "AppleMac" ]; then
        cargo tauri build --bundles dmg --target aarch64-apple-darwin
        cp -f desktop/target/aarch64-apple-darwin/release/bundle/dmg/*.dmg release
    elif [ "$target" == "IntelMac" ]; then
        cargo tauri build --bundles dmg --target x86_64-apple-darwin
        cp -f desktop/target/x86_64-apple-darwin/release/bundle/dmg/*.dmg release
    else 
        echo "unknown target $target"
        exit 1
    fi
elif [ $kernel == "Linux" ]; then
    # TODO: support rpm
    cargo tauri build --bundles deb
    cp -f desktop/target/release/bundle/deb/*.deb release/
fi
