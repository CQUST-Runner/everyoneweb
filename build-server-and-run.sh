#!/bin/bash
set -e

./build-server.sh $@

. env.sh 'build'

./stop-server.sh

cd $build

echo "starting ./everyoneweb-server"
nohup ./everyoneweb-server -config=config.yaml -log=everyoneweb-server.log &
pid="$!"
echo "$pid" > everyoneweb-server.pid
sleep 1
result=$(ps aux | grep $pid | grep -v grep)
if [ -z "$result" ]; then
    echo "process not running after 1 second"
    exit 1
fi
