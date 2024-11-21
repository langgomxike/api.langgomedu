import Class from "./Class";
import Level from "./Level";
import User from "./User";

export default class Report {
    public id: number;
    public reporter: User | undefined;
    public reportee: User | undefined;
    public class: Class | undefined;
    public content: string;
    public reason: string;
    public report_level: Level | undefined;
    public createdAt: Date;

    constructor(
        id = -1,
        reporter: User | undefined = undefined,
        reportee: User | undefined = undefined,
        classObj: Class | undefined = undefined,
        content = "",
        reason = "",
        report_level: Level | undefined = undefined,
        createdAt = new Date()
    ) {
        this.id = id;
        this.reporter = reporter;
        this.reportee = reportee;
        this.class = classObj;
        this.content = content;
        this.reason = reason;
        this.report_level = report_level;
        this.createdAt = createdAt;
    }
}

export const reportJson = (asName: string):string =>{
    return `JSON_OBJECT(
    'id', ex.id,
    'reporter', ex.reporter_id,
    'reportee', ex.reportee_id,
    'class', ex.class_id,
    'content', ex.content,
    'reason', ex.reason,
    'level', ex.level_id,
    'desc_point', ex.desc_point,
    'status', ex.status_id,
    'created_at', ex.created_at,
    'updated_at', ex.updated_at
)`;
}
