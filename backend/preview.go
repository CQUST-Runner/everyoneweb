package main

import (
	"io/ioutil"
	"net/http"
	"os"
)

func preview(w http.ResponseWriter, req *http.Request) {
	if req.Method != http.MethodGet {
		logger.Error("method:%v is not allowed", req.Method)
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	url := req.URL.Query().Get("url")
	if url == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	logger.Info("preview %v", url)

	page, err := doSave(&Page{SourceUrl: url})
	if err != nil {
		logger.Error("save page for preview failed:%v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	bytes, err := ioutil.ReadFile(page.FilePath)
	if err != nil {
		os.Remove(page.FilePath)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(bytes)
}
