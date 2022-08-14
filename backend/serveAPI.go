package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path"
	"strconv"

	"github.com/CQUST-Runner/datacross/storage"
)

const IDLength = 8

// pattern: /api/
func serveAPI(w http.ResponseWriter, req *http.Request) {
	fmt.Println("serveAPI", req.Method)
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
	case http.MethodGet:
		getPage(w, req)
	case http.MethodPost:
		savePage(w, req)
	case http.MethodDelete:
		deletePage(w, req)
	case http.MethodPatch:
		updatePage(w, req)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// /api/pageList/
func getAllPages(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

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
	case http.MethodGet:
		getAllPages(w, req)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// GET /api/settings
func getSettings(w http.ResponseWriter, req *http.Request) {
	v, err := json.Marshal(config().Settings)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(v)
}

// PATCH /api/settings/patch
func updateSettings(w http.ResponseWriter, req *http.Request) {
	r, err := ioutil.ReadAll(req.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	s := Settings{}
	err = json.Unmarshal(r, &s)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	setConfig(func(old *Config) *Config {
		old.Settings = s
		return old
	})
	w.WriteHeader(http.StatusOK)
	w.Write(r)
}

func settings(w http.ResponseWriter, req *http.Request) {
	switch req.Method {
	case "":
		getSettings(w, req)
	case http.MethodGet:
		getSettings(w, req)
	case http.MethodPatch:
		updateSettings(w, req)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func getLogByPos(pos int64) (*GetLogResp, int) {
	if !storage.IsFile(logFile) {
		return &GetLogResp{Pos: 0}, http.StatusOK
	}

	f, err := os.Open(logFile)
	if err != nil {
		return nil, http.StatusInternalServerError
	}
	defer f.Close()

	sz, err := f.Seek(0, io.SeekEnd)
	if err != nil {
		return nil, http.StatusInternalServerError
	}
	if pos < 0 || pos > sz {
		return nil, http.StatusBadRequest
	}
	if pos == sz {
		return &GetLogResp{Pos: pos}, http.StatusOK
	}

	truncated := false
	if pos+getLogMaxBytes < sz {
		pos = sz - getLogMaxBytes
		truncated = true
	}

	_, err = f.Seek(pos, io.SeekStart)
	if err != nil {
		return nil, http.StatusInternalServerError
	}

	reader := bufio.NewReader(f)
	lines := []string{}
	firstLine := true
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			break
		}
		if !firstLine {
			lines = append(lines, line)
		}
		firstLine = false
		pos += int64(len(line))
	}
	if truncated && len(lines) > 0 {
		lines = append([]string{"............truncated............"}, lines...)
	}
	return &GetLogResp{Lines: lines, Pos: pos}, http.StatusOK
}

func getLog(w http.ResponseWriter, req *http.Request) {
	pos := req.URL.Query().Get("pos")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	var iPos int64
	if len(pos) == 0 {
		iPos = 0
	} else {
		var err error
		iPos, err = strconv.ParseInt(pos, 10, 64)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		if iPos < 0 {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
	}

	log, ret := getLogByPos(iPos)
	if ret != http.StatusOK {
		w.WriteHeader(ret)
		return
	}
	val, err := json.Marshal(&log)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write(val)
}

func log(w http.ResponseWriter, req *http.Request) {
	switch req.Method {
	case "":
		getLog(w, req)
	case http.MethodGet:
		getLog(w, req)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
