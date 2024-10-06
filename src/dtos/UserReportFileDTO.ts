import { DTO } from "./DTO";
import UserReport from "../models/UserReport";
import File from "../models/File";
import UserReportFile from "../models/UserReportFile";

export default class UserReportFileDTO implements DTO{
    //properties
    public report: UserReport | undefined;
    public file: File | undefined;

    //constructor
    constructor(file: File | undefined = undefined, report: UserReport | undefined = undefined){
        this.report = report;
        this.file = file;
    }

    //methods
    public fromModel(userReportFile : UserReportFile) {
        if(userReportFile){
            return new UserReportFileDTO(
                userReportFile.file,
                userReportFile.report
            )
        }
    }
}