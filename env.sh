#!/bin/bash
set -e
CWD=$(pwd)

if [ ! -z "$1" ]; then
build="$CWD/$1/server"
else
build=$CWD/build/server
fi

frontend=$CWD/frontend
backend=$CWD/backend
thirdParty=$CWD/third-party
singleFileCli=$thirdParty/single-file-cli
desktop=$CWD/desktop

# echo "CWD=$CWD"
# echo "build=$build"
# echo "frontend=$frontend"
# echo "backend=$backend"
