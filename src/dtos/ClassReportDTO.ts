import { DTO } from "./DTO";
import ClassReport from "../models/ClassReport";
import User from "../models/User";
import Class from "../models/Class";

export default class ClassReportDTO {
    //properties
    public id: number;
    public class: Class |undefined;
    public user: User | undefined;
    public content: string;
    public createdAt: Date;
    //constructor
    constructor(
        id = -1,
        _class: Class | undefined,
        user: User | undefined,
        content: '',
        created_at = new Date(),
    ){
        this.id = id;
        this.class = _class;
        this.user = user;
        this.content = content;
        this.createdAt = created_at;
    }
}