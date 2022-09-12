#!/bin/bash

root=$(readlink -f $(dirname -- "$0"))

rm -rf $root/build

./build-server.sh all build

. env.sh
kernel=$(uname)
if [ $kernel == "Darwin" ]; then
    cargo tauri build --bundles dmg
elif [ $kernel == "Linux" ]; then
    # TODO: support rpm
    cargo tauri build --bundles deb
fi
