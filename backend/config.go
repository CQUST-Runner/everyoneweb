package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"sync"

	"github.com/creasty/defaults"
	"gopkg.in/yaml.v3"
)

const configFile = "config.yaml"
const logFile = "nohup.out"
const getLogMaxBytes = 4096

type Config struct {
	TestMode      bool      `yaml:"-" default:"true"`
	ServeRoot     string    `yaml:"-" default:"."`
	SingleFileCli string    `yaml:"-" default:"./single-file-cli"`
	ChromePath    string    `yaml:"chrome_path"`
	Settings      *Settings `yaml:"settings" default:"{}"`
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

	if !isAbs(c.Settings.DataDirectory) {
		return fmt.Errorf("working directory must be absolute path")
	}
	return nil
}

func writeConfig(config *Config) error {
	bytes, err := yaml.Marshal(config)
	if err != nil {
		return err
	}
	tmpFile := configFile + ".tmp"
	err = ioutil.WriteFile(tmpFile, bytes, 0666)
	if err != nil {
		return err
	}
	return os.Rename(tmpFile, configFile)
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
