package main

import (
	"fmt"
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
		fmt.Fprintln(os.Stderr, "load config file first")
		os.Exit(1)
	}

	tmp := storage.Participant{}
	err := tmp.Init(path.Join(config().Settings.DataDirectory, "db"), config().Settings.MachineID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "init storage failed, err:%v\n", err)
		os.Exit(1)
	}
	p = &tmp
}
