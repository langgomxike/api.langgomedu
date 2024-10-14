import ClassDTO from "../dtos/ClassDTO";
import ClassLevel from "./ClassLevel";
import Major from "./Major";
import User from "./User";

export default class Class {
    public id: number;
    public title: string;
    public description: string;
    public major: Major | undefined;
    public tutor: User | undefined;
    public author: User | undefined;
    public price: number;
    public classCreationFee: number;
    public classLevel: ClassLevel | undefined;
    public maxLearners: number;
    public startedAt: Date;
    public endedAt: Date;
    public createdAt: Date;
    public updatedAt: Date;
    public address1: string;
    public address2: string;
    public address3: string;
    public address4: string;

    constructor(id = -1, title = "", description = "", major: Major | undefined = undefined, tutor: User | undefined = undefined, author: User | undefined = undefined, price = 0, classCreationFee = 0, classLevel: ClassLevel | undefined = undefined, maxLearners = 0, startedAt = new Date(), endedAt = new Date(), createdAt = new Date(), updatedAt = new Date(), address1 = "", address2 = "", address3 = "", address4 = "") {
        this.id = id;
        this.title = title;
        this.description = description;
        this.major = major;
        this.tutor = tutor;
        this.author = author;
        this.price = price;
        this.classCreationFee = classCreationFee;
        this.classLevel = classLevel;
        this.maxLearners = maxLearners;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.address1 = address1;
        this.address2 = address2;
        this.address3 = address3;
        this.address4 = address4;
    }
}