package main

import "os/exec"

func runCmd(cmd *exec.Cmd) error {
	return cmd.Run()
}
