#!/bin/bash

root=$(readlink -f $(dirname -- "$0"))
cd $root

rm *.html

for i in *.md; do
    echo "build $i..."
    pandoc -s $i -o "$(basename $i .md).html"
done
