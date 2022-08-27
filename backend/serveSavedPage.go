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
