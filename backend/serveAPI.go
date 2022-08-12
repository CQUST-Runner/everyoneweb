package main

import (
	"net/http"
)

// pattern: /api/
func serveAPI(w http.ResponseWriter, req *http.Request) {
}

func page(w http.ResponseWriter, req *http.Request) {
}

func pageList(w http.ResponseWriter, req *http.Request) {
}

// Settings ...
type Settings struct {
	Port int
}

func settings(w http.ResponseWriter, req *http.Request) {
}
