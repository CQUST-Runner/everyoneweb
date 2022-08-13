package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"path"
)

const IDLength = 8

// pattern: /api/
func serveAPI(w http.ResponseWriter, req *http.Request) {
}

var pd pageDao

func checkPage(p *Page) error {
	if len(p.Id) == 0 {
		return fmt.Errorf("id is empty")
	}
	return nil
}

// /api/page/<id>
func getPage(w http.ResponseWriter, req *http.Request) {
	id := path.Base(req.URL.Path)
	if len(id) != IDLength {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	p, err := pd.get(id)
	if err != nil {
		fmt.Println(err)
		if err.Error() == "not exist" {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	val, err := json.Marshal(p)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write(val)
}

func doSave(p *Page) (*Page, error) {
	p.Id = randID(IDLength)
	// fake
	p.FilePath = p.Id + ".html"
	p.SourceTitle = randID(IDLength)
	p.Title = p.SourceTitle
	p.UpdateTime = p.SaveTime
	return p, nil
}

// /api/page/new
func savePage(w http.ResponseWriter, req *http.Request) {
	r, err := ioutil.ReadAll(req.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	p := Page{}
	err = json.Unmarshal(r, &p)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	newPage, err := doSave(&p)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	val, err := json.Marshal(newPage)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = pd.create(newPage)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write(val)
}

// /api/page/<id>
func deletePage(w http.ResponseWriter, req *http.Request) {
	id := path.Base(req.URL.Path)
	if len(id) != IDLength {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	err := pd.delete(id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// /api/page/<id>
func updatePage(w http.ResponseWriter, req *http.Request) {
	r, err := ioutil.ReadAll(req.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	p := Page{}
	err = json.Unmarshal(r, &p)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	err = checkPage(&p)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	newPage, err := pd.update(&p)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	val, err := json.Marshal(newPage)
	if err != nil {
		val = r
	}
	w.WriteHeader(http.StatusOK)
	w.Write(val)
}

func page(w http.ResponseWriter, req *http.Request) {
	fmt.Printf("%v %v\n", req.Method, req.URL.Path)
	switch req.Method {
	case "":
		getPage(w, req)
	case "GET":
		getPage(w, req)
	case "POST":
		savePage(w, req)
	case "DELETE":
		deletePage(w, req)
	case "PATCH":
		updatePage(w, req)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// /api/pageList/
func getAllPages(w http.ResponseWriter, req *http.Request) {
	pages, err := pd.all()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	json, err := json.Marshal(pages)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(json)
}

func pageList(w http.ResponseWriter, req *http.Request) {
	switch req.Method {
	case "":
		getAllPages(w, req)
	case "GET":
		getAllPages(w, req)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func settings(w http.ResponseWriter, req *http.Request) {
}
