import { DTO } from "./DTO";
import ClassLevel from "../models/ClassLevel";

export default class ClassLevelDTO implements DTO{
    //properties
    public id: number;
    public vnName: string;
    public jpName: string;
    public enName: string;
    //constructor
    constructor(
        id = -1,
        vnName = '',
        jpName = '',
        enName = '',
    ){
        this.id = id;
        this.vnName = vnName;
        this.jpName = jpName;
        this.enName = enName;
    }

    //methods
    public fromModel(classLevel : ClassLevel) {
        if(classLevel){
            return new ClassLevelDTO(
                classLevel.id,
                classLevel.vnName,
                classLevel.jaName,
                classLevel.enName,
            )
        }
    }
}