#!/bin/bash
set -e

. env.sh

cd $build

if [ -f everyoneweb-server.pid ]; then
    pid="$(cat everyoneweb-server.pid | head -n1)"
    rm everyoneweb-server.pid
    echo "kill pid $pid"
    kill $pid || true
    
    # other running processes
    pkill everyoneweb-server || true
    sleep 1
fi
