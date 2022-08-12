package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path"

	"github.com/CQUST-Runner/datacross/storage"
)

// path pattern: /app/
func serveSite(w http.ResponseWriter, req *http.Request) {
	p := req.URL.Path
	if path.Ext(p) == ".js" {
		w.Header().Set("Content-Type", "text/javascript")
	}
	if path.Ext(p) == ".css" {
		w.Header().Set("Content-Type", "text/css")
	}
	p = path.Join(".", p)
	if storage.IsDir(p) {
		p = p + "/index.html"
	}
	if !storage.IsFile(p) {
		p = "./app/index.html"
	}

	fmt.Printf("loading %v\n\n", p)
	f, err := ioutil.ReadFile(p)
	if err != nil {
		fmt.Fprintln(w, "read file error", err)
		fmt.Fprintln(os.Stderr, "read file error", err)
		return
	}
	w.Write(f)
}
