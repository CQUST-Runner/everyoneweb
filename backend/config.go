package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"sync"

	"github.com/CQUST-Runner/datacross/storage"
	"github.com/creasty/defaults"
	"gopkg.in/yaml.v3"
)

const getLogMaxBytes = 4096

// omitempty is required for config merging, see `getCopyOfDeafultConfig`, `loadConfigFileWithDefaults`
type Config struct {
	TestMode      bool      `yaml:"-" default:"true"`
	ServeRoot     string    `yaml:"-" default:"."`
	SingleFileCli string    `yaml:"-" default:"./single-file-cli"`
	ChromePath    string    `yaml:"chrome_path,omitempty"`
	Settings      *Settings `yaml:"settings,omitempty" default:"{}"`
}

var defaultConfig Config = Config{
	ChromePath: findExecPath(),
	Settings: &Settings{
		DataDirectory: getDefaultDataDirectory(),
		MachineID:     mustGenerateMachineID(),
	},
}

// struct tag default values and `defaultConfig` default values will be combined and returned
func getCopyOfDeafultConfig() (*Config, error) {
	bytes, err := yaml.Marshal(&defaultConfig)
	if err != nil {
		return nil, err
	}
	c := Config{}
	err = yaml.Unmarshal(bytes, &c)
	if err != nil {
		return nil, err
	}
	return &c, nil
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

func writeConfig(config *Config, p string) error {
	bytes, err := yaml.Marshal(config)
	if err != nil {
		return err
	}
	tmpFile := p + ".tmp"
	err = ioutil.WriteFile(tmpFile, bytes, 0666)
	if err != nil {
		return err
	}
	return os.Rename(tmpFile, p)
}

func loadConfigFileWithDefaults(p string) (*Config, error) {
	data, err := ioutil.ReadFile(p)
	if err != nil {
		return nil, err
	}

	c, err := getCopyOfDeafultConfig()
	if err != nil {
		return nil, err
	}
	err = yaml.Unmarshal(data, c)
	if err != nil {
		return nil, err
	}
	return c, nil
}

func mustLoadConfig(p string) {
	if !storage.IsFile(p) {
		c, err := getCopyOfDeafultConfig()
		if err != nil {
			logger.Error("get default config failed, err:%v", err)
			os.Exit(1)
			return
		}
		setConfig(func(old *Config) *Config {
			return c
		})
		return
	}

	c, err := loadConfigFileWithDefaults(p)
	if err != nil {
		logger.Error("load config file:%v failed, err:%v", p, err)
		os.Exit(1)
		return
	}
	err = check(c)
	if err != nil {
		logger.Error("check config error:%v", err)
		os.Exit(1)
		return
	}

	setConfig(func(old *Config) *Config { return c })
}
