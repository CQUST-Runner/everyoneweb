
const RANDOM_ID_SOURCE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789__________";
const RANDOM_STRING_SOURCE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz     ";

export function randomID(length: number): string {
    let s = '';
    for (let i = 0; i < length; i++) {
        s += choose(RANDOM_ID_SOURCE.split(''));
    }
    return s;
}

export function randomString(length: number): string {
    let s = '';
    for (let i = 0; i < length; i++) {
        s += choose(RANDOM_STRING_SOURCE.split(''));
    }
    return s;
}

export function randomStringMinMax(minLength: number, maxLength: number): string {
    if (minLength < 0 || maxLength < 0) {
        throw Error('');
    }
    if (minLength > maxLength) {
        let tmp = minLength;
        minLength = maxLength;
        maxLength = tmp;
    }
    let length = minLength + Math.floor(Math.random() * (maxLength - minLength + 1));
    return randomString(length);
}

export function choose<T>(a: T[]): T {
    if (a.length <= 0) {
        throw Error('');
    }
    return a[Math.floor(Math.random() * a.length)];
}

export function randomUrl(): string {
    let procotols = ['http', 'https'];
    let sub_domains = ['www.', ''];
    let top_domains = ['.com', '.org', '.net', '.gov', '.edu', '.io'];
    let domainName = randomID(3 + Math.floor(Math.random() * 10));
    let path = randomID(3 + Math.floor(Math.random() * 10));
    return `${choose(procotols)}://${choose(sub_domains)}${domainName}${choose(top_domains)}/${path}`
}

export function enumValues(a: any) {
    return Object.keys(a).filter(x => isNaN(Number(x))).map(x => a[x]);
}

export const API_SERVER = "http://127.0.0.1:16224/api";
