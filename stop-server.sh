#!/bin/bash

. env.sh

cd $build

if [ -f offliner-server.pid ]; then
    pid="$(cat offliner-server.pid | head -n1)"
    rm offliner-server.pid
    echo "kill pid $pid"
    kill $pid
    sleep 1
fi
