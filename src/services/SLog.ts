
export enum LogType {
    "Warning",
    "Error",
    "Info"
}

const types = [console.warn, console.error, console.info];

export default class SLog {

    public static log(type: LogType = LogType.Info, header: string = "", message: string = "", data: unknown = {}) {
        console.group();
        console.log(types[type]);
        console.log("Header   ", header?.toUpperCase());
        console.log("Message  ", message);
        console.log("Data     ", data);
        console.groupEnd();
    }
}