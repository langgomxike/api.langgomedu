import { DTO } from "./DTO";
import Major from "../models/Major";

export default class MajorDTO {
    //properties
    public id: number;
    public vnName: string;
    public jaName: string;
    public enName: string;

    //constructor
    constructor(major: Major) {
        this.id = major.id;
        this.vnName = major.vnName;
        this.jaName = major.jaName;
        this.enName = major.enName;
    }
}