@REM nodejs npm angular
@REM go mingw
@REM npm install -g pkg
@REM brew instal wget

cd frontend
npm install
cd ..
cd third-party/single-file-cli
chmod +x ./single-file
npm install

go install github.com/gogo/protobuf/protoc-gen-gofast@latest
