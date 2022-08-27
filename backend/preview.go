package main

import (
	"io/ioutil"
	"net/http"
)

func preview(w http.ResponseWriter, req *http.Request) {

	url := req.URL.Query().Get("url")
	if url == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	logger.Info("preview %v", url)

	switch req.Method {
	case http.MethodGet:
		getPreview(w, url)
	case http.MethodDelete:
		delCache(url)
		w.WriteHeader(http.StatusOK)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func getPreview(w http.ResponseWriter, url string) {

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

	bytes, err := ioutil.ReadFile(pc.page.AbsFilePath())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write(bytes)
}
