import { DTO } from "./DTO";
import Major from "../models/Major";

export default class MajorDTO implements DTO {
    //properties
    public id: number;
    public vnName: string;
    public jaName: string;
    public enName: string;

    //constructor
    constructor(id = -1, vnName = "", jaName = "", enName = "") {
        this.id = id;
        this.vnName = vnName;
        this.jaName = jaName;
        this.enName = enName;
    }

    //method
    public fromModel(major : Major) {
        if(major){
            return new MajorDTO(
                major.id,
                major.vnName,
                major.jaName,
                major.enName
            )
        }
    }
}