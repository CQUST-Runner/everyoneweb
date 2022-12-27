package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

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
	mustParseArgs()
	mustInitLogger(args().LogFilePath)
	mustLoadConfig(args().ConfigPath)
	prepareDataDirectory()
	mustInitParticipant()
	regularlyCleanCache()
	go serve()

	ch := make(chan os.Signal, 1)
	signal.Notify(ch, syscall.SIGTERM, syscall.SIGHUP, syscall.SIGINT)
	sig := <-ch
	fmt.Printf("server exit by signal:%v\n", sig)
	logger.Info("server exit by signal:%v", sig)
}
