package main

import (
	"os"
	"path"
	"sync"
	"time"

	"github.com/CQUST-Runner/datacross/storage"
)

const cacheDirectory = ".cache"

type pageCache struct {
	page      *Page
	cacheTime time.Time
	mu        sync.Mutex
}

var cache sync.Map
var mu sync.Mutex

// caller must unlock the returned cache
func saveAsCache(url string) (*pageCache, error) {
	page, err := doSave(&Page{SourceUrl: url}, true)
	if err != nil {
		return nil, err
	}

	pc := &pageCache{page: page, cacheTime: time.Now()}
	pc.mu.Lock()

	mu.Lock()
	defer mu.Unlock()

	loaded := tryGet(url)
	if loaded != nil {
		err := os.Remove(page.FilePath)
		if err != nil {
			logger.Warn("del page cache file failed:%v", err)
		}
		return loaded, nil
	}

	cache.Store(url, pc)
	return pc, nil
}

// caller must unlock the returned cache
func tryGet(url string) *pageCache {
	value, ok := cache.Load(url)
	if !ok {
		return nil
	}
	pc := value.(*pageCache)
	pc.mu.Lock()
	if _, ok = cache.Load(url); !ok {
		return nil
	}
	return pc
}

func delCache(url string) {
	pc := tryGet(url)
	if pc == nil {
		return
	}
	defer pc.mu.Unlock()
	cache.Delete(url)
	err := os.Remove(pc.page.FilePath)
	if err != nil {
		logger.Warn("remove cached page file failed:%v", err)
	}
}

func regularlyCleanCache() {
	dd := path.Join(config().Settings.DataDirectory, cacheDirectory)
	dd = path.Clean(dd)
	if storage.IsDir(dd) && len(dd) > 10 {
		err := os.RemoveAll(dd)
		if err != nil {
			logger.Error("remove cache direcotry failed:%v", err)
		}
	}

	ticker := time.Tick(5 * time.Minute)
	for range ticker {
		keys := []string{}
		cache.Range(func(key, value any) bool {
			pc := value.(*pageCache)
			if time.Since(pc.cacheTime) > 5*time.Minute {
				keys = append(keys, key.(string))
			}
			return true
		})
		for _, key := range keys {
			delCache(key)
		}
	}
}
