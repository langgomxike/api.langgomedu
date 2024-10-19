import Information from "./Information";
import User from "./User";
import Skill from "./Skill";

export default class CV {
    public user: User | undefined
    public information: Information | undefined
    public biography: string;
    public title: string;
    public approved_at: Date;
    public skills: Skill[] = [];

    constructor(user: User | undefined = undefined, information: Information | undefined = undefined, biography = "", title = "", approved_at = new Date(), skills: Skill[] = []) {
        this.user = user;
        this.information = information;
        this.biography = biography;
        this.title = title;
        this.approved_at = approved_at;
        this.skills = skills;
    }
}