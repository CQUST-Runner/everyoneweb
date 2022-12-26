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
        GOOS=darwin GOARCH=amd64 CGO_ENABLED=1 go build -o everyoneweb-server
    elif [ "$target" == "AppleMac" ]; then
        GOOS=darwin GOARCH=arm64 CGO_ENABLED=1 go build -o everyoneweb-server
    elif [ "$target" == "Linux" ]; then
        GOOS=linux GOARCH=amd64 CGO_ENABLED=1 go build -o everyoneweb-server
    else
        CGO_ENABLED=1 go build -o everyoneweb-server
    fi
    cp -f $backend/everyoneweb-server $build/everyoneweb-server
    chmod +x $build/everyoneweb-server
    # cp -f $backend/config.yaml $build/config.yaml
    cp -rf $singleFileCli $build/single-file-cli
}

build_doc() {
    cd $doc
    ./build.sh
    mkdir -p $build/doc
    cp -rf $doc/*.html $build/doc
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
build_doc

$root/download_node.sh $target
