package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"sync"

	"github.com/CQUST-Runner/datacross/storage"
	"github.com/creasty/defaults"
	"gopkg.in/yaml.v3"
)

type Config struct {
	ServeRoot string   `yaml:"-" default:"."`
	Settings  Settings `yaml:"settings" default:"{}"`
}

func (s *Config) UnmarshalYAML(unmarshal func(interface{}) error) error {
	err := defaults.Set(s)
	if err != nil {
		return err
	}

	type plain Config
	if err := unmarshal((*plain)(s)); err != nil {
		return err
	}
	return nil
}

const configFile = "config.yaml"

var _config *Config
var rw sync.RWMutex

func config() *Config {
	rw.RLock()
	defer rw.RUnlock()
	return _config
}

func setConfig(do func(old *Config) *Config) {
	rw.Lock()
	defer rw.Unlock()
	_config = do(_config)
}

func check(c *Config) error {
	if len(c.Settings.DataDirectory) == 0 {
		return fmt.Errorf("working directory is required")
	}
	if len(c.Settings.MachineID) == 0 {
		return fmt.Errorf("machine id is required")
	}
	return nil
}

func mustLoadConfig() {
	data, err := ioutil.ReadFile(configFile)
	if err != nil {
		fmt.Fprintf(os.Stderr, "load config file[%v] failed, err:%v\n", configFile, err)
		os.Exit(1)
	}
	c := Config{}
	err = yaml.Unmarshal(data, &c)
	if err != nil {
		fmt.Fprintf(os.Stderr, "read config file[%v] failed, err:%v\n", configFile, err)
		os.Exit(1)
	}

	err = check(&c)
	if err != nil {
		fmt.Fprintf(os.Stderr, "check config error:%v\n", err)
		os.Exit(1)
	}

	setConfig(func(old *Config) *Config { return &c })
}

// TODO: Close
var p *storage.Participant
var m sync.Mutex

func acquireDB() *storage.Participant {
	m.Lock()
	return p
}

func releaseDB() {
	m.Unlock()
}

func mustInitParticipant() {
	if config() == nil {
		fmt.Fprintln(os.Stderr, "load config file first")
		os.Exit(1)
	}

	tmp := storage.Participant{}
	err := tmp.Init(config().Settings.DataDirectory, config().Settings.MachineID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "init storage failed, err:%v\n", err)
		os.Exit(1)
	}
	p = &tmp
}

func serve() {
	http.DefaultServeMux.HandleFunc("/api/", serveAPI)
	http.DefaultServeMux.HandleFunc("/api/page/", page)
	http.DefaultServeMux.HandleFunc("/api/pageList/", pageList)
	http.DefaultServeMux.HandleFunc("/api/settings/", settings)
	http.DefaultServeMux.HandleFunc("/app/", serveSite)
	fmt.Printf("server running on 127.0.0.1:%v\n", config().Settings.ServeLibraryPort)
	err := http.ListenAndServe(fmt.Sprintf("127.0.0.1:%v", config().Settings.ServeLibraryPort), nil)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func main() {
	mustLoadConfig()
	mustInitParticipant()
	serve()
}
