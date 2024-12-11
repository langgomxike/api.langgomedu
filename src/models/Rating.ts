import Class from "./Class";
import User, { userForRatingsJSON } from "./User";
import db from "../configs/knex";
import { Knex } from "knex";

export default class Rating {
    public id : number;
    public rater: User | undefined; //[note: "ID của người đánh giá (người học)"]
    public ratee: User | undefined; //[note: "-- ID của người được đánh giá (người dạy)"]
    public value: number;
    public content: string;
    public class: Class | undefined;
    public created_at: number;
    public updated_at: number;

    constructor(rater: User | undefined = undefined, ratee: User | undefined = undefined, value = 0, content = "", _class: Class | undefined = undefined, created_at = 0, updated_at = 0) {
        this.rater = rater;
        this.ratee = ratee;
        this.value = value;
        this.content = content;
        this.class = _class;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

export const ratingJson = (asName: string):string => {
    return `JSON_OBJECT(
    'id', ex.id,
    'rater', ex.rater_id,
    'ratee', ex.ratee_id,
    'value', ex.value,
    'content', ex.content,
    'class', ex.class_id,
    'created_at', ex.created_at,
    'updated_at', ex.updated_at
)`;
}

export const ratingJsonWithRater = (alias: string, userAlias): string => {
    return `JSON_OBJECT(
    'id', ${alias}.id,
    'rater', ${userForRatingsJSON(userAlias)},
    'ratee', ${alias}.ratee_id,
    'value', ${alias}.value,
    'content', ${alias}.content,
    'created_at', ${alias}.created_at,
    'updated_at', ${alias}.updated_at
) as rating`
}
export const ratingJoin = (reference: string, raterAlias: string, rateeAlias: string, query: Knex.QueryBuilder): Knex.QueryBuilder => {
    return query
    .leftJoin(`users as ${raterAlias}`, `${raterAlias}.id`, `${reference}.rater_id`)
    .leftJoin(`users as ${rateeAlias}`, `${rateeAlias}.id`, `${reference}.ratee_id`)
}