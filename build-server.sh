#!/bin/bash

CWD=$(pwd)
build=$CWD/build/server
frontend=$CWD/frontend
backend=$CWD/backend

if [ ! -d $build ]; then
    mkdir -p $build
fi

cd $frontend
ng --base-href=/app/ build
if [ ! -z $build ]; then
    rm -rf $build/app
fi
mkdir -p $build/app
cp -rf $frontend/dist/frontend/* $build/app/

cd $backend
go build -o server
cp -f $backend/server $build/server

