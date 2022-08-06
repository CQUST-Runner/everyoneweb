import * as moment from "moment"

export type PageType = 'pdf' | 'singlePage' | 'html+assets'

export type PageSource = 'chrome-extension' | 'firefox-extension' | 'desktop-app' | 'web-app'

export type ImportMethod = 'save' | 'import'

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface Page {
    sourceUrl: string
    id: string
    saveTime: moment.Moment
    updateTime: moment.Moment
    remindReadingTime: moment.Moment
    filePath: string
    type: PageType
    source: PageSource
    method: ImportMethod
    tags: string[]
    category: string
    title: string
    desc: string
    rating: Rating
}
