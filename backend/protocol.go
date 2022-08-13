package main

import "time"

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
	Tp                string     `json:"type"`
	Source            string     `json:"source"`
	Method            string     `json:"method"`
	Tags              []string   `json:"tags"`
	Category          string     `json:"category"`
	SourceTitle       string     `json:"sourceTitle"`
	Title             string     `json:"title"`
	Desc              string     `json:"desc"`
	Rating            int        `json:"rating"`
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
	LanguageJapanese           = "jp"
)

// Settings ...
// server settings need restart to take effect
type Settings struct {
	FirstScreen      string `json:"firstScreen" yaml:"firstScreen" default:"new"`
	Language         string `json:"language" yaml:"language" default:"auto"`
	DataDirectory    string `json:"dataDirectory" yaml:"dataDirectory"`
	MachineID        string `json:"machineID" yaml:"machineID"`
	ServeLibrary     bool   `json:"serveLibrary" yaml:"serveLibrary" default:"true"`
	ServeLibraryPort int    `json:"serveLibraryPort" yaml:"serveLibraryPort" default:"16224"`
}
