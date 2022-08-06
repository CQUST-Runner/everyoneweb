import * as moment from "moment"

export enum PageType {
    PDF = 'pdf',
    SinglePage = 'singlePage',
    HtmlAssets = 'html+assets',
};

export enum PageSource {
    ChromeExtension = 'chrome-extension',
    FirefoxExtension = 'firefox-extension',
    DesktopApp = 'desktop-app',
    WebApp = 'web-app',
};

export enum ImportMethod {
    Save = 'save',
    Import = 'import',
};

export enum Rating {
    One = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
};

export interface Page {
    sourceUrl: string
    id: string
    saveTime: moment.Moment
    updateTime: moment.Moment | undefined
    remindReadingTime: moment.Moment | undefined
    filePath: string
    type: PageType
    source: PageSource
    method: ImportMethod
    tags: string[]
    category: string
    title: string
    desc: string
    rating: Rating
};
