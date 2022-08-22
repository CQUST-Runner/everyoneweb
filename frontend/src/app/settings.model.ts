export interface Settings {
    firstScreen: string
    language: string
    dataDirectory: string
    machineID: string
    serveLibrary: boolean
    serveLibraryPort: number
    showLogsEntry: boolean
}


export function getConfig(): Settings {
    let config: Settings = (window as any).config;
    return config || {
        firstScreen: "new",
        dataDirectory: "./data",
        language: "auto",
        machineID: "machine0",
        serveLibrary: true,
        serveLibraryPort: 16224,
        showLogsEntry: false
    };
}
