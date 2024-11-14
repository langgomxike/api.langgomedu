import Class from "./Class";
import User from "./User";

export default class Rating {
    public rater: User | undefined; //[note: "ID của người đánh giá (người học)"]
    public ratee: User | undefined; //[note: "-- ID của người được đánh giá (người dạy)"]
    public rating_value: number;
    public content: string;
    public class: Class | undefined;
    public created_at: number;

    constructor(rater: User | undefined = undefined, ratee: User | undefined = undefined, ratingValue = 0, content = "", _class: Class | undefined = undefined, createdAt = new Date()) {
        this.rater = rater;
        this.ratee = ratee;
        this.rating_value = ratingValue;
        this.content = content;
        this.class = _class;
        this.created_at = createdAt.getTime();
    }
}