import Class from "./Class";
import User from "./User";

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