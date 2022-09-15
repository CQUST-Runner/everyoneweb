#!/bin/bash
set -e

./build-server.sh $@

. env.sh 'build'

./stop-server.sh

cd $build

echo "starting ./webook-server"
nohup ./webook-server -config=config.yaml -log=webook-server.log &
pid="$!"
echo "$pid" > webook-server.pid
sleep 1
result=$(ps aux | grep $pid | grep -v grep)
if [ -z "$result" ]; then
    echo "process not running after 1 second"
    exit 1
fi
