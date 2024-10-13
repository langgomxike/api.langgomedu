import { DTO } from "./DTO";
import ClassLevel from "../models/ClassLevel";

export default class ClassLevelDTO {
    //properties
    public id: number;
    public vn_name: string;
    public jp_name: string;
    public en_name: string;

    //constructor
    constructor(classLevel: ClassLevel) {
        this.id = classLevel.id;
        this.vn_name = classLevel.vnName;
        this.jp_name = classLevel.jpName;
        this.en_name = classLevel.enName;
    }
}