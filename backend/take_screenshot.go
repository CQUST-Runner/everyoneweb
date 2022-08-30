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

	// capture entire browser viewport, returning png with quality=90
	var buf []byte
	if err := chromedp.Run(ctx, fullScreenshot(url, 90, &buf)); err != nil {
		return err
	}
	if err := ioutil.WriteFile(outputFileName, buf, 0o644); err != nil {
		return err
	}
	return nil
}

// fullScreenshot takes a screenshot of the entire browser viewport.
//
// Note: chromedp.FullScreenshot overrides the device's emulation settings. Use
// device.Reset to reset the emulation and viewport settings.
func fullScreenshot(urlstr string, quality int, res *[]byte) chromedp.Tasks {
	return chromedp.Tasks{
		chromedp.Navigate(urlstr),
		chromedp.FullScreenshot(res, quality),
	}
}
