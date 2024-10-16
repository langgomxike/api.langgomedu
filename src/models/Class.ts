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
    public class_creation_fee: number;
    public class_level: ClassLevel | undefined;
    public max_learners: number;
    public started_at: number;
    public ended_at: number;
    public created_at: number;
    public updated_at: number;
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
        this.class_creation_fee = classCreationFee;
        this.class_level = classLevel;
        this.max_learners = maxLearners;
        this.started_at = startedAt.getTime();
        this.ended_at = endedAt.getTime();
        this.created_at = createdAt.getTime();
        this.updated_at = updatedAt.getTime();
        this.address1 = address1;
        this.address2 = address2;
        this.address3 = address3;
        this.address4 = address4;
    }
}