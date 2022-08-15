package main

import (
	"os"

	"github.com/CQUST-Runner/datacross/storage"
)

func prepareDataDirectory() {
	path := config().Settings.DataDirectory
	if !storage.IsDir(path) {
		err := os.MkdirAll(path, 0777)
		if err != nil {
			logger.Error("create data directory failed:%v", err)
			os.Exit(1)
		}
	}
}

func main() {
	mustLoadConfig()
	prepareDataDirectory()
	mustInitParticipant()
	serve()
}
