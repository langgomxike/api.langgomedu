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
    public started_at: Date;
    public ended_at: Date;
    public created_at: Date;
    public updated_at: Date;
    public address_1: string;
    public address_2: string;
    public address_3: string;
    public address_4: string;

    constructor(
        id = -1,
        title = "",
        description = "",
        major: Major | undefined = undefined,
        tutor: User | undefined = undefined,
        author: User | undefined = undefined,
        price = 0,
        class_creation_fee = 0,
        class_level: ClassLevel | undefined = undefined,
        max_learners = 0,
        started_at = new Date(),
        ended_at = new Date(),
        created_at = new Date(),
        updated_at = new Date(),
        address_1 = "",
        address_2 = "",
        address_3 = "",
        address_4 = ""
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.major = major;
        this.tutor = tutor;
        this.author = author;
        this.price = price;
        this.class_creation_fee = class_creation_fee;
        this.class_level = class_level;
        this.max_learners = max_learners;
        this.started_at = started_at;
        this.ended_at = ended_at;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.address_1 = address_1;
        this.address_2 = address_2;
        this.address_3 = address_3;
        this.address_4 = address_4;
    }
}
