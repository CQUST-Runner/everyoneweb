import * as moment from "moment"
import { choose, enumValues, randomID, randomStringMinMax, randomUrl } from "./common"

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

let CATEGORIES: string[] = [
    'Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];

let TAGS: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];

export function createRandomPage(): Page {
    let tags: string[] = [];
    let tagNumbers: number[] = [0, 0, 0, 1, 1, 1, 1, 2, 2, 3];
    let tagNumber = choose(tagNumbers);
    for (let i = 0; i < tagNumber; i++) {
        tags.push(choose(TAGS));
    }
    let id = randomID(6);
    let saveTime = Math.floor(Math.random() * 31);
    let updateTime = Math.floor(Math.random() * saveTime);
    return {
        sourceUrl: randomUrl(),
        id: id,
        saveTime: moment().subtract(saveTime, 'days'),
        updateTime: choose([moment().subtract(updateTime), undefined, undefined]),
        remindReadingTime: choose([moment().add(Math.floor(Math.random() * 8), 'days'), undefined, undefined, undefined, undefined]),
        filePath: id + '.html',
        type: choose(enumValues(PageType)) as PageType,
        source: choose(enumValues(PageSource)) as PageSource,
        method: choose(enumValues(ImportMethod)) as ImportMethod,
        tags: tags,
        category: choose(CATEGORIES),
        title: randomStringMinMax(5, 15),
        desc: randomStringMinMax(50, 100),
        rating: choose(enumValues(Rating)) as Rating,
    };
}
