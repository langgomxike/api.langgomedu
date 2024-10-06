import { DTO } from "./DTO";
import Major from "../models/Major";
import User from "../models/User";
import Experience from "../models/Experience";

export default class ExperienceDTO implements DTO {
    //properties
    public id: number;
    public user: User | undefined;
    public title: string;
    public major: Major | undefined;
    public address: string;
    public initial: boolean;// [note: "0: automatically added, 1: initially added"]
    public approved: boolean // [note: "0: waiting to be approved, 1: approved"]
    public startedAt: Date;
    public endedAt: Date;
    //constructor
    constructor(
        id = -1, 
        user: User | undefined = undefined, 
        title = "", 
        major: Major | undefined = undefined,
        address = "", 
        initial = true, 
        approved = false, 
        startedAt = new Date(), 
        endedAt = new Date()
    ) {
        this.id = id;
        this.user = user;
        this.title = title;
        this.major = major;
        this.address = address;
        this.initial = initial;
        this.approved = approved;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
    }
    //methods 
    public fromModel(experience : Experience) {
        if(experience){
            return new ExperienceDTO(
                experience.id,
                experience.user,
                experience.title,
                experience.major,
                experience.address,
                experience.initial,
                experience.approved,
                experience.startedAt,
                experience.endedAt
            )
        }
    }
}