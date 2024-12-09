
import db from "../configs/knex";
import Address, { addressJson } from "./Address";
import ClassLevel, { classLevelJson } from "./ClassLevel";
import Major, { majorJson } from "./Major";
import User, { subqueryUser, userJson, userJsonwithoutName } from "./User";
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
    public started_at: number;
    public ended_at: number;
    public address: Address | undefined;
    public paid : boolean;
    public author_accepted: boolean;
    public admin_accepted: boolean;
    public created_at: number;
    public updated_at: number;
    public is_rating: boolean;

    constructor(id = -1, title = "", description = "", major: Major | undefined = undefined, tutor: User | undefined = undefined, author: User | undefined = undefined, price = 0, classCreationFee = 0, classLevel: ClassLevel | undefined = undefined,  maxLearners = 0, startedAt = 0, endedAt = 0, address: Address | undefined = undefined, paid = false, author_accepted = false, admin_accepted = false, createdAt = 0, updatedAt = 0, is_rating = false) {
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
        this.address = address;
        this.paid = paid;
        this.author_accepted = author_accepted;
        this.admin_accepted = admin_accepted;
        this.created_at = createdAt;
        this.updated_at = updatedAt;
        this.is_rating = is_rating
    }
}

export const classJson = (asName: string): string => {
    return `JSON_OBJECT(
    'id', ${asName}.id,
    'title', ${asName}.title,
    'description', ${asName}.description,
    'major', ${asName}.major_id,
    'tutor', ${asName}.tutor_id,
    'author', ${asName}.author_id,
    'price', ${asName}.price,
    'class_creation_fee', ${asName}.class_creation_fee,
    'class_level', ${asName}.class_level_id,
    'max_learners', ${asName}.max_learners,
    'started_at', ${asName}.started_at,
    'ended_at', ${asName}.ended_at,
    'address', ${asName}.address_id,
    'paid', ${asName}.paid,
    'author_accepted', ${asName}.author_accepted,
    'admin_accepted', ${asName}.admin_accepted,
    'created_at', ${asName}.created_at,
    'updated_at', ${asName}.updated_at
)`;
}

export const  classWithTutorJson = (asName: string): string => {
    return `JSON_OBJECT(
    'id', ${asName}.id,
    'title', ${asName}.title,
    'description', ${asName}.description,
    'major', (${majorJson('major')}),
    'tutor', (${userJsonwithoutName('tutor', 'tutor_address', 'tutor_gender')}),
    'author', ${asName}.author_id,
    'price', ${asName}.price,
    'class_creation_fee', ${asName}.class_creation_fee,
    'class_level', (${classLevelJson('class_levels')}),
    'max_learners', ${asName}.max_learners,
    'started_at', ${asName}.started_at,
    'ended_at', ${asName}.ended_at,
    'address', ${addressJson('address')},
    'paid', ${asName}.paid,
    'author_accepted', ${asName}.author_accepted,
    'admin_accepted', ${asName}.admin_accepted,
    'created_at', ${asName}.created_at,
    'updated_at', ${asName}.updated_at
)`;
}