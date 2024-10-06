import { DTO } from "./DTO";
import Class from "../models/Class";
import User from "../models/User";
import Rating from "../models/Rating";

export default class RatingDTO implements DTO {
    //properties
    public rater: User | undefined; //[note: "ID của người đánh giá (người học)"]
    public ratee: User | undefined; //[note: "-- ID của người được đánh giá (người dạy)"]
    public ratingValue: number;
    public content: string;
    public class: Class | undefined;
    public createdAt: Date;

    //constructor
    constructor(rater: User | undefined = undefined, ratee: User | undefined = undefined, ratingValue = 0, content = "", _class: Class | undefined = undefined, createdAt = new Date()) {
        this.rater = rater;
        this.ratee = ratee;
        this.ratingValue = ratingValue;
        this.content = content;
        this.class = _class;
        this.createdAt = createdAt;
    }

    //method
    public fromModel(rating: Rating) {
        if(rating){
            return new RatingDTO(
                rating.rater,
                rating.ratee,
                rating.ratingValue,
                rating.content,
                rating.class,
                rating.createdAt
            )
        }
    }
}