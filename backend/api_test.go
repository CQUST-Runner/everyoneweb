package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

const apiPrefix = "http://127.0.0.1:16224/api"

func randPage() *Page {
	p := Page{}
	p.Category = "Boots"
	p.Tags = []string{"Lemon", "Apple", "Lime"}
	p.SourceUrl = randID(IDLength)
	p.Tp = PageTypeSinglePage
	p.Source = PageSourceWebApp
	p.Desc = "1111122222"
	p.Method = ImportMethodSave
	now := time.Now()
	p.SaveTime = &now
	return &p
}

func testSavePageInternal(t assert.TestingT, p *Page) *Page {
	val, err := json.Marshal(p)
	assert.Nil(t, err)
	resp, err := http.Post(apiPrefix+"/page/new", "text/json", bytes.NewReader(val))
	assert.Nil(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	assert.Nil(t, err)

	newPage := Page{}
	err = json.Unmarshal(body, &newPage)
	assert.Nil(t, err)
	return &newPage
}

func TestSavePage(t *testing.T) {
	p := randPage()
	testSavePageInternal(t, p)
}

func testGetPage(id string) (*Page, error) {
	resp, err := http.Get(apiPrefix + "/page/" + id)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status code:%v", resp.StatusCode)
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	fmt.Println(string(body))
	p := Page{}
	err = json.Unmarshal(body, &p)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func TestGetPage(t *testing.T) {
	page := randPage()
	newPage := testSavePageInternal(t, page)
	result, err := testGetPage(newPage.Id)
	assert.Nil(t, err)
	assert.NotNil(t, result)
	fmt.Println(result)
}
