package main

import (
	"os"
	"path"
	"sync"

	"github.com/CQUST-Runner/datacross/storage"
)

// TODO: Close
var p *storage.Participant
var m sync.Mutex

func acquireDB() *storage.Participant {
	m.Lock()
	return p
}

func releaseDB() {
	m.Unlock()
}

func mustInitParticipant() {
	if config() == nil {
		logger.Error("load config file first")
		os.Exit(1)
	}

	tmp := storage.Participant{}
	err := tmp.Init(path.Join(config().Settings.DataDirectory, "db"), config().Settings.MachineID)
	if err != nil {
		logger.Error("init storage failed, err:%v", err)
		os.Exit(1)
	}
	p = &tmp
}
