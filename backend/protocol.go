package main

import (
	"path"
	"time"
)

const (
	PageTypePDF        = "pdf"
	PageTypeSinglePage = "singlePage"
	PageTypeHtmlAssets = "html+assets"
)

const (
	PageSourceChromeExtension  = "chrome-extension"
	PageSourceFirefoxExtension = "firefox-extension"
	PageSourceDesktopApp       = "desktop-app"
	PageSourceWebApp           = "web-app"
)

const (
	ImportMethodSave   = "save"
	ImportMethodImport = "import"
)

const (
	RatingOne   = 1
	RatingTwo   = 2
	RatingThree = 3
	RatingFour  = 4
	RatingFive  = 5
)

type Page struct {
	SourceUrl         string     `json:"sourceUrl"`
	Id                string     `json:"id"`
	SaveTime          *time.Time `json:"saveTime"`
	UpdateTime        *time.Time `json:"updateTime"`
	RemindReadingTime *time.Time `json:"remindReadingTime"`
	FilePath          string     `json:"filePath"`
	FileFolder        string     `json:"fileFolder"`
	Size              uint64     `json:"sz"` // recalculated when changes were made
	Tp                string     `json:"type"`
	Source            string     `json:"source"`
	Method            string     `json:"method"`
	Tags              []string   `json:"tags"`
	Category          string     `json:"category"`
	SourceTitle       string     `json:"sourceTitle"`
	Title             string     `json:"title"`
	Desc              string     `json:"desc"`
	Rating            int        `json:"rating"`
	MarkedAsRead      bool       `json:"markedAsRead"`
}

func (p *Page) AbsFilePath() string {
	return path.Join(config().Settings.DataDirectory, p.FilePath)
}

const (
	FirstScreenNew      = "new"
	FirstScreenLibrary  = "library"
	FirstScreenSettings = "settings"
	FirstScreenLogs     = "logs"
)

const (
	LanguageAuto               = "auto"
	LanguageSimplifiedChinese  = "sc"
	LanguageTraditionalChinese = "tc"
	LanguageEnglish            = "en"
	LanguageJapanese           = "ja"
)

type ColumnInfo struct {
	Id      string `json:"id" yaml:"id"`
	Display bool   `json:"display" yaml:"display" default:"true"`
}

// Settings ...
// server settings need restart to take effect
type Settings struct {
	FirstScreen      string       `json:"firstScreen" yaml:"firstScreen" default:"new"`
	Language         string       `json:"language" yaml:"language" default:"auto"`
	DataDirectory    string       `json:"dataDirectory" yaml:"dataDirectory"`
	MachineID        string       `json:"machineID" yaml:"machineID"`
	ServeLibrary     bool         `json:"serveLibrary" yaml:"serveLibrary" default:"true"`
	ServeLibraryPort int          `json:"serveLibraryPort" yaml:"serveLibraryPort" default:"16224"`
	ShowLogsEntry    bool         `json:"showLogsEntry" yaml:"showLogsEntry" default:"false"`
	Columns          []ColumnInfo `json:"columns" yaml:"columns"`
}

type GetLogResp struct {
	// pos from where next read starts
	Pos      int64    `json:"pos"`
	Lines    []string `json:"lines"`
	FileName string   `json:"filename"`
}
