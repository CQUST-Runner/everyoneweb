package main

import (
	"bufio"
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"offliner-backend/storage"
	"os"
	"strings"

	"gopkg.in/yaml.v3"
)

type Config struct {
	// TODO: default not working
	WorkingDirectory string `yaml:"wd" default:"./data"`
	MachineName      string `yaml:"machine_name" default:"machine0"`
}

func loadConfig(filename string, c *Config) error {
	data, err := ioutil.ReadFile(filename)
	if err != nil {
		return err
	}
	return yaml.Unmarshal(data, c)
}

var c *Config
var p *storage.Participant

func main() {
	confFile := ""
	flag.StringVar(&confFile, "conf", "conf.yaml", "config file path")
	flag.Parse()

	conf := Config{}
	err := loadConfig(confFile, &conf)
	if err != nil {
		fmt.Println("load conf file failed", err)
		return
	}
	fmt.Println("conf: ", conf)
	c = &conf

	participant := storage.Participant{}
	err = participant.Init(c.WorkingDirectory, c.MachineName)
	if err != nil {
		fmt.Println("init participant failed", err)
		return
	}
	defer participant.Close()
	p = &participant

	repl()
}

func list(w io.Writer, args ...string) {
	records, err := p.S().All()
	if err != nil {
		fmt.Fprintln(w, err)
		return
	}
	fmt.Fprintln(w, records)
}

func get(w io.Writer, args ...string) {
	if len(args) < 1 {
		fmt.Fprintln(w, "too few args, usage: get <key>")
		return
	}

	key := args[0]
	val, err := p.S().Load(key)
	if err != nil {
		fmt.Fprintln(w, "get failed", err)
		return
	}
	fmt.Fprintln(w, val)
}

func set(w io.Writer, args ...string) {
	if len(args) < 2 {
		fmt.Fprintln(w, "too few args, usage: set <key> <value>")
		return
	}

	key := args[0]
	value := args[1]
	err := p.S().Save(key, value)
	if err != nil {
		fmt.Fprintln(w, "set failed", err)
		return
	}
}

func del(w io.Writer, args ...string) {
	if len(args) < 1 {
		fmt.Fprintln(w, "too few args, usage: del <key>")
		return
	}

	key := args[0]
	err := p.S().Del(key)
	if err != nil {
		fmt.Fprintln(w, "del failed", err)
		return
	}
}

func has(w io.Writer, args ...string) {
	if len(args) < 1 {
		fmt.Fprintln(w, "too few args, usage: has <key>")
		return
	}

	key := args[0]
	has, err := p.S().Has(key)
	if err != nil {
		fmt.Fprintln(w, "has failed", err)
		return
	}
	fmt.Println(has)
}

func help(w io.Writer, args ...string) {
	fmt.Fprintln(w, `
list
get <key>
del <key>
has <key>
set <key> <value>
help
exit
	`)
}

func exec(w io.Writer, cmd string) {
	cmd = strings.TrimSpace(cmd)
	comps := strings.Split(cmd, " ")
	tokens := []string{}
	for _, comp := range comps {
		if len(comp) > 0 {
			tokens = append(tokens, comp)
		}
	}
	if len(tokens) == 0 {
		return
	}

	switch tokens[0] {
	case "list":
		list(w, tokens[1:]...)
	case "get":
		get(w, tokens[1:]...)
	case "del":
		del(w, tokens[1:]...)
	case "has":
		has(w, tokens[1:]...)
	case "set":
		set(w, tokens[1:]...)
	case "help":
		help(w, tokens[1:]...)
	default:
		fmt.Printf("unknown command `%v`, type `help` for usage\n", tokens[0])
	}
}

func repl() {
	scanner := bufio.NewScanner(os.Stdin)
	for {
		ok := scanner.Scan()
		if !ok {
			fmt.Println("read line error")
			continue
		}
		cmd := scanner.Text()

		if cmd == "exit" {
			break
		}

		exec(os.Stdout, cmd)
	}
}