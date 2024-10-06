import Class from "../models/Class";
import ClassLevel from "../models/ClassLevel";
import Major from "../models/Major";
import User from "../models/User";
import { DTO } from "./DTO";

export default class ClassDTO implements DTO {
    //properties
    public id: number;
    public title: string;
    public description: string;
    public major: Major | undefined;
    public tutor: User | undefined;
    public author: User | undefined;
    public price: number;
    public classCreationFee: number;
    public classLevel: ClassLevel | undefined;
    public maxLearner: number;
    public startedAt: Date;
    public endedAt: Date;
    //constructor
    constructor(
        id = -1,
        title = '',
        desc = '',
        major: Major| undefined = undefined,
        tutor: User|undefined = undefined,
        author: User|undefined = undefined,
        price = 0,
        classCreationFee = 0,
        classLevel: ClassLevel|undefined = undefined,
        maxLearner = 0,
        startedAt = new Date(),
        endedAt= new Date(),
    ){
        this.id = id;
        this.title = title;
        this.description = desc;
        this.major = major;
        this.tutor = tutor;
        this.author = author;
        this.price = price;
        this.classCreationFee = classCreationFee;
        this.classLevel = classLevel;
        this.maxLearner = maxLearner;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
    }
    //methods
    public fromModel(_class: Class) {
        if(_class){
            return new ClassDTO(
                _class.id,
                _class.title,
                _class.description,
                _class.major instanceof Major ? _class.major : undefined,
                _class.tutor instanceof User ? _class.tutor : undefined,
                _class.author instanceof User ? _class.author : undefined,
                _class.price,
                _class.classCreationFee,
                _class.classLevel,
                _class.maxLearners,
                _class.startedAt,
                _class.endedAt
            )
        }
    }

}