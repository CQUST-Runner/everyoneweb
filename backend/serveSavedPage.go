package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path"

	"github.com/CQUST-Runner/datacross/storage"
)

// path pattern: /view/<id>
func serveSavedPage(w http.ResponseWriter, req *http.Request) {
	if req.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	id := path.Base(req.URL.Path)
	page, err := pd.get(id)
	if err != nil {
		if err.Error() == "not exist" {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	thumbnail := req.URL.Query().Get("thumbnail")
	if thumbnail != "" {
		folder := page.AbsFolderPath()
		filename := path.Join(folder, "thumbnail.png")

		var bytes []byte
		if storage.IsFile(filename) {
			var err error
			bytes, err = ioutil.ReadFile(filename)
			if err != nil {
				logger.Warn("read page thumbnail failed:%v", err)
			}
		}

		if len(bytes) > 0 {
			w.Header().Set("content-type", "image/png")
			w.WriteHeader(http.StatusOK)
			w.Write(bytes)
		} else {
			w.Header().Set("location", "https://placehold.co/600x400?text=Not+Available")
			w.WriteHeader(http.StatusTemporaryRedirect)
		}
		return
	}

	favicon := req.URL.Query().Get("favicon")
	if favicon != "" {
		folder := page.AbsFolderPath()
		filename := path.Join(folder, "favicon.ico")

		var bytes []byte
		if storage.IsFile(filename) {
			var err error
			bytes, err = ioutil.ReadFile(filename)
			if err != nil {
				logger.Warn("read page favicon failed:%v", err)
			}
		}

		if len(bytes) > 0 {
			w.Header().Set("content-type", "image/x")
			w.WriteHeader(http.StatusOK)
			w.Write(bytes)
		} else {
			w.Header().Set("location", "https://placehold.co/16x16")
			w.WriteHeader(http.StatusTemporaryRedirect)
		}
		return
	}

	absFilePath := page.AbsFilePath()
	if !storage.IsFile(absFilePath) {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	logger.Info("loading %v", absFilePath)
	f, err := ioutil.ReadFile(absFilePath)
	if err != nil {
		fmt.Fprintln(w, "read file error", err)
		fmt.Fprintln(os.Stderr, "read file error", err)
		return
	}
	w.Write(f)
}
