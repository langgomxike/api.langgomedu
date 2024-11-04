
import ClassLevel from "./ClassLevel";
import Major from "./Major";
import User from "./User";
import { QueryResult, RowDataPacket } from 'mysql2';

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
    public type: string[];
    public duration: number;
    public max_learners: number;
    public started_at: number;
    public ended_at: number;
    public created_at: number;
    public updated_at: number;
    public address_1: string;
    public address_2: string;
    public address_3: string;
    public address_4: string;
    public user_status: string;

    constructor(id = -1, title = "", description = "", major: Major | undefined = undefined, tutor: User | undefined = undefined, author: User | undefined = undefined, price = 0, classCreationFee = 0, classLevel: ClassLevel | undefined = undefined, type: string[] = [], duration = 0, maxLearners = 0, startedAt = new Date(), endedAt = new Date(), createdAt = new Date(), updatedAt = new Date(), address_1 = "", address_2 = "", address_3 = "", address_4 = "", user_status = "") {
        this.id = id;
        this.title = title;
        this.description = description;
        this.major = major;
        this.tutor = tutor;
        this.author = author;
        this.price = price;
        this.class_creation_fee = classCreationFee;
        this.class_level = classLevel;
        this.type = type;
        this.duration = duration;
        this.max_learners = maxLearners;
        this.started_at = startedAt.getTime();
        this.ended_at = endedAt.getTime();
        this.created_at = createdAt.getTime();
        this.updated_at = updatedAt.getTime();
        this.address_1 = address_1;
        this.address_2 = address_2;
        this.address_3 = address_3;
        this.address_4 = address_4;
        this.user_status = user_status;
    }
}
