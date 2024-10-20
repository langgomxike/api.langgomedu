
export enum LogType {
    "Warning",
    "Error",
    "Info"
}

const types = [console.warn, console.error, console.info];

export default class SLog {

    public static log(type: LogType = LogType.Info, header: string = "", message: string = "", data: unknown = {}) {

        //process the header (add space between each words)
        let newHeader = "";

        for (let i = 0; i < header.length; i++) {
            if (i >= 1 && header[i].match(/^[A-Z]$/)) {
                newHeader += " ";
            }

            newHeader += header[i];
        }

        //log the message
        console.log();
        console.log('========================================================================');
        console.group();
        console.log(types[type]);
        console.log("Header   ", newHeader?.toUpperCase());
        console.log("Message  ", message);
        console.log("Data     ", data);
        console.groupEnd();
        console.log('========================================================================');
        console.log();
    }
}