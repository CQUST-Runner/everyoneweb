#!/bin/bash
set -e

. env.sh

cd $build

if [ -f webbook-server.pid ]; then
    pid="$(cat webbook-server.pid | head -n1)"
    rm webbook-server.pid
    echo "kill pid $pid"
    kill $pid
    
    # other running processes
    pkill webbook-server
    sleep 1
fi
