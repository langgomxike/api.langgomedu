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
    public max_learners: number;
    public started_at: Date;
    public ended_at: Date;
    public created_at: Date;
    public updated_at: Date;
    public address_1: string;
    public address_2: string;
    public address_3: string;
    public address_4: string;

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
        this.started_at = startedAt;
        this.ended_at = endedAt;
        this.created_at = createdAt;
        this.updated_at = updatedAt;
        this.address_1 = address1;
        this.address_2 = address2;
        this.address_3 = address3;
        this.address_4 = address4;
    }
}