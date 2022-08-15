package main

import (
	"fmt"
	"os"

	"github.com/CQUST-Runner/datacross/storage"
)

func prepareDataDirecotry() {
	path := config().Settings.DataDirectory
	if !storage.IsDir(path) {
		err := os.MkdirAll(path, 0777)
		if err != nil {
			fmt.Printf("create data directory failed:%v", err)
			os.Exit(1)
		}
	}
}

func main() {
	mustLoadConfig()
	prepareDataDirecotry()
	mustInitParticipant()
	serve()
}
