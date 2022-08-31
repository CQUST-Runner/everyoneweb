package main

import (
	"context"
	"io/ioutil"

	"github.com/chromedp/chromedp"
)

// https://github.com/chromedp/examples/blob/624159fa92d3797270ddc7f5d652c6907cc2a6ef/screenshot/main.go#L1
func takeScreenShot(url string, outputFileName string) error {
	// create context
	ctx, cancel := chromedp.NewContext(
		context.Background(),
		// chromedp.WithDebugf(log.Printf),
	)
	defer cancel()

	var buf []byte
	if err := chromedp.Run(ctx, captureScreenshot(url, &buf)); err != nil {
		return err
	}
	if err := ioutil.WriteFile(outputFileName, buf, 0o644); err != nil {
		return err
	}
	return nil
}

func captureScreenshot(urlstr string, res *[]byte) chromedp.Tasks {
	return chromedp.Tasks{
		chromedp.Navigate(urlstr),
		chromedp.EmulateViewport(1200, 800),
		chromedp.CaptureScreenshot(res),
	}
}
