#!/bin/bash

./build-server.sh $@

. env.sh

cd $build

if [ -f server.pid ]; then
    pid="$(cat server.pid | head -n1)"
    rm server.pid
    echo "kill pid $pid"
    kill $pid
    sleep 1
fi

echo "starting ./server"
nohup ./server &
pid="$!"
echo "$pid" > server.pid
sleep 1
result=$(ps aux | grep $pid | grep -v grep)
if [ -z "$result" ]; then
    echo "process not running after 1 second"
    exit 1
fi
