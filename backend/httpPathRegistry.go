package main

import (
	"fmt"
	"net/http"
	"os"
)

func serve() {
	http.DefaultServeMux.HandleFunc("/api/", withCORS(serveAPI))
	http.DefaultServeMux.HandleFunc("/api/page/", withCORS(page))
	http.DefaultServeMux.HandleFunc("/api/pageList/", withCORS(pageList))
	http.DefaultServeMux.HandleFunc("/api/settings/", withCORS(settings))
	http.DefaultServeMux.HandleFunc("/api/log/", withCORS(Log))
	http.DefaultServeMux.HandleFunc("/api/config.js", withCORS(ConfigFile))
	http.DefaultServeMux.HandleFunc("/app/", serveSite)
	http.DefaultServeMux.HandleFunc("/doc/", serveSite)
	http.DefaultServeMux.HandleFunc("/preview/", withCORS(preview))
	http.DefaultServeMux.HandleFunc("/view/", serveSavedPage)
	logger.Info("server running on 127.0.0.1:%v", config().Settings.ServeLibraryPort)
	wd, err := os.Getwd()
	if err == nil {
		logger.Info("working directory is:%v", wd)
	}
	err = http.ListenAndServe(fmt.Sprintf("127.0.0.1:%v", config().Settings.ServeLibraryPort), nil)
	if err != nil {
		logger.Error(err.Error())
		os.Exit(1)
	}
}
