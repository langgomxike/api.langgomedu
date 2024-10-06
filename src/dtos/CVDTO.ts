import { DTO } from "./DTO";
import User from "../models/User";
import CV from "../models/CV";

export default class CVDTO implements DTO {
    //properties
    public user : User | undefined;
    public biography: string;
    public title: string;

    //constructor
    constructor(
        user: User|undefined = undefined,
        biography = '',
        title = '',
    ) {
        this.user = user;
        this.biography = biography;
        this.title = title;
    }

    //method
    public fromModel(cv : CV) {
        if(cv){
            return new CVDTO(
                cv.user instanceof User ? cv.user : undefined,
                cv.biography,
                cv.title
            )
        }
    }
}