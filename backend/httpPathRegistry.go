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
	http.DefaultServeMux.HandleFunc("/api/log/", withCORS(log))
	http.DefaultServeMux.HandleFunc("/app/", serveSite)
	http.DefaultServeMux.HandleFunc("/view/", serveSavedPage)
	fmt.Printf("server running on 127.0.0.1:%v\n", config().Settings.ServeLibraryPort)
	err := http.ListenAndServe(fmt.Sprintf("127.0.0.1:%v", config().Settings.ServeLibraryPort), nil)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
