package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.DefaultServeMux.HandleFunc("/api/", serveAPI)
	http.DefaultServeMux.HandleFunc("/app/", serveSite)
	fmt.Println("server running on 127.0.0.1:16224")
	err := http.ListenAndServe("127.0.0.1:16224", nil)
	if err != nil {
		fmt.Println(err)
		return
	}

	ch := make(chan struct{})
	<-ch
}
