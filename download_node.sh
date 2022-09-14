#!/bin/bash
set -e

root=$(readlink -f $(dirname -- "$0"))

target=$1

node_dir=$root/build/server/node
if [ -d $node_dir ]; then
    exit 0
fi

kernel=$(uname)
if [ $kernel == "Darwin" ]; then
    echo "running on Darwin"
    if [ $target == "AppleMac" ]; then
        url=https://nodejs.org/dist/v18.9.0/node-v18.9.0-darwin-arm64.tar.xz
    elif [ $target == "IntelMac" ]; then
        url=https://nodejs.org/dist/v18.9.0/node-v18.9.0-darwin-x64.tar.xz
    else
        url=https://nodejs.org/dist/v18.9.0/node-v18.9.0-darwin-x64.tar.xz
    fi
elif [ $kernel == "Linux" ]; then
    echo "running on Linux"
    url=https://nodejs.org/dist/v18.9.0/node-v18.9.0-linux-x64.tar.xz
fi

output=$(basename $url)
if [ ! -f $output ]; then
    wget --output-document $output $url
fi

if [ ! -d $node_dir ]; then
    mkdir -p $node_dir
fi
dest=$root/build/server/$output
mv -f $output $dest
tar xf $dest --directory=$node_dir --strip-components=1
rm $dest
rm -rf $node_dir/include $node_dir/lib $node_dir/share
find $node_dir/bin -not -type d -not -name "node" -delete
chmod +x $node_dir/bin/node
