#!/bin/bash


./build-server.sh all package

. env.sh

cargo tauri build --bundles app
cp -rf desktop/target/release/bundle/macos/offliner.app package

cat << 'EOF' > package/filter-offliner.sh 
#!/bin/bash

while IFS= read -r line; do
    printf '%s\n' "$line"
done
if [ -n "$line" ]; then
    printf '%s' "$line"
fi
EOF

cat << 'EOF' > package/launch.sh
#!/bin/bash

pids=$(ps aux | grep offliner-server | grep -v grep | awk '{print $2}' | ./filter-offliner.sh)
echo $pids

if [ -z "$pids" ]; then
    echo "starting ./offliner-server"
    cd ./server
    nohup ./offliner-server &
    sleep 1
    cd ..
fi

open -n ./offliner.app

EOF

cat << 'EOF' > package/kill.sh
#!/bin/bash
ps aux | grep offliner-server | grep -v grep | awk '{print $2}' | ./filter-offliner.sh | xargs kill

EOF

chmod +x package/filter-offliner.sh package/launch.sh package/kill.sh

