import UserReport from "./UserReport";
import File from "./File";

export default class UserReportFile {
    public report: UserReport | undefined;
    public file: File | undefined;

    constructor(file: File | undefined = undefined, report: UserReport | undefined = undefined){
        this.report = report;
        this.file = file;
    }
}