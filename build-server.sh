#!/bin/bash

build_frontend() {
    cd $frontend
    ng --base-href=/app/ build
    if [ ! -z $build ]; then
        rm -rf $build/app
    fi
    mkdir -p $build/app
    cp -rf $frontend/dist/frontend/* $build/app/
}

build_backend() {
    cd $backend
    go build -o server
    cp -f $backend/server $build/server
    cp -f $backend/config.yaml $build/config.yaml
}

. env.sh

if [ ! -d $build ]; then
    mkdir -p $build
fi

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
