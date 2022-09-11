package main

import (
	"bufio"
	"context"
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
	logger.Info("serveAPI:%v %v", req.Method, req.URL)
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
		logger.Error(err.Error())
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

func doFakeSave(p *Page) (*Page, error) {
	p.Id = randID(IDLength)
	title := randID(IDLength)
	p.FileFolder = p.Id
	p.FilePath = path.Join(p.Id, getPageFileNameById(p.Id))
	p.SourceTitle = title
	p.Title = title
	p.UpdateTime = p.SaveTime
	return p, nil
}

func doSave(p *Page, isCache bool) (savedPapge *Page, err error) {
	var dd string
	if isCache {
		dd = path.Join(config().Settings.DataDirectory, cacheDirectory)
		if !storage.IsDir(dd) {
			err := os.MkdirAll(dd, 0777)
			if err != nil {
				return nil, err
			}
		}
	} else {
		dd = config().Settings.DataDirectory
	}

	p.Id = randID(IDLength)

	dd = path.Join(dd, p.Id)
	if !storage.IsDir(dd) {
		err := os.MkdirAll(dd, 0777)
		if err != nil {
			return nil, err
		}
	}
	defer func(dd string) {
		if err != nil {
			e := safeRemove(dd)
			if e != nil {
				logger.Warn("remove dir failed:%v", e)
			}
		}
	}(dd)

	var filename string
	pc := tryGet(p.SourceUrl)
	if pc != nil {
		defer pc.mu.Unlock()
		filename = path.Join(dd, getPageFileNameById(p.Id))
		logger.Info("copying %v to %v", pc.page.AbsFolderPath(), dd)
		err := copyDir(pc.page.AbsFolderPath(), dd)
		if err != nil {
			return nil, err
		}
		p.Title = pc.page.Title
		p.Desc = pc.page.Desc
		p.Size = pc.page.Size
		p.SourceTitle = pc.page.SourceTitle
		p.FaviconType = pc.page.FaviconType
	} else {
		filename = getPageFileNameById(p.Id)
		filename = path.Join(dd, filename)
		if storage.IsFile(filename) {
			return nil, fmt.Errorf("file exists")
		}
		err = doSavePage(context.Background(), config().SingleFileCli, dd,
			config().ChromePath, p.SourceUrl, filename)
		if err != nil {
			return nil, err
		}

		thumbnailFileName := path.Join(dd, "thumbnail.png")
		err := takeScreenShot(fmt.Sprintf("file://%v", filename), thumbnailFileName)
		if err != nil {
			logger.Warn("take screenshot of saved page failed:%v", err)
		}

		faviconFileName := path.Join(dd, "favicon.ico")
		contentType, err := getAndSaveFavicon(filename, faviconFileName)
		if err != nil {
			logger.Warn("save page file failed:%v", err)
		}
		p.FaviconType = contentType

		title, err := getPageTitle(filename)
		if err != nil {
			return nil, err
		}
		p.Desc = getPageDescription(filename)
		p.Size, _ = dirSize(dd)
		p.SourceTitle = title
		p.Title = title
	}
	if isCache {
		p.FileFolder = path.Join(cacheDirectory, p.Id)
		p.FilePath = path.Join(cacheDirectory, p.Id, getPageFileNameById(p.Id))
	} else {
		p.FileFolder = p.Id
		p.FilePath = path.Join(p.Id, getPageFileNameById(p.Id))
	}
	p.UpdateTime = p.SaveTime
	return p, nil
}

// /api/page/new
func savePage(w http.ResponseWriter, req *http.Request) {
	var err error
	defer func() {
		if err != nil {
			logger.Error("save page failed:%v", err)
		}
	}()
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

	logger.Info("save page:%v", string(r))

	var newPage *Page
	if config().TestMode && p.SourceUrl == "http://test" {
		newPage, err = doFakeSave(&p)
	} else {
		newPage, err = doSave(&p, false)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
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
	logger.Info("delete %v", id)
	if len(id) != IDLength {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	err := pd.delete(id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	dd := path.Join(config().Settings.DataDirectory, id)
	if storage.IsDir(dd) {
		err = safeRemove(dd)
		if err != nil {
			logger.Warn("remove web page failed:%v", err)
		}
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

	newPage, err := pd.update(p.Id, r)
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
	logger.Info("%v %v", req.Method, req.URL.Path)
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

	newConfig := config()
	newConfig.Settings = &s

	err = check(newConfig)
	if err != nil {
		logger.Info("config is invalid:%v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	err = writeConfig(newConfig, args().ConfigPath)
	if err != nil {
		logger.Error("write config failed:%v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	setConfig(func(old *Config) *Config {
		return newConfig
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
	absFileName := args().LogFilePath
	if !storage.IsFile(absFileName) {
		return &GetLogResp{Pos: 0, FileName: absFileName}, http.StatusOK
	}

	f, err := os.Open(absFileName)
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
		return &GetLogResp{Pos: pos, FileName: absFileName}, http.StatusOK
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
		line = line[0 : len(line)-1]
		if !firstLine {
			lines = append(lines, line)
		}
		firstLine = false
		pos += int64(len(line))
	}
	if truncated && len(lines) > 0 {
		lines = append([]string{"............truncated............"}, lines...)
	}
	return &GetLogResp{Lines: lines, Pos: pos, FileName: absFileName}, http.StatusOK
}

func getLog(w http.ResponseWriter, req *http.Request) {
	pos := req.URL.Query().Get("pos")

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

func Log(w http.ResponseWriter, req *http.Request) {
	switch req.Method {
	case "":
		getLog(w, req)
	case http.MethodGet:
		getLog(w, req)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func ConfigFile(w http.ResponseWriter, req *http.Request) {
	if req.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "text/javascript")
	w.Header().Set("Cache-Control", "no-store")
	settings := config().Settings
	jDoc, err := json.Marshal(settings)
	if err != nil {
		logger.Error("marshal json failed:%v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	js := fmt.Sprintf("window.config=JSON.parse('%s');", string(jDoc))
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(js))
}
