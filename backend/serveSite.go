package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
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

	logger.Info("loading %v\n", p)
	f, err := ioutil.ReadFile(p)
	if err != nil {
		fmt.Fprintln(w, "read file error", err)
		logger.Error("read file error:%v", err)
		return
	}
	w.Write(f)
}
