#!/bin/bash

./build-server.sh $@

. env.sh

./stop-server.sh

cd $build

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
