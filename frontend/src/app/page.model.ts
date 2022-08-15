import * as moment from "moment"
import { choose, enumValues, randomID, randomStringMinMax, randomUrl } from "./common"
import * as faker from "@faker-js/faker"

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
    sourceTitle: string
    title: string
    desc: string
    rating: Rating
    markedAsRead: boolean
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
    let title = faker.faker.hacker.phrase();
    return {
        sourceUrl: faker.faker.internet.url(),
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
        title: title,
        sourceTitle: title,
        desc: faker.faker.hacker.phrase(),
        rating: choose(enumValues(Rating)) as Rating,
        markedAsRead: false,
    };

}
