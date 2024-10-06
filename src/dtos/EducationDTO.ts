import { DTO } from "./DTO";
import User from "../models/User";
import Education from "../models/Education";

export default class EducationDTO implements DTO{
    //properties
    public id: number;
    public user: User | undefined;
    public title: string;
    public description: string;
    public startedAt: Date;
    public endedAt: Date;
    //constructor
    constructor(
        id = -1, 
        user: User | undefined = undefined, 
        title = "", 
        description = "", 
        startedAt = new Date(), 
        endedAt = new Date()
    ) {
        this.id = id;
        this.user = user;
        this.title = title;
        this.description = description;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
    }

    //methods
    public fromModel(education : Education) {
        if(education){
            return new EducationDTO(
                education.id,
                education.user,
                education.title,
                education.description,
                education.startedAt,
                education.endedAt
            )
        }
    }
}