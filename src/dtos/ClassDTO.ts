import Class from "../models/Class";
import MajorDTO from './MajorDTO';
import UserDTO from "./UserDTO";
import ClassLevelDTO from './ClassLevelDTO';

export default class ClassDTO {
    //properties
    public id: number;
    public title: string;
    public description: string;
    public major: MajorDTO | undefined;
    public tutor: UserDTO | undefined;
    public author: UserDTO | undefined;
    public price: number;
    public class_creation_fee: number;
    public class_level: ClassLevelDTO | undefined;
    public max_learner: number;
    public started_at: number;
    public ended_at: number;
    public created_at: number;
    public updated_at: number;
    public address_1: string;
    public address_2: string;
    public address_3: string;
    public address_4: string;

    //constructor
    constructor(
        _class: Class
    ) {
        this.id = _class.id;
        this.title = _class.title;
        this.description = _class.description;
        this.major = _class.major && new MajorDTO(_class.major) || undefined;
        this.tutor = _class.tutor && new UserDTO(_class.tutor) || undefined;
        this.author = _class.author && new UserDTO(_class.author) || undefined;
        this.price = _class.price;
        this.class_creation_fee = _class.classCreationFee;
        this.class_level = _class.classLevel && new ClassLevelDTO(_class.classLevel) || undefined;
        this.max_learner = _class.maxLearners;
        this.started_at = _class.startedAt.getTime();
        this.ended_at = _class.endedAt.getTime();
        this.created_at = _class.createdAt.getTime();
        this.updated_at = _class.updatedAt.getTime();
        this.address_1 = _class.address1;
        this.address_2 = _class.address2;
        this.address_3 = _class.address3;
        this.address_4 = _class.address4;
    }
}