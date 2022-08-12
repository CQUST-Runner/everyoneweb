#!/bin/bash

. env.sh

cd $build

if [ -f server.pid ]; then
    pid="$(cat server.pid | head -n1)"
    rm server.pid
    echo "kill pid $pid"
    kill $pid
    sleep 1
fi
