package main

import (
	"io/ioutil"
	"net/http"
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

	pc := tryGet(url)
	if pc == nil {
		var err error
		pc, err = saveAsCache(url)
		if err != nil {
			logger.Error("save as cache failed:%v", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	}
	defer pc.mu.Unlock()

	bytes, err := ioutil.ReadFile(pc.page.FilePath)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write(bytes)
}
