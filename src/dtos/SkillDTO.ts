import File from "../models/File";
import Skill from "../models/Skill";
import { DTO } from "./DTO";

export default class SkillDTO implements DTO {
    //properties
    public id: number;
    public vnName: string;
    public enName: string;
    public jaName: string;
    public progressPercent: number;
    public icon: File | undefined;

    //constructor
    constructor(id = -1, vnName = "", enName = "", jaName = "", progressPercent = 0, icon: File | undefined = undefined) {
        this.id = id;
        this.vnName = vnName;
        this.enName = enName;
        this.jaName = jaName;
        this.progressPercent = progressPercent;
        this.icon = icon;
    }

    //methods
    public fromModel(skill: Skill) {
        if(skill){
            return new SkillDTO(
                skill.id,
                skill.vnName,
                skill.enName,
                skill.jaName,
                skill.progressPercent,
                skill.icon
            )
        }
    }
}