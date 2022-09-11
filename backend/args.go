package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/CQUST-Runner/datacross/storage"
)

type serverArgs struct {
	ConfigPath  string
	LogFilePath string
}

var _args serverArgs

func args() *serverArgs {
	return &_args
}

func mustParseArgs() {
	flag.StringVar(&_args.ConfigPath, "config", "", "a string denotes where the config file is")
	flag.StringVar(&_args.LogFilePath, "log", "", "a string denotes to where the log is written")
	flag.Parse()

	if _args.ConfigPath == "" {
		fmt.Fprintln(os.Stderr, "-config is not specified")
		os.Exit(1)
	}
	var err error
	_args.ConfigPath, err = storage.ToAbs(_args.ConfigPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "convert -config=%v to abs path failed:%v", _args.ConfigPath, err)
		os.Exit(1)
	}
	if err := checkFileAccess(_args.ConfigPath); err != nil {
		fmt.Fprintf(os.Stderr, "no access to config file:%v %v\n", _args.ConfigPath, err)
		os.Exit(1)
	}

	if _args.LogFilePath == "" {
		fmt.Fprintln(os.Stderr, "-log is not specified")
		os.Exit(1)
	}
	_args.LogFilePath, err = storage.ToAbs(_args.LogFilePath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "convert -log=%v to abs path failed:%v", _args.LogFilePath, err)
		os.Exit(1)
	}
	if err := checkFileAccess(_args.LogFilePath); err != nil {
		fmt.Fprintf(os.Stderr, "no access to log file:%v %v\n", _args.LogFilePath, err)
		os.Exit(1)
	}
}
