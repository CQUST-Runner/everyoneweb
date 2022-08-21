export interface Settings {
    firstScreen: string
    language: string
    dataDirectory: string
    machineID: string
    serveLibrary: boolean
    serveLibraryPort: number
    showLogsEntry: boolean
}


declare var config: Settings | undefined;

export function getConfig(): Settings {
    if (config) {
        return config;
    }
    return {
        firstScreen: "new",
        dataDirectory: "./data",
        language: "auto",
        machineID: "machine0",
        serveLibrary: true,
        serveLibraryPort: 16224,
        showLogsEntry: false
    };
}

export function setConfig(settings: Settings) {
    config = settings;
}
