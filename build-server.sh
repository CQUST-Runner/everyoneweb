#!/bin/bash
set -e
root=$(readlink -f $(dirname -- "$0"))

build_frontend() {
    cd $frontend
    npm install --legacy-peer-deps
    ng build
    if [ -d $build ]; then
        rm -rf $build/app
    fi
    mkdir -p $build/app
    cp -rf $frontend/dist/frontend/* $build/app/
}

build_backend() {
    cd $singleFileCli
    npm install
    cd $backend
    if [ "$target" == "IntelMac" ]; then
        GOOS=darwin GOARCH=amd64 go build -o offliner-server
    elif [ "$target" == "AppleMac" ]; then
        GOOS=darwin GOARCH=arm64 go build -o offliner-server
    elif [ "$target" == "Linux" ]; then
        GOOS=linux GOARCH=amd64 go build -o offliner-server
    else
        go build -o offliner-server
    fi
    cp -f $backend/offliner-server $build/offliner-server
    chmod +x $build/offliner-server
    # cp -f $backend/config.yaml $build/config.yaml
    cp -rf $singleFileCli $build/single-file-cli
}

. env.sh "$2"
if [ ! -d $build ]; then
    mkdir -p $build
fi

target=$3

if [ "$1" == 'frontend' ]; then
    echo '###### building frontend ######'
    build_frontend
elif [ "$1" == "backend" ]; then
    echo '###### building backend ######'
    build_backend
else
    build_frontend
    build_backend
fi

$root/download_node.sh $target
