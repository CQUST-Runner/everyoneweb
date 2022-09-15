#!/bin/bash
set -e

. env.sh

cd $build

if [ -f webook-server.pid ]; then
    pid="$(cat webook-server.pid | head -n1)"
    rm webook-server.pid
    echo "kill pid $pid"
    kill $pid
    
    # other running processes
    pkill webook-server
    sleep 1
fi
