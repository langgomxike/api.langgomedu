import Class from "./Class";
import User from "./User";
import File from "./File";

export default class ClassReport {
    public id: number;
    public class: Class | undefined //[note: "author của class là người bị báo cáo"]
    public user: User | undefined; //[note: "user báo cáo khác author"]
    public content: string;
    public files: File[] | undefined;
    public created_at: Date;

    constructor(id = -1, _class: Class | undefined = undefined, user: User | undefined = undefined, content = "", created_at = new Date(), files: File[] | undefined = undefined) {
        this.id = id;
        this.user = user;
        this.content = content;
        this.class = _class;
        this.created_at = created_at;
        this.files = files;
    }

}