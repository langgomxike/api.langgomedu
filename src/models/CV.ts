import Information from "./Information";
import User from "./User";

export default class CV {
    public user: User | undefined
    public biography: string;
    public title: string;
    public approved_at: Date;
    public updated_at: Date;

    constructor(user: User | undefined = undefined, biography = "", title = "", approved_at : number,updated_at : number) {
        this.user = user;
        this.biography = biography;
        this.title = title;
        this.approved_at = new Date(approved_at);
        this.updated_at = new Date(updated_at);
    }
}