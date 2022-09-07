package main

import (
	"encoding/json"
	"strings"
	"time"

	"github.com/CQUST-Runner/datacross/storage"
)

type pageDao struct {
}

func (d *pageDao) create(p *Page) error {
	db := acquireDB()
	defer releaseDB()

	json, err := json.Marshal(p)
	if err != nil {
		return err
	}

	return db.Save(p.Id, string(json))
}

func (d *pageDao) delete(id string) error {
	db := acquireDB()
	defer releaseDB()

	return db.Del(id)
}

func (d *pageDao) get(id string) (*Page, error) {
	db := acquireDB()
	defer releaseDB()

	v, err := db.Load(id)
	if err != nil {
		return nil, err
	}
	val := mainValue(v)
	p := Page{}
	err = json.Unmarshal([]byte(val), &p)
	if err != nil {
		return nil, err
	}

	return &p, nil
}

func (d *pageDao) update(id string, data []byte) (*Page, error) {
	db := acquireDB()
	defer releaseDB()

	now := time.Now()

	p, err := d.get(id)
	if err != nil {
		return nil, err
	}

	// only updates fields specified in json
	err = json.Unmarshal(data, p)
	if err != nil {
		return nil, err
	}
	p.UpdateTime = &now

	val, err := json.Marshal(p)
	if err != nil {
		return nil, err
	}
	err = db.Save(id, string(val))
	if err != nil {
		return nil, err
	}
	return p, nil
}

func mainValue(v *storage.Value) string {
	s := v.Main().String()
	comp := strings.Split(s, "\t")
	if len(comp) >= 4 {
		return comp[1]
	}
	return ""
}

func (d *pageDao) all() ([]*Page, error) {
	db := acquireDB()
	defer releaseDB()

	v, err := db.All()
	if err != nil {
		return nil, err
	}

	pages := make([]*Page, 0, len(v))
	for _, vv := range v {
		if vv == nil {
			continue
		}
		p := Page{}
		err = json.Unmarshal([]byte(mainValue(vv)), &p)
		if err != nil {
			continue
		}
		pages = append(pages, &p)
	}
	return pages, nil
}
